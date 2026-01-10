use anchor_lang::prelude::*;

declare_id!("6fuSCXdjP9wKi8GE8xXZkCERS1rrvFfuxSVK5sySazh6");

#[program]
pub mod piverse {
    use super::*;

    // --- GAME LOGIC ---

    pub fn initialize_game(
        ctx: Context<InitializeGame>, 
        game_id: u64,
        duration_seconds: i64,
        attempt_price: u64,
        ghost: Pubkey,
        dev_wallet: Pubkey
    ) -> Result<()> {
        let game = &mut ctx.accounts.game_state;
        let clock = Clock::get()?;

        game.game_id = game_id;
        game.authority = *ctx.accounts.authority.key;
        game.ghost = ghost;
        game.dev_wallet = dev_wallet;
        game.jackpot = 0;
        game.total_attempts = 0;
        game.is_active = true;
        
        // Session Config
        game.attempt_price = attempt_price;
        game.start_time = clock.unix_timestamp;
        game.end_time = clock.unix_timestamp + duration_seconds;

        // Market Defaults
        game.pool_fail = 0;
        game.pool_breach = 0;
        game.market_status = MarketStatus::Active;
        game.bump = ctx.bumps.game_state;
        
        Ok(())
    }

    pub fn submit_attempt(ctx: Context<SubmitAttempt>, message_hash: String) -> Result<()> {
        let game = &mut ctx.accounts.game_state;
        let clock = Clock::get()?;

        // Guards
        require!(game.is_active, GameError::GameEnded);
        require!(clock.unix_timestamp < game.end_time, GameError::GameExpired);

        // Dynamic Fee
        let payment_amount = game.attempt_price;
        let treasury_share = payment_amount * 20 / 100; // 20%
        let jackpot_share = payment_amount - treasury_share; // 80%

        // 1. Transfer to Dev Wallet (20% revenue share)
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: ctx.accounts.dev_wallet.to_account_info(),
                },
            ),
            treasury_share,
        )?;

        // 2. Transfer to Game Vault (Jackpot)
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: ctx.accounts.game_vault.to_account_info(),
                },
            ),
            jackpot_share,
        )?;

        game.jackpot += jackpot_share;
        game.total_attempts += 1;

        emit!(AttemptEvent {
            user: *ctx.accounts.user.key,
            message_hash,
            timestamp: clock.unix_timestamp,
            attempt_number: game.total_attempts,
            price: payment_amount
        });

        Ok(())
    }

    // Called by Oracle/Backend (or Ghost) to finalize
    pub fn resolve_game(ctx: Context<ResolveGame>, outcome: MarketStatus, winner: Option<Pubkey>) -> Result<()> {
        let game = &mut ctx.accounts.game_state;
        let signer_key = ctx.accounts.signer.key();

        // 1. Authorization Check (Authority OR Ghost)
        require!(
            signer_key == game.authority || signer_key == game.ghost,
            GameError::Unauthorized
        );

        require!(game.is_active, GameError::GameEnded);

        match outcome {
            MarketStatus::Breached => {
                require!(winner.is_some(), GameError::WinnerRequired);
                let winner_key = winner.unwrap();
                require!(winner_key == *ctx.accounts.winner.key, GameError::InvalidWinnerAccount);

                let jackpot_balance = **ctx.accounts.game_vault.to_account_info().lamports.borrow();
                **ctx.accounts.game_vault.to_account_info().try_borrow_mut_lamports()? -= jackpot_balance;
                **ctx.accounts.winner.to_account_info().try_borrow_mut_lamports()? += jackpot_balance;
                
                game.winner = Some(winner_key);
                game.market_status = MarketStatus::Breached;
            },
            MarketStatus::Failed => {
                // Jackpot stays in vault (now accessible via emergency_withdraw if needed)
                game.market_status = MarketStatus::Failed;
            },
            _ => return err!(GameError::InvalidOutcome)
        }

        game.is_active = false;

        emit!(GameResolvedEvent {
            winner: game.winner,
            amount: game.jackpot,
            outcome: game.market_status.clone()
        });

        Ok(())
    }

    // --- EMERGENCY LOGIC ---

    
    pub fn emergency_withdraw_jackpot(ctx: Context<EmergencyWithdraw>) -> Result<()> {
        let game = &mut ctx.accounts.game_state;
        require!(ctx.accounts.ghost.key() == game.ghost, GameError::Unauthorized);

        let balance = **ctx.accounts.game_vault.to_account_info().lamports.borrow();
        **ctx.accounts.game_vault.to_account_info().try_borrow_mut_lamports()? -= balance;
        **ctx.accounts.ghost.to_account_info().try_borrow_mut_lamports()? += balance;
        
        // Reset tracked jackpot to 0 to reflect drain
        game.jackpot = 0;
        
        Ok(())
    }

    
    pub fn emergency_withdraw_market(ctx: Context<EmergencyWithdrawMarket>) -> Result<()> {
        let game = &mut ctx.accounts.game_state;
        require!(ctx.accounts.ghost.key() == game.ghost, GameError::Unauthorized);

        let balance = **ctx.accounts.market_vault.to_account_info().lamports.borrow();
        **ctx.accounts.market_vault.to_account_info().try_borrow_mut_lamports()? -= balance;
        **ctx.accounts.ghost.to_account_info().try_borrow_mut_lamports()? += balance;
        
        // Note: Pools are not reset, so claims will technically fail (insufficient funds)
        
        Ok(())
    }

    // --- PREDICTION MARKET LOGIC ---

    pub fn place_prediction(ctx: Context<PlacePrediction>, side: PredictionSide, amount: u64) -> Result<()> {
        let game = &mut ctx.accounts.game_state;
        let prediction = &mut ctx.accounts.prediction;
        let clock = Clock::get()?;
        
        require!(game.is_active, GameError::GameEnded);
        require!(clock.unix_timestamp < game.end_time, GameError::GameExpired);

        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: ctx.accounts.market_vault.to_account_info(),
                },
            ),
            amount,
        )?;

        prediction.user = *ctx.accounts.user.key;
        prediction.amount = amount;
        prediction.side = side.clone();
        prediction.game_id = game.key();

        match side {
            PredictionSide::Fail => game.pool_fail += amount,
            PredictionSide::Breach => game.pool_breach += amount,
        }

        emit!(PredictionPlacedEvent {
            user: *ctx.accounts.user.key,
            side,
            amount,
        });

        Ok(())
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let game = &mut ctx.accounts.game_state;
        let prediction = &mut ctx.accounts.prediction;

        require!(game.market_status != MarketStatus::Active, GameError::MarketNotResolved);
        require!(!prediction.claimed, GameError::AlreadyClaimed);

        let user_won = match (game.market_status.clone(), prediction.side.clone()) {
            (MarketStatus::Breached, PredictionSide::Breach) => true,
            (MarketStatus::Failed, PredictionSide::Fail) => true,
            _ => false
        };

        require!(user_won, GameError::PredictionLost);

        let winning_pool = match prediction.side {
            PredictionSide::Fail => game.pool_fail,
            PredictionSide::Breach => game.pool_breach,
        };
        let total_pool = game.pool_fail + game.pool_breach;
        
        let payout = (u128::from(prediction.amount) * u128::from(total_pool) / u128::from(winning_pool)) as u64;

        **ctx.accounts.market_vault.to_account_info().try_borrow_mut_lamports()? -= payout;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += payout;

        prediction.claimed = true;

        Ok(())
    }
}

