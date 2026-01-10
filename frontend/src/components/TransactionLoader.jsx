import React from "react";

export default function TransactionLoader({ open }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-6 p-8 bg-[#121118] border border-primary/30 rounded-xl shadow-[0_0_50px_-10px_rgba(55,19,236,0.5)] max-w-sm w-full mx-4">
        {/* Animated Rings */}
        <div className="relative size-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-[spin_3s_linear_infinite]"></div>
          <div className="absolute inset-2 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-[spin_1.5s_linear_infinite]"></div>
          <div className="absolute inset-0 rounded-full border-2 border-b-primary/50 border-t-transparent border-l-transparent border-r-transparent animate-[spin_2s_linear_reverse_infinite]"></div>
          <img
            src="/favicon.svg"
            alt="Loading"
            className="size-8 object-contain animate-pulse"
          />
        </div>

        {/* Text Content */}
        <div className="text-center space-y-2">
          <h3 className="text-white text-lg font-bold tracking-wider uppercase glow-text">
            Wallet Interaction
          </h3>
          <p className="text-[#a19db9] text-sm font-mono leading-relaxed">
            Please approve the transaction in your wallet to proceed...
          </p>
        </div>

        {/* Status Decoration */}
        <div className="flex items-center gap-2 text-[10px] text-primary/70 font-mono uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
          <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
          Waiting for signature
        </div>
      </div>
    </div>
  );
}
