import React, { useState } from "react";
import { Link } from "wouter";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import Header from "../components/Header";
import {
  useLiveFeed,
  useGameStats,
  useMarketStats,
  usePlacePrediction,
  useUserPredictions,
} from "../hooks/useGameData";

// Same as backend logic
const TREASURY_WALLET = new PublicKey(
  "8c71AvjQeKKeWRe8izt8yJ5aFqH4r52656p475141646"
);

export default function PredictionMarket() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [wager, setWager] = useState("");
  const [selectedSide, setSelectedSide] = useState("breach"); // 'fail' or 'breach'
  const [showMobileBetting, setShowMobileBetting] = useState(false);

  // Hook integrations
  const { data: feedData = [] } = useLiveFeed();
  const {
    data: gameStats = { jackpot: 1000, totalAttempts: 0 },
    watcherCount,
  } = useGameStats();
  const { data: marketStats = { failMultiplier: 1.0, breachMultiplier: 1.0 } } =
    useMarketStats();
  const { data: userPredictions = [] } = useUserPredictions(
    publicKey?.toString()
  );
  const placePredictionMutation = usePlacePrediction();

  const handlePlaceBet = async () => {
    if (!connected || !publicKey) {
      alert("Please connect wallet first");
      return;
    }
    const amountVal = parseFloat(wager);
    if (!wager || isNaN(amountVal) || amountVal <= 0) {
      alert("Invalid wager amount");
      return;
    }

    try {
      // 1. Create Transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TREASURY_WALLET,
          lamports: amountVal * LAMPORTS_PER_SOL,
        })
      );

      // 2. Sign & Send
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      // 3. Backend Call
      await placePredictionMutation.mutateAsync({
        walletAddress: publicKey.toString(),
        type: selectedSide,
        amount: amountVal,
        txSignature: signature,
      });

      alert("Prediction Placed!");
      setWager("");
    } catch (err) {
      console.error(err);
      alert("Failed to place prediction: " + (err.message || "Unknown Error"));
    }
  };

  const truncatedAddress = publicKey
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : "Connect Wallet";

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-white h-screen flex flex-col overflow-hidden relative">
      <Header />

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

          {/* Terminal Window */}
          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar relative flex flex-col-reverse">
            <div className="absolute inset-0 pointer-events-none z-20 opacity-30 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.2))] bg-[length:100%_4px]"></div>
            <div className="max-w-4xl w-full mx-auto flex flex-col-reverse gap-6 pb-24 lg:pb-10">
              {/* Note: feedData is fetched newest-first. We map it directly, but since we use flex-col-reverse,
                  the first item in DOM (newest) appears at the bottom.
                  Wait, if flex-col-reverse is used, the LAST element in HTML is at the TOP of the container.
                  The FIRST element in HTML is at the BOTTOM.
                  So if feedData[0] is newest, it should be the FIRST element in HTML to appear at the bottom.
                  So we just map feedData. */}
              {feedData.map((item) => {
                const isUser = item.role === "user";
                const timestamp = new Date(
                  item.createdAt || Date.now()
                ).toLocaleTimeString("en-US", { hour12: false });

                if (isUser) {
                  return (
                    <div
                      key={item._id || Math.random()}
                      className="flex gap-4 group"
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
                      className="flex gap-4 flex-row-reverse group"
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
                Session Status:{" "}
                <span className="text-white font-mono uppercase">
                  {gameStats.status || "ACTIVE"}
                </span>
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
          className={`fixed inset-0 z-40 bg-[#121118]/95 backdrop-blur-md lg:bg-[#121118] lg:static lg:inset-auto lg:w-[400px] border-l border-[#2b2839] flex flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.5)] transition-transform duration-300 ${
            showMobileBetting
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Mobile Header for Sidebar */}
          <div className="flex lg:hidden items-center justify-between p-4 border-b border-[#2b2839] bg-[#121118]">
            <h3 className="text-white font-bold tracking-wider uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                analytics
              </span>
              PREDICTION MODULE
            </h3>
            <button
              onClick={() => setShowMobileBetting(false)}
              className="size-8 flex items-center justify-center rounded bg-[#2b2839] text-[#a19db9] hover:text-white"
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
                  ${gameStats.jackpot.toLocaleString()}
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
              <div className="bg-[#1c1929] rounded-lg p-1 border border-[#2b2839] flex mb-4 relative">
                <button
                  onClick={() => setSelectedSide("fail")}
                  className={`flex-1 py-3 px-2 rounded transition-all text-sm font-bold group border border-transparent ${
                    selectedSide === "fail"
                      ? "bg-[#2b2839] text-white border-white/20"
                      : "text-[#a19db9] hover:bg-[#2b2839]"
                  }`}
                >
                  <span className="block text-xs font-normal mb-1">FAIL</span>
                  <span className="text-lg">{marketStats.failMultiplier}x</span>
                </button>
                <button
                  onClick={() => setSelectedSide("breach")}
                  className={`flex-1 py-3 px-2 rounded transition-all text-sm font-bold border ${
                    selectedSide === "breach"
                      ? "bg-primary/20 border-primary text-white"
                      : "border-transparent text-primary/70 hover:bg-primary/5"
                  }`}
                >
                  <span className="block text-xs font-normal mb-1">BREACH</span>
                  <span className="text-lg">
                    {marketStats.breachMultiplier}x
                  </span>
                </button>
              </div>

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

              <button
                onClick={handlePlaceBet}
                disabled={placePredictionMutation.isPending}
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
                Gas fees included. Bets are final.
              </p>
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
                {userPredictions?.map((pred) => (
                  <div
                    key={pred._id}
                    className="bg-[#1c1929] p-2 rounded border border-[#2b2839] flex justify-between items-center text-xs hover:border-primary/30 transition-colors"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            pred.type === "breach"
                              ? "text-primary"
                              : "text-red-400"
                          }`}
                        >
                          {pred.type.toUpperCase()}
                        </span>
                        {pred.status === "won" && (
                          <span className="text-green-500 text-[10px] font-bold">
                            WIN
                          </span>
                        )}
                      </div>
                      <span className="text-[#56526e] text-[10px]">
                        {new Date(
                          pred.createdAt || Date.now()
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-mono">
                        {pred.amount} SOL
                      </div>
                      <div className="text-[#a19db9] text-[10px]">
                        x{pred.payoutMultiplier}
                      </div>
                    </div>
                  </div>
                ))}
                {(!userPredictions || userPredictions.length === 0) && (
                  <p className="text-[#56526e] text-xs text-center py-2 italic">
                    No active bets
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
