import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Header() {
  const { connected, publicKey, disconnect } = useWallet();
  const [location, setLocation] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleDisconnect = async () => {
    await disconnect();
    setLocation("/");
  };

  const isActive = (path) => location === path;

  return (
    <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-dashed border-[#2b2839] bg-[#121118]/80 backdrop-blur-sm px-4 sm:px-6 py-3 sm:py-4 z-50 relative">
      <div className="flex items-center gap-3 sm:gap-4 text-white">
        <div className="size-5 sm:size-6 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-xl sm:text-[28px] animate-pulse">
            vpn_key
          </span>
        </div>
        <h2 className="text-white text-lg sm:text-xl font-bold leading-tight tracking-widest uppercase glow-text border-b-2 border-transparent hover:border-primary transition-all">
          PI VERSE
        </h2>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden sm:flex items-center gap-6">
        <div className="flex items-center gap-2 text-[#a19db9] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>NET: SECURE</span>
        </div>
        <Link href="/game">
          <a
            className={`hover:text-white transition-colors text-sm font-medium tracking-wider ${
              isActive("/game") ? "text-primary font-bold" : "text-[#a19db9]"
            }`}
          >
            TERMINAL
          </a>
        </Link>
        <Link href="/prediction">
          <a
            className={`hover:text-white transition-colors text-sm font-medium tracking-wider ${
              isActive("/prediction")
                ? "text-primary font-bold"
                : "text-[#a19db9]"
            }`}
          >
            PREDICTION
          </a>
        </Link>
        <button
          onClick={handleDisconnect}
          className="text-red-500 hover:text-red-400 transition-colors text-xs font-bold tracking-wider flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          TERMINATE
        </button>
      </div>

      {/* Mobile Menu Icon */}
      <div className="sm:hidden text-white">
        <button onClick={() => setShowMobileMenu(!showMobileMenu)}>
          <span className="material-symbols-outlined text-white">
            {showMobileMenu ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {showMobileMenu && (
        <div className="absolute top-full left-0 right-0 bg-[#121118] border-b border-[#2b2839] p-4 flex flex-col gap-4 shadow-xl z-50">
          <Link href="/game">
            <a
              className={`hover:text-white transition-colors text-sm font-medium tracking-wider flex items-center gap-2 ${
                isActive("/game") ? "text-primary font-bold" : "text-[#a19db9]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                terminal
              </span>
              TERMINAL
            </a>
          </Link>
          <Link href="/prediction">
            <a
              className={`hover:text-white transition-colors text-sm font-medium tracking-wider flex items-center gap-2 ${
                isActive("/prediction")
                  ? "text-primary font-bold"
                  : "text-[#a19db9]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                analytics
              </span>
              PREDICTION
            </a>
          </Link>
          <div className="h-px bg-[#2b2839] w-full"></div>
          <button
            onClick={handleDisconnect}
            className="text-red-500 hover:text-red-400 transition-colors text-xs font-bold tracking-wider flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            TERMINATE SESSION
          </button>
        </div>
      )}
    </header>
  );
}
