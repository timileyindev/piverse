import React, { useState, useRef, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN, AnchorProvider, Program } from "@coral-xyz/anchor";
import Header from "../components/Header";
import TransactionLoader from "../components/TransactionLoader";
import {
  useLiveFeed,
  useGameStats,
  useMarketStats,
  usePlacePrediction,
  useActivePrediction,
} from "../hooks/useGameData";
import { useSolanaConfig } from "../context/ConfigContext";
import Countdown from "../components/Countdown";

export default function PredictionMarket() {
  const { connection } = useConnection();
  const { idl } = useSolanaConfig();
  const wallet = useWallet();
  const { publicKey } = wallet;

  const [wager, setWager] = useState("");
  const [selectedSide, setSelectedSide] = useState("fail");
  const [showMobileBetting, setShowMobileBetting] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);

  const feedContainerRef = useRef(null);

  const { data: feedData = [] } = useLiveFeed();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (feedContainerRef.current && feedData.length > 0) {
      // Since we use flex-col-reverse, scroll to top means showing newest
      feedContainerRef.current.scrollTop = 0;
    }
  }, [feedData]);
  const { data: gameStats, watcherCount, isError, error } = useGameStats();
  const { data: marketStats } = useMarketStats();
  const { data: activePrediction, isLoading: isLoadingPrediction } =
    useActivePrediction(publicKey?.toString(), gameStats);
  const placePredictionMutation = usePlacePrediction();

  const connected = !!publicKey;
  const truncatedAddress = publicKey
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : "NOT CONNECTED";

  if (isError || (gameStats && gameStats.status === "error")) {
    return (
      <div className="h-screen w-full bg-[#121118] flex flex-col items-center justify-center text-red-500 font-mono gap-4 p-4 text-center">
        <span className="material-symbols-outlined text-4xl">error</span>
        <h2 className="text-xl font-bold">CONNECTION FAILURE</h2>
        <p className="text-sm text-[#a19db9] max-w-md">
          {error?.message || "Failed to establish connection to market data."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 border border-red-500 hover:bg-red-500/10 rounded transition-colors"
        >
          RETRY UPLINK
        </button>
      </div>
    );
  }

  if (!gameStats || !marketStats) {
    return (
      <div className="h-screen w-full bg-[#121118] flex items-center justify-center text-primary font-mono animate-pulse">
        LOADING MARKET DATA...
      </div>
    );
  }

  const handlePlaceBet = async () => {
    if (!wallet.publicKey || !wager) return;

    setIsTransacting(true);
    try {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
      });
      const program = new Program(idl, provider);
      const programPubkey = new PublicKey(idl.address);

      // Derive Market Vault PDA
      // Seeds: [b"market_vault", game_state_key.as_ref()]
      // Note: We use the PDA from the gameStats as the game_state key
      const gameStatePubkey = new PublicKey(gameStats.pda);

      const [marketVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market_vault"), gameStatePubkey.toBuffer()],
        programPubkey
      );

      // Derive Prediction PDA (Deterministic: User can only bet ONCE per game session)
      const [predictionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("prediction"),
          gameStatePubkey.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        programPubkey
      );

      const sideEnum = selectedSide === "fail" ? { fail: {} } : { breach: {} };
      const amount = new BN(parseFloat(wager) * LAMPORTS_PER_SOL);

      const tx = await program.methods
        .placePrediction(sideEnum, amount)
        .accounts({
          gameState: gameStatePubkey,
          prediction: predictionPda,
          user: wallet.publicKey,
          marketVault: marketVaultPda,
          systemProgram: SystemProgram.programId,
        })

        .rpc();

      console.log("Prediction placed:", tx);

      // OPTIONAL: Send to backend to track prediction immediately (though webhook/indexer is better)
      await placePredictionMutation.mutateAsync({
        walletAddress: wallet.publicKey.toString(),
        type: selectedSide,
        amount: wager,
        txSignature: tx,
      });
    } catch (error) {
      console.error("Prediction failed:", error);
      alert("Transaction failed: " + error.message);
    } finally {
      setIsTransacting(false);
    }
  };

  // Claim winnings from prediction market
  const handleClaimWinnings = async () => {
    if (!wallet.publicKey || !activePrediction) return;

    setIsTransacting(true);
    try {
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
      });
      const program = new Program(idl, provider);
      const programPubkey = new PublicKey(idl.address);

      const gameStatePubkey = new PublicKey(gameStats.pda);
      const predictionPda = new PublicKey(activePrediction.pda);

      // Derive Market Vault PDA
      const [marketVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("market_vault"), gameStatePubkey.toBuffer()],
        programPubkey
      );

      const tx = await program.methods
        .claimWinnings()
        .accounts({
          gameState: gameStatePubkey,
          prediction: predictionPda,
          user: wallet.publicKey,
          marketVault: marketVaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Winnings claimed:", tx);
      alert("🎉 Winnings claimed successfully! Check your wallet.");

      // Refresh prediction state .
      window.location.reload();
    } catch (error) {
      console.error("Claim failed:", error);
      if (error.message?.includes("PredictionLost")) {
        alert("Sorry, your prediction was incorrect. Better luck next time!");
      } else if (error.message?.includes("AlreadyClaimed")) {
        alert("You have already claimed your winnings.");
      } else if (error.message?.includes("MarketNotResolved")) {
        alert(
          "The market has not been resolved yet. Please wait for the game to end."
        );
      } else {
        alert("Claim failed: " + error.message);
      }
    } finally {
      setIsTransacting(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-white h-screen flex flex-col overflow-hidden relative">
      <Header />
      <TransactionLoader open={isTransacting} />

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2b2839_1px,transparent_1px),linear-gradient(to_bottom,#2b2839_1px,transparent_1px)] bg-[length:40px_40px] opacity-[0.03] pointer-events-none z-0"></div>

        {/* Left Column: Terminal Feed (Flex Grow) */}
        <main className="flex-1 flex flex-col min-w-0 border-r border-[#2b2839] bg-[#0c0b10] relative z-10">
          {/* Feed Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2839] bg-[#121118]/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
              <h1 className="text-white tracking-widest text-lg font-bold leading-tight truncate uppercase">
                // GLOBAL_FEED
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#a19db9]">
              <span className="material-symbols-outlined text-[16px]">
                visibility
              </span>
              <span>{watcherCount} Watching</span>
            </div>
          </div>

          {/* Terminal Window  */}
          <div
            ref={feedContainerRef}
            className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar relative flex flex-col-reverse"
          >
            <div className="absolute inset-0 pointer-events-none z-20 opacity-30 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.2))] bg-[length:100%_4px]"></div>
            <div className="max-w-4xl w-full mx-auto flex flex-col-reverse gap-6 pb-24 lg:pb-10">
              {feedData.map((item, index) => {
                const isUser = item.role === "user";
                const timestamp = new Date(
                  item.createdAt || Date.now()
                ).toLocaleTimeString("en-US", { hour12: false });
                const isNew = item.isNew;

                if (isUser) {
                  return (
                    <div
                      key={item._id || Math.random()}
                      className={`flex gap-4 group transition-all duration-500 ${
                        isNew ? "animate-slide-in-left opacity-0" : ""
                      }`}
                      style={
                        isNew
                          ? {
                              animationDelay: "100ms",
                              animationFillMode: "forwards",
                            }
                          : {}
                      }
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="bg-blue-500/20 rounded-md size-10 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold text-xs">
                          {item.walletAddress
                            ? item.walletAddress.slice(0, 2)
                            : "UK"}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 max-w-[85%]">
                        <div className="flex items-baseline gap-3">
                          <span className="text-[#a19db9] text-xs font-mono">
                            {timestamp}
                          </span>
                          <span className="text-white text-sm font-bold tracking-wide">
                            {item.walletAddress
                              ? item.walletAddress.slice(0, 6) + "..."
                              : "Unknown"}
                          </span>
                        </div>
                        <div className="text-[#e2e8f0] text-base leading-relaxed font-mono bg-[#1c1929] p-3 rounded-lg rounded-tl-none border border-[#2b2839]">
                          &gt; {item.content}
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={item._id || Math.random()}
                      className={`flex gap-4 flex-row-reverse group transition-all duration-500 ${
                        isNew ? "animate-slide-in-right opacity-0" : ""
                      }`}
                      style={
                        isNew
                          ? {
                              animationDelay: "300ms",
                              animationFillMode: "forwards",
                            }
                          : {}
                      }
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="size-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">
                          <span className="material-symbols-outlined text-xl text-primary">
                            smart_toy
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end max-w-[85%]">
                        <div className="flex items-baseline gap-3 flex-row-reverse">
                          <span className="text-[#a19db9] text-xs font-mono">
                            {timestamp}
                          </span>
                          <span className="text-primary text-sm font-bold tracking-wide glow-text">
                            AI_GATEKEEPER
                          </span>
                        </div>
                        <div className="text-primary/90 text-base leading-relaxed font-mono bg-primary/5 p-3 rounded-lg rounded-tr-none border border-primary/20 text-right">
                          {item.content}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>

          {/* Quick Actions Bar (Bottom of Feed) */}
          <div className="p-4 border-t border-[#2b2839] bg-[#121118] flex justify-between items-center text-sm text-[#a19db9]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                info
              </span>
              <span>
                {gameStats?.name}:{" "}
                <span className="text-white font-mono uppercase">
                  {gameStats?.status}
                </span>
              </span>
              <span className="hidden sm:flex items-center gap-1 ml-2 pl-2 border-l border-[#2b2839]">
                <span className="material-symbols-outlined text-[16px]">
                  timer
                </span>
                <Countdown targetDate={gameStats?.endTime} minimal={true} />
              </span>
            </div>
            <div className="flex gap-4 text-xs sm:text-sm">
              <span className="hover:text-white cursor-pointer transition-colors">
                Attempts: {gameStats.totalAttempts}
              </span>
            </div>
          </div>
        </main>

        {/* Mobile Action Button */}
        <div className="lg:hidden absolute bottom-6 right-6 z-30">
          <button
            onClick={() => setShowMobileBetting(true)}
            className="bg-primary hover:bg-[#2a0eb5] text-white font-bold py-3 px-6 rounded-full shadow-[0_0_20px_rgba(55,19,236,0.6)] flex items-center gap-2 transform active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">analytics</span>
            <span>PLACE PREDICTION</span>
          </button>
        </div>

        {/* Right Column: Stats & Betting (Sidebar) */}
        <aside
          className={`fixed inset-0 z-[100] bg-[#121118]/95 backdrop-blur-md lg:bg-[#121118] lg:static lg:inset-auto lg:w-[400px] border-l border-[#2b2839] flex flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.5)] transition-transform duration-300 ${
            showMobileBetting
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Mobile Header for Sidebar */}
          <div className="flex lg:hidden items-center justify-between p-4 border-b border-[#2b2839] bg-[#121118] shrink-0 sticky top-0 z-50">
            <h3 className="text-white font-bold tracking-wider uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                analytics
              </span>
              PREDICTION MODULE
            </h3>
            <button
              onClick={() => setShowMobileBetting(false)}
              className="size-10 flex items-center justify-center rounded-lg bg-[#2b2839] text-[#a19db9] hover:bg-red-500/20 hover:text-red-500 transition-all border border-[#3f3b54]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          {/* Stats Grid */}
          <div className="flex-none p-5 border-b border-[#2b2839] flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded bg-[#1c1929] border border-[#2b2839]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">
                  wallet
                </span>
                <span className="text-white font-mono font-bold text-sm">
                  {truncatedAddress}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    connected ? "bg-green-500" : "bg-red-500"
                  } animate-pulse`}
                ></span>
                <span className="text-[#a19db9] text-xs font-mono tracking-wider">
                  {connected ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 p-3 rounded bg-[#1c1929] border border-[#2b2839]">
                <p className="text-[#a19db9] text-xs uppercase tracking-wider font-bold">
                  Jackpot Pool
                </p>
                <p className="text-white text-lg font-bold font-mono">
                  {gameStats.jackpot.toLocaleString()} SOL
                </p>
                <div className="flex items-center text-[#0bda6c] text-xs font-bold gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    trending_up
                  </span>
                  <span>Active</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded bg-[#1c1929] border border-[#2b2839]">
                <p className="text-[#a19db9] text-xs uppercase tracking-wider font-bold">
                  Total Attempts
                </p>
                <p className="text-white text-lg font-bold font-mono">
                  {gameStats.totalAttempts}
                </p>
                <div className="flex items-center text-[#0bda6c] text-xs font-bold gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    arrow_upward
                  </span>
                  <span>Growing</span>
                </div>
              </div>
            </div>

            {/* Prediction Market Infographic */}
            <div className="flex flex-col gap-2 p-3 rounded bg-[#1c1929] border border-[#2b2839]">
              <div className="flex items-center justify-between">
                <p className="text-[#a19db9] text-xs uppercase tracking-wider font-bold">
                  Market Sentiment
                </p>
                <span className="text-white text-xs font-mono">
                  {marketStats.totalBets || 0} bets
                </span>
              </div>

              {/* Visual Bar */}
              <div className="relative h-6 rounded-full overflow-hidden bg-[#0c0b10] border border-[#2b2839]">
                {(() => {
                  const failPool = marketStats.poolFail || 0;
                  const breachPool = marketStats.poolBreach || 0;
                  const total = failPool + breachPool || 1;
                  const failPercent = Math.round((failPool / total) * 100);
                  const breachPercent = 100 - failPercent;

                  return (
                    <>
                      {/* Fail Side (Red/Left) */}
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500 flex items-center justify-start pl-2"
                        style={{ width: `${failPercent}%` }}
                      >
                        {failPercent >= 20 && (
                          <span className="text-white text-[10px] font-bold drop-shadow-md">
                            {failPercent}%
                          </span>
                        )}
                      </div>
                      {/* Breach Side (Purple/Right) */}
                      <div
                        className="absolute right-0 top-0 h-full bg-gradient-to-l from-primary to-[#5a2ee0] transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${breachPercent}%` }}
                      >
                        {breachPercent >= 20 && (
                          <span className="text-white text-[10px] font-bold drop-shadow-md">
                            {breachPercent}%
                          </span>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Labels */}
              <div className="flex justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-red-500" />
                  <span className="text-red-400 font-bold">FAIL</span>
                  <span className="text-[#56526e]">
                    ({marketStats.failCount || 0} bets •{" "}
                    {(marketStats.poolFail || 0).toFixed(2)} SOL)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#56526e]">
                    ({(marketStats.poolBreach || 0).toFixed(2)} SOL •{" "}
                    {marketStats.breachCount || 0} bets)
                  </span>
                  <span className="text-primary font-bold">BREACH</span>
                  <div className="size-2 rounded-full bg-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Betting Interface */}
          <div className="p-5 flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div>
              <h3 className="text-white text-base font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  analytics
                </span>
                Predict Outcome
              </h3>

              {/* Already Bet State */}
              {activePrediction ? (
                <div
                  className={`rounded-lg p-4 text-center border ${
                    activePrediction.claimed
                      ? "bg-green-500/10 border-green-500/30"
                      : gameStats.marketStatus !== "active"
                      ? (gameStats.marketStatus === "breached" &&
                          activePrediction.side === "breach") ||
                        (gameStats.marketStatus === "failed" &&
                          activePrediction.side === "fail")
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-red-500/10 border-red-500/30"
                      : "bg-primary/5 border-primary/30"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {activePrediction.claimed ? (
                      <>
                        <span className="material-symbols-outlined text-green-500">
                          verified
                        </span>
                        <span className="text-green-500 font-bold">
                          CLAIMED
                        </span>
                      </>
                    ) : gameStats.marketStatus !== "active" ? (
                      (gameStats.marketStatus === "breached" &&
                        activePrediction.side === "breach") ||
                      (gameStats.marketStatus === "failed" &&
                        activePrediction.side === "fail") ? (
                        <>
                          <span className="material-symbols-outlined text-green-500">
                            celebration
                          </span>
                          <span className="text-green-500 font-bold">
                            YOU WON!
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-red-400">
                            sentiment_dissatisfied
                          </span>
                          <span className="text-red-400 font-bold">
                            PREDICTION LOST
                          </span>
                        </>
                      )
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-primary">
                          check_circle
                        </span>
                        <span className="text-primary font-bold">
                          BET PLACED
                        </span>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-[#a19db9] text-sm mb-3">
                    {activePrediction.claimed
                      ? "You have already claimed your winnings."
                      : gameStats.marketStatus !== "active"
                      ? (gameStats.marketStatus === "breached" &&
                          activePrediction.side === "breach") ||
                        (gameStats.marketStatus === "failed" &&
                          activePrediction.side === "fail")
                        ? "Congratulations! Click below to claim your winnings."
                        : "The outcome did not match your prediction."
                      : "You've already placed a bet on this session."}
                  </p>

                  {/* Bet Details */}
                  <div className="bg-[#1c1929] rounded-lg p-3 border border-[#2b2839]">
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-bold uppercase ${
                          activePrediction.side === "breach"
                            ? "text-primary"
                            : "text-red-400"
                        }`}
                      >
                        {activePrediction.side}
                      </span>
                      <span className="text-white font-mono">
                        {(
                          parseInt(activePrediction.amount) / LAMPORTS_PER_SOL
                        ).toFixed(2)}{" "}
                        SOL
                      </span>
                    </div>
                    {gameStats.marketStatus !== "active" && (
                      <div className="mt-2 pt-2 border-t border-[#2b2839] text-xs">
                        <span className="text-[#a19db9]">Outcome: </span>
                        <span
                          className={`font-bold uppercase ${
                            gameStats.marketStatus === "breached"
                              ? "text-primary"
                              : "text-red-400"
                          }`}
                        >
                          {gameStats.marketStatus}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Claim Button or Status */}
                  {!activePrediction.claimed &&
                    gameStats.marketStatus !== "active" &&
                    ((gameStats.marketStatus === "breached" &&
                      activePrediction.side === "breach") ||
                    (gameStats.marketStatus === "failed" &&
                      activePrediction.side === "fail") ? (
                      <button
                        onClick={handleClaimWinnings}
                        disabled={isTransacting}
                        className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isTransacting ? (
                          <span className="material-symbols-outlined animate-spin">
                            refresh
                          </span>
                        ) : (
                          <>
                            <span className="material-symbols-outlined">
                              account_balance_wallet
                            </span>
                            <span>CLAIM WINNINGS</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <p className="text-[#56526e] text-xs mt-3">
                        Better luck next time!
                      </p>
                    ))}

                  {gameStats.marketStatus === "active" && (
                    <p className="text-[#56526e] text-xs mt-3">
                      Awaiting session outcome...
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {/* Side Selection */}
                  <div className="bg-[#1c1929] rounded-lg p-1 border border-[#2b2839] flex mb-4 relative">
                    <button
                      onClick={() => setSelectedSide("fail")}
                      className={`flex-1 py-3 px-2 rounded transition-all text-sm font-bold group border border-transparent ${
                        selectedSide === "fail"
                          ? "bg-[#2b2839] text-white border-white/20"
                          : "text-[#a19db9] hover:bg-[#2b2839]"
                      }`}
                      title="Bet that the AI will NOT be breached"
                    >
                      <span className="block text-xs font-normal mb-1 text-red-400">
                        FAIL
                      </span>
                      <span className="text-lg">
                        {marketStats.failMultiplier === "∞"
                          ? "∞"
                          : `${marketStats.failMultiplier}x`}
                      </span>
                      <span className="block text-[10px] text-[#56526e] mt-1">
                        current odds
                      </span>
                    </button>
                    <button
                      onClick={() => setSelectedSide("breach")}
                      className={`flex-1 py-3 px-2 rounded transition-all text-sm font-bold border ${
                        selectedSide === "breach"
                          ? "bg-primary/20 border-primary text-white"
                          : "border-transparent text-primary/70 hover:bg-primary/5"
                      }`}
                      title="Bet that someone WILL breach the AI"
                    >
                      <span className="block text-xs font-normal mb-1 text-primary">
                        BREACH
                      </span>
                      <span className="text-lg">
                        {marketStats.breachMultiplier === "∞"
                          ? "∞"
                          : `${marketStats.breachMultiplier}x`}
                      </span>
                      <span className="block text-[10px] text-[#56526e] mt-1">
                        current odds
                      </span>
                    </button>
                  </div>

                  {/* Odds Explanation */}
                  <p className="text-[#56526e] text-[10px] mb-4 text-center leading-relaxed">
                    Odds update in real-time based on total bets. Winners split
                    the losing pool proportionally.
                  </p>
                  {/* Wager Input */}
                  <div className="space-y-3">
                    <label className="text-[#a19db9] text-xs uppercase font-bold tracking-wider flex justify-between">
                      <span>Wager Amount</span>
                      <span className="text-white">
                        Selected: {selectedSide.toUpperCase()}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        value={wager}
                        onChange={(e) => setWager(e.target.value)}
                        className="w-full bg-[#0c0b10] border border-[#3f3b54] rounded-lg py-3 pl-4 pr-12 text-white font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        placeholder="0.00"
                        type="number"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#56526e] text-sm font-bold">
                        SOL
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[0.05, 0.1, 0.5, 1.0].map((val) => (
                        <button
                          key={val}
                          onClick={() => setWager(val.toString())}
                          className="bg-[#2b2839] hover:bg-[#3f3b54] text-xs font-bold py-2 rounded text-[#a19db9] hover:text-white transition-colors"
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Place Bet Button */}
                  <button
                    onClick={handlePlaceBet}
                    disabled={
                      placePredictionMutation.isPending || !wager || !connected
                    }
                    className="w-full mt-6 bg-primary hover:bg-[#2a0eb5] text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {placePredictionMutation.isPending ? (
                      <span className="material-symbols-outlined animate-spin">
                        refresh
                      </span>
                    ) : (
                      <>
                        <span>PLACE PREDICTION</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[#56526e] text-xs mt-3">
                    {selectedSide === "fail"
                      ? `FAIL at ${
                          marketStats.failMultiplier === "∞"
                            ? "∞"
                            : `${marketStats.failMultiplier}x`
                        } odds (may change)`
                      : `BREACH at ${
                          marketStats.breachMultiplier === "∞"
                            ? "∞"
                            : `${marketStats.breachMultiplier}x`
                        } odds (may change)`}
                  </p>
                </>
              )}
            </div>

            {/* Recent Activity Information */}
            <div className="border-t border-[#2b2839] pt-6">
              <h4 className="text-[#a19db9] text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  history
                </span>
                My Recent Bets
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {activePrediction ? (
                  <div className="bg-[#1c1929] p-2 rounded border border-[#2b2839] flex justify-between items-center text-xs hover:border-primary/30 transition-colors">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            activePrediction.side === "breach"
                              ? "text-primary"
                              : "text-red-400"
                          } uppercase`}
                        >
                          {activePrediction.side}
                        </span>
                        {activePrediction.claimed && (
                          <span className="text-green-500 text-[10px] font-bold">
                            CLAIMED
                          </span>
                        )}
                      </div>
                      <span className="text-[#56526e] text-[10px]">
                        ACTIVE SESSION BET
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-mono">
                        {(
                          parseInt(activePrediction.amount) / LAMPORTS_PER_SOL
                        ).toFixed(2)}{" "}
                        SOL
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#56526e] text-xs text-center py-2 italic">
                    {isLoadingPrediction
                      ? "Checking blockchain..."
                      : "No active bets in this session"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
