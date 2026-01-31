import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

import HowToPlayModal from "../components/HowToPlayModal";

export default function AccessPage({ onEnter }) {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [typedStatus, setTypedStatus] = useState("");
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Simple typing effect for the status log
  useEffect(() => {
    const text = connected
      ? "> IDENTITY VERIFIED. ACCESS GRANTED."
      : "> WAITING FOR WALLET CONNECTION...";

    setTypedStatus("");
    let i = 0;
    const interval = setInterval(() => {
      setTypedStatus((prev) => text.substring(0, i + 1));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, [connected]);

  const handleConnectClick = () => {
    if (!connected) {
      setVisible(true);
    } else {
      // Handle entering the game - for now just log
      console.log("Entering system...");
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen flex items-center justify-center p-2 sm:p-4 selection:bg-brand-red selection:text-white overflow-hidden relative font-orbitron">
      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />

      {/* Background texture/grid effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(#D30000_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-brand-dark via-transparent to-transparent"></div>

      {/* Main Terminal Container */}
      <div className="relative w-full max-w-[800px] flex flex-col bg-brand-gray border border-white/10 rounded-xl shadow-neon-red overflow-hidden z-10 backdrop-blur-sm">
        {/* Header / Status Bar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-white/10 bg-brand-dark px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 sm:gap-3 text-white">
            <div className="size-5 sm:size-6 flex items-center justify-center">
              <img
                src="/assets/hero.jpg"
                alt="Claw Verse Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <h2 className="text-white text-xs sm:text-sm font-bold tracking-[0.1em] font-mono">
              // CLAW VERSE ACCESS TERMINAL
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="relative overflow-hidden group bg-brand-red hover:bg-brand-red/90 text-white border border-white/20 hover:border-white/50 px-4 py-1.5 rounded text-[10px] sm:text-xs font-bold tracking-wider transition-all shadow-neon-red"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer pointer-events-none"></span>
              <span className="relative z-10">[ PROTOCOL ]</span>
            </button>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  connected ? "bg-green-500" : "bg-brand-red"
                } animate-pulse`}
              ></div>
              <span className="text-white/60 text-[10px] sm:text-xs font-bold tracking-widest hidden sm:inline font-mono">
                NET: {connected ? "SECURE" : "UNVERIFIED"}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-col p-4 sm:p-10 min-h-[400px] sm:min-h-[500px]">
          {/* Hero Section */}
          <div className="flex flex-col items-center mb-8">
            <img 
              src="/assets/crab-brain.jpg" 
              alt="Claw Verse AI" 
              className="w-48 h-48 object-cover rounded-2xl border-2 border-brand-red shadow-neon-red mb-6"
            />
            <div className="text-center">
              <h1 className="text-white text-4xl sm:text-6xl font-black leading-tight mb-2 tracking-tighter text-brand-red shadow-neon-red">
                CLAW VERSE
              </h1>
              <p className="text-brand-blue text-xs sm:text-sm font-bold tracking-widest uppercase font-mono">
                <span className="material-symbols-outlined align-bottom text-sm mr-1">
                  terminal
                </span>
                The Crab is the Gatekeeper. Persuasion is your weapon.
              </p>
            </div>
          </div>

          {/* Socials & Contract Info */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6 sm:mb-8 font-mono text-xs sm:text-sm">
            <a
              href="https://x.com/clawverse"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-brand-dark text-white px-3 py-2 rounded border border-white/10 hover:border-brand-red hover:bg-brand-red/5 hover:text-brand-red transition-all duration-300 group"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4 fill-current"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
              <span className="font-bold tracking-wide">@clawverse</span>
            </a>

            <div
              className="flex items-center gap-2 bg-brand-dark text-white/60 px-3 py-2 rounded border border-brand-blue/30 cursor-pointer hover:bg-brand-gray transition-colors group relative"
              onClick={() => {
                navigator.clipboard.writeText(
                  "CLAW_VERSE_CONTRACT_ADDRESS"
                );
              }}
            >
              <span className="material-symbols-outlined text-sm text-brand-blue">
                token
              </span>
              <span className="font-mono text-xs sm:text-sm">
                CA:{" "}
                <span className="text-white font-bold ml-1 tracking-wide group-hover:text-brand-blue transition-colors">
                  CLAW...pump
                </span>
              </span>
            </div>
          </div>

          {/* Terminal Output Simulation */}
          <div className="flex flex-col gap-1 mb-6 sm:mb-8 font-mono text-xs sm:text-sm text-brand-blue/80 p-3 sm:p-4 rounded-lg bg-black/40 border border-white/5 h-24 sm:h-32 overflow-hidden shadow-inner">
            <p className="opacity-60">&gt; NEURAL LINK ESTABLISHED...</p>
            <p className="opacity-80">&gt; BYPASSING FIREWALL... [SUCCESS]</p>
            <p className="opacity-80">&gt; SCANNING FOR CLAW SIGNATURES...</p>
            <p className="text-brand-red animate-pulse">{typedStatus}</p>
          </div>

          {/* Login / Connect Action */}
          <div className="flex flex-col gap-4 sm:gap-6 max-w-lg w-full mx-auto">
            {connected && (
              <div className="group relative">
                <div className="absolute inset-0 bg-brand-red/5 rounded-lg -z-10"></div>
                <div className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-white/10 bg-brand-dark">
                  <span className="text-brand-red font-bold text-base sm:text-lg mr-2 sm:mr-3 select-none whitespace-nowrap font-mono">
                    AUTH &gt;
                  </span>
                  <span className="text-white font-mono text-sm sm:text-base tracking-wider truncate">
                    {publicKey?.toString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 mt-2">
              <button
                onClick={() => {
                  if (connected) {
                    onEnter();
                  } else {
                    handleConnectClick();
                  }
                }}
                className="disabled:opacity-50 disabled:pointer-events-none relative w-full sm:flex-1 group overflow-hidden rounded-lg bg-brand-red hover:bg-brand-red/80 transition-all h-14 flex items-center justify-center text-white font-black tracking-widest border border-white/10 shadow-neon-red text-sm sm:text-lg"
              >
                {connected ? "[ ENTER CLAW VERSE ]" : "[ SYNC NEURAL LINK ]"}
              </button>
            </div>
          </div>
        </div>
              {connected && (
                <button
                  onClick={() => disconnect()}
                  className="w-full sm:w-auto rounded-lg border border-[#3f3b54] hover:border-white/40 hover:bg-white/5 transition-all h-12 flex items-center justify-center text-[#a19db9] hover:text-white font-medium tracking-wide text-sm sm:text-base px-6"
                >
                  [ TERMINATE SESSION ]
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer / System Status */}
        <div className="bg-[#0f0e14] border-t border-[#2b2839] px-4 sm:px-6 py-3 flex justify-between items-center text-[10px] sm:text-xs text-[#585472] font-mono">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[12px] sm:text-[14px]">
              memory
            </span>
            <span>MEM: 64TB FREE</span>
          </div>
          <div className="uppercase tracking-wider text-primary animate-pulse">
            STATUS: {connected ? "READY" : "AWAITING INPUT"}
          </div>
        </div>
      </div>
    </div>
  );
}