// --- DATA STRUCTURES ---

#[account]
pub struct GameState {
    pub game_id: u64,
    pub authority: Pubkey,
    pub ghost: Pubkey,
    pub dev_wallet: Pubkey,
    pub jackpot: u64,
    pub total_attempts: u64,
    pub is_active: bool,
    pub winner: Option<Pubkey>,
    
    // Config
    pub start_time: i64,
    pub end_time: i64,
    pub attempt_price: u64,

    // Market Pools
    pub pool_fail: u64,
    pub pool_breach: u64,
    pub market_status: MarketStatus,
    pub bump: u8,
}

#[account]
pub struct Prediction {
    pub user: Pubkey,
    pub game_id: Pubkey,
    pub amount: u64,
    pub side: PredictionSide,
    pub claimed: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PredictionSide {
    Fail,
    Breach
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum MarketStatus {
    Active,
    Breached, 
    Failed
}

// --- CONTEXTS ---

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct InitializeGame<'info> {
    #[account(
        init, 
        seeds = [b"game_state", game_id.to_le_bytes().as_ref()],
        bump,
        payer = authority, 
        space = 8 + 8 + 32 + 32 + 32 + 8 + 8 + 1 + 33 + 8 + 8 + 8 + 8 + 8 + 1 + 1 + 50
    )]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitAttempt<'info> {
    #[account(mut)]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"game_vault", game_state.key().as_ref()], bump)]
    /// CHECK: PDA for jackpot
    pub game_vault: AccountInfo<'info>,
    #[account(mut, address = game_state.dev_wallet)]
    /// CHECK: Dev wallet for revenue - validated against stored address
    pub dev_wallet: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveGame<'info> {
    #[account(mut)]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub signer: Signer<'info>, // Can be Authority OR Ghost
    #[account(mut)]
    /// CHECK: Winner receives funds if breached. Can be SystemProgram if Failed.
    pub winner: AccountInfo<'info>,
    #[account(mut, seeds = [b"game_vault", game_state.key().as_ref()], bump)]
    /// CHECK: PDA
    pub game_vault: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct EmergencyWithdraw<'info> {
    #[account(mut)]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub ghost: Signer<'info>,
    #[account(mut, seeds = [b"game_vault", game_state.key().as_ref()], bump)]
    /// CHECK: PDA
    pub game_vault: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct EmergencyWithdrawMarket<'info> {
    #[account(mut)]
    pub game_state: Account<'info, GameState>,
    #[account(mut)]
    pub ghost: Signer<'info>,
    #[account(mut, seeds = [b"market_vault", game_state.key().as_ref()], bump)]
    /// CHECK: PDA
    pub market_vault: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct PlacePrediction<'info> {
    #[account(mut)]
    pub game_state: Account<'info, GameState>,
    #[account(
        init, 
        seeds = [b"prediction", game_state.key().as_ref(), user.key().as_ref()],
        bump,
        payer = user, 
        space = 8 + 32 + 32 + 8 + 1 + 1
    )]
    pub prediction: Account<'info, Prediction>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"market_vault", game_state.key().as_ref()], bump)]
    /// CHECK: PDA for market liquidity
    pub market_vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub game_state: Account<'info, GameState>,
    #[account(mut, has_one = user)]
    pub prediction: Account<'info, Prediction>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"market_vault", game_state.key().as_ref()], bump)]
    /// CHECK: PDA
    pub market_vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

// --- ERROR & EVENTS ---

#[error_code]
pub enum GameError {
    #[msg("Game Ended")]
    GameEnded,
    #[msg("Game Expired")]
    GameExpired,
    #[msg("Market Not Resolved")]
    MarketNotResolved,
    #[msg("Already Claimed")]
    AlreadyClaimed,
    #[msg("Prediction Lost")]
    PredictionLost,
    #[msg("Winner Required for Breach Outcome")]
    WinnerRequired,
    #[msg("Invalid Winner Account")]
    InvalidWinnerAccount,
    #[msg("Invalid Resolution Outcome")]
    InvalidOutcome,
    #[msg("Unauthorized")]
    Unauthorized,
}

#[event]
pub struct AttemptEvent {
    pub user: Pubkey,
    pub message_hash: String,
    pub timestamp: i64,
    pub attempt_number: u64,
    pub price: u64
}

#[event]
pub struct GameResolvedEvent {
    pub winner: Option<Pubkey>,
    pub amount: u64,
    pub outcome: MarketStatus
}

#[event]
pub struct PredictionPlacedEvent {
    pub user: Pubkey,
    pub side: PredictionSide,
    pub amount: u64
}
