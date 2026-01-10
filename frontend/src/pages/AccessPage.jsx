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
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex items-center justify-center p-2 sm:p-4 selection:bg-primary selection:text-white overflow-hidden relative">
      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />

      {/* Background texture/grid effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(#3713ec_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>

      {/* Main Terminal Container */}
      <div className="relative w-full max-w-[800px] flex flex-col bg-[#121118] border border-[#2b2839] rounded-xl shadow-[0_0_50px_-12px_rgba(55,19,236,0.25)] overflow-hidden z-10 backdrop-blur-sm">
        {/* Header / Status Bar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-[#2b2839] bg-[#1a1823] px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 sm:gap-3 text-white">
            <div className="size-5 sm:size-6 flex items-center justify-center">
              <img
                src="/favicon.svg"
                alt="Pi Verse Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-white text-xs sm:text-sm font-bold tracking-[0.1em]">
              // PI VERSE ACCESS TERMINAL
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="bg-primary/20 hover:bg-primary/30 text-primary hover:text-white border border-primary/50 hover:border-primary px-3 py-1.5 rounded text-[10px] sm:text-xs font-bold tracking-wider transition-all shadow-[0_0_10px_-3px_rgba(55,19,236,0.3)] hover:shadow-[0_0_15px_-3px_rgba(55,19,236,0.6)] animate-pulse hover:animate-none"
            >
              [ HOW TO PLAY ]
            </button>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  connected ? "bg-green-500" : "bg-red-500"
                } animate-pulse`}
              ></div>
              <span className="text-[#a19db9] text-[10px] sm:text-xs font-bold tracking-widest hidden sm:inline">
                NET: {connected ? "SECURE" : "UNVERIFIED"}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex flex-col p-4 sm:p-10 min-h-[400px] sm:min-h-[500px]">
          {/* Headline & Meta */}
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <h1 className="text-white text-2xl sm:text-4xl font-bold leading-tight mb-2 tracking-tight">
              PI VERSE
            </h1>
            <p className="text-red-500 text-xs sm:text-sm font-normal tracking-wide uppercase">
              <span className="material-symbols-outlined align-bottom text-sm mr-1">
                warning
              </span>
              Interaction is currency. Words are bets.
            </p>
          </div>

          {/* Socials & Contract Info */}
          <div className="flex flex-wrap items-center gap-3 mb-6 sm:mb-8 font-mono text-xs sm:text-sm">
            <a
              href="https://x.com/piversedotfun?s=21"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1d1c27] text-white px-3 py-2 rounded border border-[#3f3b54] hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-[0_0_15px_-5px_rgba(55,19,236,0.5)] transition-all duration-300 group"
            >
              {/* Minimal X Logo */}
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4 fill-current"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
              <span className="font-bold tracking-wide">@piversedotfun</span>
            </a>

            <div className="flex items-center gap-2 bg-[#1d1c27]/50 text-[#a19db9] px-3 py-2 rounded border border-[#3f3b54]/50 cursor-wait select-none">
              <span className="material-symbols-outlined text-sm">token</span>
              <span>
                CA:{" "}
                <span className="text-white/40 tracking-widest font-bold">
                  COMING SOON
                </span>
              </span>
            </div>
          </div>

          {/* Terminal Output Simulation */}
          <div className="flex flex-col gap-1 mb-6 sm:mb-8 font-mono text-xs sm:text-sm text-primary/80 p-3 sm:p-4 rounded-lg bg-black/20 border border-white/5 h-24 sm:h-32 overflow-hidden">
            <p className="opacity-60">&gt; INITIATING HANDSHAKE PROTOCOL...</p>
            <p className="opacity-80">&gt; VERIFYING ENCRYPTION KEYS...</p>
            <p className="opacity-80">&gt; SOLANA NETWORK DETECTED.</p>
            <p className="text-white animate-pulse">{typedStatus}</p>
          </div>

          {/* Login / Connect Action */}
          <div className="flex flex-col gap-4 sm:gap-6 max-w-lg w-full">
            {connected && (
              <div className="group relative">
                <div className="absolute inset-0 bg-primary/5 rounded-lg -z-10"></div>
                <div className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[#3f3b54] bg-[#1d1c27]">
                  <span className="text-primary font-bold text-base sm:text-lg mr-2 sm:mr-3 select-none whitespace-nowrap">
                    ID &gt;
                  </span>
                  <span className="text-white font-mono text-sm sm:text-base tracking-wider truncate">
                    {publicKey?.toString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 mt-2">
              <button
                // disabled={connected}
                onClick={() => {
                  if (connected) {
                    onEnter();
                  } else {
                    handleConnectClick();
                  }
                }}
                className="disabled:opacity-50 disabled:pointer-events-none relative w-full sm:flex-1 group overflow-hidden rounded-lg bg-primary hover:bg-[#280bc4] transition-colors h-12 flex items-center justify-center text-white font-bold tracking-widest border border-transparent hover:border-white/20 hover:shadow-[0_0_20px_-5px_rgba(55,19,236,0.6)] text-sm sm:text-base"
              >
                <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity -ml-6 group-hover:ml-0 duration-300">
                  &gt;
                </span>
                {connected ? "[ ENTER PI VERSE ]" : "[ PLAY NOW ]"}
              </button>
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
