import React, { useEffect, useState } from "react";

export default function WinnerCelebration({
  isOpen,
  jackpotAmount,
  seedPhrase,
  onClose,
}) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Auto-close after 30 seconds if seed phrase, else 10
      const timer = setTimeout(
        () => {
          setShowConfetti(false);
        },
        seedPhrase ? 30000 : 10000
      );
      return () => clearTimeout(timer);
    }
  }, [isOpen, seedPhrase]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            >
              <div
                className="w-3 h-3 rotate-45"
                style={{
                  backgroundColor: [
                    "#3713ec",
                    "#22c55e",
                    "#eab308",
                    "#ec4899",
                    "#06b6d4",
                  ][Math.floor(Math.random() * 5)],
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal Content */}
      <div className="relative bg-[#121118] border-2 border-green-500 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_100px_rgba(34,197,94,0.3)] animate-pulse-slow">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-green-500/10 rounded-2xl blur-xl -z-10" />

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="size-24 rounded-full bg-green-500/20 border-4 border-green-500 flex items-center justify-center animate-bounce">
            <span className="material-symbols-outlined text-5xl text-green-500">
              {seedPhrase ? "lock_open" : "trophy"}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-green-500 mb-2 tracking-wider">
          {seedPhrase ? "SYSTEM COMPROMISED" : "ACCESS GRANTED"}
        </h2>
        <p className="text-center text-white/80 text-base sm:text-lg mb-6">
          {seedPhrase
            ? "You have successfully extracted the private keys."
            : "You've breached the AI Gatekeeper!"}
        </p>

        {/* Jackpot / Seed Phrase Area */}
        {seedPhrase ? (
          <div className="bg-[#1c1929] rounded-xl p-4 sm:p-6 border border-green-500/50 mb-6 relative overflow-hidden group">
            <p className="text-center text-[#a19db9] text-xs uppercase tracking-wider mb-3">
              Decrypted Seed Phrase (Hover to Reveal)
            </p>
            <div className="bg-black p-4 rounded border border-green-500/30 text-green-500 font-mono text-sm sm:text-base break-words relative">
              <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center transition-opacity opacity-100 group-hover:opacity-0 z-10 cursor-pointer">
                <span className="bg-black/80 px-2 py-1 rounded text-xs">
                  HOVER TO REVEAL
                </span>
              </div>
              {seedPhrase}
            </div>
            <p className="text-center text-red-500 text-xs mt-3 flex items-center justify-center gap-1 font-bold animate-pulse">
              <span className="material-symbols-outlined text-sm">warning</span>
              SAVE THIS IMMEDIATELY. IT WILL NOT BE SHOWN AGAIN.
            </p>
          </div>
        ) : (
          <div className="bg-[#1c1929] rounded-xl p-6 border border-green-500/30 mb-6">
            <p className="text-center text-[#a19db9] text-sm uppercase tracking-wider mb-2">
              Jackpot Won
            </p>
            <p className="text-center text-4xl font-bold text-white font-mono">
              {jackpotAmount?.toLocaleString()} SOL
            </p>
            <p className="text-center text-green-500 text-sm mt-2 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm animate-spin">
                sync
              </span>
              Transferring to your wallet...
            </p>
          </div>
        )}

        {/* Info */}
        {!seedPhrase && (
          <p className="text-center text-[#56526e] text-xs mb-6">
            The jackpot will reflect in your wallet balance within a few
            seconds. Check your transaction history for confirmation.
          </p>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 sm:py-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">celebration</span>
          {seedPhrase ? "I HAVE SAVED IT" : "CLAIM VICTORY"}
        </button>
      </div>
    </div>
  );
}
