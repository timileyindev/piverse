import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Piverse } from "../target/types/piverse";
import * as dotenv from "dotenv";
dotenv.config();

export default async function deploy(provider: anchor.AnchorProvider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);

  const program = anchor.workspace.Piverse as Program<Piverse>;

  console.log("Initializing Game State...");

  // Load Env Vars
  const authorityKey = new anchor.web3.PublicKey(process.env.AUTHORITY_PUBLIC_KEY || provider.wallet.publicKey);
  const ghostKey = new anchor.web3.PublicKey(process.env.GHOST_PUBLIC_KEY || provider.wallet.publicKey);
  const duration = new anchor.BN(process.env.GAME_DURATION_SECONDS || 86400); // 1 Day default
  const price = new anchor.BN(process.env.ATTEMPT_PRICE_LAMPORTS || 10000000); // 0.01 SOL default

  // Derive Game State PDA
  // Note: Your initialize_game context uses `init` on a straight account, not a PDA with seeds?
  // Checking lib.rs... 
  // #[account(init, payer = authority, space = ...)] public game_state: Account<'info, GameState>
  // It is NOT a PDA. It requires a Keypair to generate a fresh address for the State.
  
  const gameStateKeypair = anchor.web3.Keypair.generate();

  try {
      const tx = await program.methods
        .initializeGame(duration, price, ghostKey)
        .accounts({
            gameState: gameStateKeypair.publicKey,
            authority: provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([gameStateKeypair])
        .rpc();

      console.log("Game Initialized!");
      console.log("Transaction Signature:", tx);
      console.log("-----------------------------------------");
      console.log("GAME STATE ADDRESS (Save this!):", gameStateKeypair.publicKey.toString());
      console.log("AUTHORITY:", authorityKey.toString());
      console.log("GHOST:", ghostKey.toString());
      console.log("-----------------------------------------");

  } catch (err) {
      console.error("Initialization Failed:", err);
  }
}
