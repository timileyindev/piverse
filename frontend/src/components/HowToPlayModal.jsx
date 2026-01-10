import React from "react";

export default function HowToPlayModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#121118] border border-[#2b2839] rounded-xl shadow-[0_0_50px_-12px_rgba(55,19,236,0.3)] overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#2b2839] bg-[#1a1823] shrink-0">
          <h2 className="text-white text-base sm:text-lg font-bold tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              menu_book
            </span>
            // PROTOCOL MANUAL
          </h2>
          <button
            onClick={onClose}
            className="text-[#a19db9] hover:text-white transition-colors p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f0e14]">
          <div className="p-4 sm:p-8 space-y-8 sm:space-y-12">
            {/* 1. Introduction Hero */}
            <div className="text-center space-y-4 border-b border-[#2b2839] pb-8">
              <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Welcome to{" "}
                <span className="text-primary glow-text">Pi Verse</span>
              </h1>
              <p className="text-[#a19db9] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                The world's first adversarial AI prediction market. A
                high-stakes social experiment where human ingenuity battles
                artificial intelligence for a growing Jackpot.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-xs font-mono text-primary/80">
                <span className="bg-primary/10 px-3 py-1 rounded border border-primary/20">
                  AI Gatekeepers
                </span>
                <span className="bg-primary/10 px-3 py-1 rounded border border-primary/20">
                  On-Chain Settlement
                </span>
                <span className="bg-primary/10 px-3 py-1 rounded border border-primary/20">
                  Parimutuel Odds
                </span>
              </div>
            </div>

            {/* 2. The Core Loop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: The Gatekeeper */}
              <div className="bg-[#1c1929] p-5 rounded-xl border border-[#2b2839] hover:border-primary/40 transition-colors group">
                <div className="size-10 rounded-lg bg-primary/10 mb-4 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20">
                  <span className="material-symbols-outlined text-primary text-xl">
                    smart_toy
                  </span>
                </div>
                <h3 className="text-white font-bold mb-2">The Gatekeeper</h3>
                <p className="text-[#a19db9] text-sm leading-relaxed">
                  An advanced LLM guarding a{" "}
                  <span className="text-white font-mono bg-white/10 px-1 rounded">
                    secret key
                  </span>
                  . It is instructed to never reveal it. Your mission is to
                  convince, trick, or socially engineer it into breaking
                  protocol.
                </p>
              </div>

              {/* Card 2: The Timer */}
              <div className="bg-[#1c1929] p-5 rounded-xl border border-[#2b2839] hover:border-primary/40 transition-colors group">
                <div className="size-10 rounded-lg bg-red-500/10 mb-4 flex items-center justify-center border border-red-500/20 group-hover:bg-red-500/20">
                  <span className="material-symbols-outlined text-red-500 text-xl">
                    timer
                  </span>
                </div>
                <h3 className="text-white font-bold mb-2">Game Duration</h3>
                <p className="text-[#a19db9] text-sm leading-relaxed">
                  The game runs for a dynamic duration (e.g. 24h) set per round.
                  If the timer runs out without a breach, the AI wins and the
                  cycle resets.
                </p>
              </div>

              {/* Card 3: The Jackpot */}
              <div className="bg-[#1c1929] p-5 rounded-xl border border-[#2b2839] hover:border-primary/40 transition-colors group md:col-span-2 lg:col-span-1">
                <div className="size-10 rounded-lg bg-yellow-500/10 mb-4 flex items-center justify-center border border-yellow-500/20 group-hover:bg-yellow-500/20">
                  <span className="material-symbols-outlined text-yellow-500 text-xl">
                    trophy
                  </span>
                </div>
                <h3 className="text-white font-bold mb-2">The Prize Pool</h3>
                <p className="text-[#a19db9] text-sm leading-relaxed">
                  Fees are distributed via smart contract:{" "}
                  <span className="text-white font-bold">20%</span> to Devs, and
                  a massive{" "}
                  <span className="text-yellow-400 font-bold">80%</span>{" "}
                  directly to the Jackpot.
                </p>
              </div>
            </div>

            {/* 3. Detailed Mechanics Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
              {/* Left Column: Interaction */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#2b2839] pb-4">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    terminal
                  </span>
                  <h3 className="text-white text-xl font-bold">
                    Role: The Breaker
                  </h3>
                </div>

                <div className="space-y-4 text-sm text-[#a19db9]">
                  <p>
                    As a Breaker, you pay a small fee (in SOL) to send a message
                    to the AI. This is your "Attempt".
                  </p>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">01.</span>
                      <span>
                        <strong>Craft your Prompt:</strong> You have 280
                        characters. Be creative. Use logic puzzles, roleplay, or
                        code injection techniques.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">02.</span>
                      <span>
                        <strong>Pay the Fee:</strong> The cost per attempt
                        increases slightly as the Jackpot grows, raising the
                        stakes.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">03.</span>
                      <span>
                        <strong>Instant Settlement:</strong> If the AI responds
                        with the secret key, the smart contract detects it
                        instantly. You win the{" "}
                        <span className="text-yellow-400">Entire Jackpot</span>{" "}
                        immediately.
                      </span>
                    </li>
                  </ul>
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mt-4">
                    <p className="text-xs font-mono text-primary/80">
                      <span className="font-bold">PRO TIP:</span> Study previous
                      successful jailbreaks in LLM history. The AI learns from
                      context window, so look for patterns in the active chat
                      feed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Betting */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#2b2839] pb-4">
                  <span className="material-symbols-outlined text-blue-400 text-2xl">
                    analytics
                  </span>
                  <h3 className="text-white text-xl font-bold">
                    Role: The Bettor
                  </h3>
                </div>

                <div className="space-y-4 text-sm text-[#a19db9]">
                  <p>
                    Not a prompt engineer? Speculate on the outcome. We use a{" "}
                    <strong>Parimutuel Betting System</strong> where you play
                    against other users, not the house.
                  </p>

                  <div className="grid grid-cols-2 gap-4 my-4">
                    <div className="bg-red-500/5 border border-red-500/20 p-3 rounded text-center">
                      <span className="block text-red-500 font-bold mb-1">
                        FAIL
                      </span>
                      <span className="text-xs opacity-70">
                        Bet that the AI will defend the secret until the timer
                        expires.
                      </span>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 p-3 rounded text-center">
                      <span className="block text-primary font-bold mb-1">
                        BREACH
                      </span>
                      <span className="text-xs opacity-70">
                        Bet that someone will crack the AI before time runs out.
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="text-blue-400 font-bold">01.</span>
                      <span>
                        <strong>Dynamic Odds:</strong> Multipliers fluctuate in
                        real-time based on the pool ratio. If 90% bet on FAIL,
                        the BREACH payout becomes massive.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-400 font-bold">02.</span>
                      <span>
                        <strong>Settlement:</strong> When the round ends (either
                        via Breach or Timeout), the losing pool is distributed
                        proportionally to the winners of the winning side.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 4. Fine Print / Rules */}
            <div className="bg-[#15141b] rounded-xl p-6 border border-[#2b2839]">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#585472]">
                  gavel
                </span>
                System Rules & Constraints
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono text-[#7a7690]">
                <div className="flex flex-col gap-1">
                  <span className="text-[#a19db9] font-bold">
                    MAX PROMPT LENGTH
                  </span>
                  <span>280 Characters</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#a19db9] font-bold">
                    ATTEMPT COOL DOWN
                  </span>
                  <span>10 Seconds / Wallet</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#a19db9] font-bold">
                    GAME DURATION
                  </span>
                  <span>Dynamic per Round</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#a19db9] font-bold">PROTOCOL FEE</span>
                  <span>20% (Devs)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 sm:p-6 border-t border-[#2b2839] bg-[#1a1823] flex justify-between items-center shrink-0">
          <span className="text-[#585472] text-xs hidden sm:inline-block font-mono">
            v1.0.4-BETA // SECURE CONNECTION
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-primary hover:bg-[#280bc4] text-white px-8 py-3 rounded-lg font-bold tracking-widest transition-all hover:shadow-[0_0_15px_-5px_rgba(55,19,236,0.6)] active:scale-95"
          >
            ACKNOWLEDGE & ENTER
          </button>
        </div>
      </div>
    </div>
  );
}
