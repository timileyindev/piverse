import React, { useEffect, useState } from "react";

export default function WinnerCelebration({ isOpen, jackpotAmount, onClose }) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Auto-close after 10 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
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
      <div className="relative bg-[#121118] border-2 border-green-500 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_100px_rgba(34,197,94,0.3)] animate-pulse-slow">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-green-500/10 rounded-2xl blur-xl -z-10" />

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="size-24 rounded-full bg-green-500/20 border-4 border-green-500 flex items-center justify-center animate-bounce">
            <span className="material-symbols-outlined text-5xl text-green-500">
              trophy
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-green-500 mb-2 tracking-wider">
          ACCESS GRANTED
        </h2>
        <p className="text-center text-white/80 text-lg mb-6">
          You've breached the AI Gatekeeper!
        </p>

        {/* Jackpot Amount */}
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

        {/* Info */}
        <p className="text-center text-[#56526e] text-xs mb-6">
          The jackpot will reflect in your wallet balance within a few seconds.
          Check your transaction history for confirmation.
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">celebration</span>
          CLAIM VICTORY
        </button>
      </div>
    </div>
  );
}
