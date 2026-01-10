import * as anchor from "@coral-xyz/anchor";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

async function main() {
  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Use 'any' to bypass stale IDL types (will be correct after anchor build)
  const program = anchor.workspace.Piverse as any;
  const authority = provider.wallet;

  console.log("Program ID:", program.programId.toString());
  console.log("Authority:", authority.publicKey.toString());

  // Game ID - use timestamp for uniqueness
  // This ID is used to derive the game state PDA
  const GAME_ID = new anchor.BN(Date.now());

  // Dev wallet - receives 20% of each attempt
  const devWallet = authority.publicKey;
  
  // Ghost (emergency admin)
  const ghost = authority.publicKey;

  // Game configuration
  const GAME_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days
  const ATTEMPT_PRICE_SOL = 0.01; // 0.01 SOL per attempt
  const ATTEMPT_PRICE_LAMPORTS = new anchor.BN(ATTEMPT_PRICE_SOL * LAMPORTS_PER_SOL);

  // Derive Game State PDA using game_id
  const [gameStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_state"), GAME_ID.toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  // Derive other PDAs
  const [gameVaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("game_vault"), gameStatePda.toBuffer()],
    program.programId
  );

  const [marketVaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("market_vault"), gameStatePda.toBuffer()],
    program.programId
  );

  console.log("\n=== Game Configuration ===");
  console.log("Game ID:", GAME_ID.toString());
  console.log("Game State PDA:", gameStatePda.toString());
  console.log("Duration:", GAME_DURATION_SECONDS, "seconds (", GAME_DURATION_SECONDS / 86400, "days )");
  console.log("Attempt Price:", ATTEMPT_PRICE_SOL, "SOL");
  console.log("Dev Wallet:", devWallet.toString());
  console.log("Ghost:", ghost.toString());

  console.log("\n=== PDAs ===");
  console.log("Game Vault PDA:", gameVaultPda.toString());
  console.log("Market Vault PDA:", marketVaultPda.toString());

  // Check if game already exists
  try {
    const existingGame = await program.account.gameState.fetch(gameStatePda);
    console.log("\n⚠️  Game with this ID already exists!");
    console.log("Status:", existingGame.isActive ? "Active" : "Inactive");
    console.log("Jackpot:", existingGame.jackpot.toNumber() / LAMPORTS_PER_SOL, "SOL");
    return;
  } catch (e) {
    // Game doesn't exist, proceed
    console.log("\n🚀 Initializing new game...");
  }

  // Initialize the game
  const tx = await program.methods
    .initializeGame(
      GAME_ID,
      new anchor.BN(GAME_DURATION_SECONDS),
      ATTEMPT_PRICE_LAMPORTS,
      ghost,
      devWallet
    )
    .accounts({
      gameState: gameStatePda,
      authority: authority.publicKey,
    })
    .rpc();

  console.log("\n✅ Game initialized successfully!");
  console.log("Transaction:", tx);

  // Verify initialization
  const gameState = await program.account.gameState.fetch(gameStatePda);
  console.log("\n=== Game State ===");
  console.log("Game ID:", gameState.gameId.toString());
  console.log("Authority:", gameState.authority.toString());
  console.log("Ghost:", gameState.ghost.toString());
  console.log("Dev Wallet:", gameState.devWallet.toString());
  console.log("Is Active:", gameState.isActive);
  console.log("Jackpot:", gameState.jackpot.toNumber() / LAMPORTS_PER_SOL, "SOL");
  console.log("Attempt Price:", gameState.attemptPrice.toNumber() / LAMPORTS_PER_SOL, "SOL");
  console.log("Start Time:", new Date(gameState.startTime.toNumber() * 1000).toISOString());
  console.log("End Time:", new Date(gameState.endTime.toNumber() * 1000).toISOString());

  console.log("\n" + "=".repeat(50));
  console.log("⚠️  IMPORTANT: Register this game in your backend!");
  console.log("=".repeat(50));
  console.log("\nRun the following command:");
  console.log(`\ncurl -X POST http://localhost:5000/api/admin/register-game \\
  -H "Content-Type: application/json" \\
  -d '{"gameId": "${GAME_ID.toString()}", "pda": "${gameStatePda.toString()}", "adminSecret": "YOUR_ADMIN_SECRET"}'`);
  console.log("\n" + "=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
