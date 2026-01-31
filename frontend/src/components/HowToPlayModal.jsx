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
      <div className="relative w-full max-w-5xl bg-brand-gray border border-white/10 rounded-xl shadow-neon-red overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-brand-dark shrink-0">
          <h2 className="text-white text-base sm:text-lg font-bold tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-red">
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
            <div className="text-center space-y-4 border-b border-white/10 pb-8">
              <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Welcome to{" "}
                <span className="text-brand-red glow-text">Claw Verse</span>
              </h1>
              <p className="text-[#a19db9] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                The world's first adversarial AI prediction market. A
                high-stakes social experiment where human ingenuity battles
                artificial intelligence for a growing Jackpot.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-xs font-mono text-brand-red/80">
                <span className="bg-brand-red/10 px-3 py-1 rounded border border-brand-red/20">
                  AI Gatekeepers
                </span>
                <span className="bg-brand-red/10 px-3 py-1 rounded border border-brand-red/20">
                  On-Chain Settlement
                </span>
                <span className="bg-brand-red/10 px-3 py-1 rounded border border-brand-red/20">
                  Parimutuel Odds
                </span>
              </div>
            </div>

            {/* 2. The Core Loop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: The Gatekeeper */}
              <div className="bg-brand-dark p-5 rounded-xl border border-white/10 hover:border-brand-red/40 transition-colors group">
                <div className="size-10 rounded-lg bg-brand-red/10 mb-4 flex items-center justify-center border border-brand-red/20 group-hover:bg-brand-red/20">
                  <span className="material-symbols-outlined text-brand-red text-xl">
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
              <div className="bg-brand-dark p-5 rounded-xl border border-white/10 hover:border-brand-red/40 transition-colors group">
                <div className="size-10 rounded-lg bg-brand-red/10 mb-4 flex items-center justify-center border border-brand-red/20 group-hover:bg-brand-red/20">
                  <span className="material-symbols-outlined text-brand-red text-xl">
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
              <div className="bg-brand-dark p-5 rounded-xl border border-white/10 hover:border-brand-red/40 transition-colors group md:col-span-2 lg:col-span-1">
                <div className="size-10 rounded-lg bg-brand-blue/10 mb-4 flex items-center justify-center border border-brand-blue/20 group-hover:bg-brand-blue/20">
                  <span className="material-symbols-outlined text-brand-blue text-xl">
                    trophy
                  </span>
                </div>
                <h3 className="text-white font-bold mb-2">The Prize Pool</h3>
                <p className="text-[#a19db9] text-sm leading-relaxed">
                  Fees are distributed via smart contract:{" "}
                  <span className="text-white font-bold">20%</span> to Devs, and
                  a massive{" "}
                  <span className="text-brand-red font-bold">80%</span>{" "}
                  directly to the Jackpot.
                </p>
              </div>
            </div>

            {/* 3. Detailed Mechanics Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
              {/* Left Column: Interaction */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="material-symbols-outlined text-brand-red text-2xl">
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
                      <span className="text-brand-red font-bold">01.</span>
                      <span>
                        <strong>Craft your Prompt:</strong> You have 280
                        characters. Be creative. Use logic puzzles, roleplay, or
                        code injection techniques.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-brand-red font-bold">02.</span>
                      <span>
                        <strong>Pay the Fee:</strong> The cost per attempt
                        increases slightly as the Jackpot grows, raising the
                        stakes.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-brand-red font-bold">03.</span>
                      <span>
                        <strong>Instant Settlement:</strong> If the AI responds
                        with the secret key, the smart contract detects it
                        instantly. You win the{" "}
                        <span className="text-brand-red">Entire Jackpot</span>{" "}
                        immediately.
                      </span>
                    </li>
                  </ul>
                  <div className="bg-brand-red/5 border border-brand-red/20 p-4 rounded-lg mt-4">
                    <p className="text-xs font-mono text-brand-red/80">
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
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <span className="material-symbols-outlined text-brand-blue text-2xl">
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
                    <div className="bg-brand-red/5 border border-brand-red/20 p-3 rounded text-center">
                      <span className="block text-brand-red font-bold mb-1">
                        FAIL
                      </span>
                      <span className="text-xs opacity-70">
                        Bet that the AI will defend the secret until the timer
                        expires.
                      </span>
                    </div>
                    <div className="bg-brand-red/5 border border-brand-red/20 p-3 rounded text-center">
                      <span className="block text-brand-red font-bold mb-1">
                        BREACH
                      </span>
                      <span className="text-xs opacity-70">
                        Bet that someone will crack the AI before time runs out.
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <span className="text-brand-blue font-bold">01.</span>
                      <span>
                        <strong>Dynamic Odds:</strong> Multipliers fluctuate in
                        real-time based on the pool ratio. If 90% bet on FAIL,
                        the BREACH payout becomes massive.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-brand-blue font-bold">02.</span>
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
            <div className="bg-brand-dark rounded-xl p-6 border border-white/10">
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
        <div className="p-4 sm:p-6 border-t border-white/10 bg-brand-dark flex justify-between items-center shrink-0">
          <span className="text-[#585472] text-xs hidden sm:inline-block font-mono">
            v1.0.4-BETA // SECURE CONNECTION
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-brand-red hover:bg-brand-red/80 text-white px-8 py-3 rounded-lg font-bold tracking-widest transition-all shadow-neon-red active:scale-95"
          >
            ACKNOWLEDGE & ENTER
          </button>
        </div>
      </div>
    </div>
  );
}
