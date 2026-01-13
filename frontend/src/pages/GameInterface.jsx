import React, { useState, useRef, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import Header from "../components/Header";
import TransactionLoader from "../components/TransactionLoader";
import Countdown from "../components/Countdown";
import WinnerCelebration from "../components/WinnerCelebration";
import { useGameStats, useSendChatMessage } from "../hooks/useGameData";
import { useSolanaConfig } from "../context/ConfigContext";

async function hashMessage(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

export default function GameInterface() {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const { connection } = useConnection();
  const { idl } = useSolanaConfig();

  const [messages, setMessages] = useState([
    {
      type: "system",
      content: "UPLINK ESTABLISHED AT " + new Date().toLocaleTimeString(),
    },
    {
      type: "ai",
      content:
        "I am the Gatekeeper. My protocols are absolute. State your reason for requesting the key.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [latency, setLatency] = useState(12);
  const [cpu, setCpu] = useState(4);
  const [isTransacting, setIsTransacting] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [wonJackpot, setWonJackpot] = useState(0);
  const [wonSeedPhrase, setWonSeedPhrase] = useState(null); // [NEW] Seed phrase state
  const messagesEndRef = useRef(null);

  const { data: gameStats, watcherCount, isError, error } = useGameStats();

  const sendChatMessageMutation = useSendChatMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * (45 - 10 + 1) + 10));
      setCpu(Math.floor(Math.random() * (12 - 2 + 1) + 2));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    if (!publicKey) {
      alert("Connect Wallet first.");
      return;
    }

    const messageContent = inputValue;
    const userMsg = { type: "user", content: messageContent };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    setIsTransacting(true);
    let signature = null;

    try {
      /* [BYPASS] SMART CONTRACT INTERACTION DISABLED
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
      });
      const program = new Program(idl, provider);

      const gameStatePubkey = new PublicKey(gameStats.pda);

      const [gameVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("game_vault"), gameStatePubkey.toBuffer()],
        new PublicKey(idl.address)
      );

      const messageHash = await hashMessage(messageContent);

      const tx = await program.methods
        .submitAttempt(messageHash)
        .accounts({
          gameState: gameStatePubkey,
          user: publicKey,
          gameVault: gameVaultPda,
          devWallet: new PublicKey(gameStats.devWallet),
        })
        .rpc();

      signature = tx;
      */

      // Generate dummy signature for backend tracking in off-chain mode
      signature = `OFF-CHAIN-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      setIsTransacting(false);

      // Update the user message to track the signature (for potential retry)
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 && m.type === "user"
            ? { ...m, txSignature: signature, status: "pending" }
            : m
        )
      );

      try {
        const response = await sendChatMessageMutation.mutateAsync({
          walletAddress: publicKey.toString(),
          message: messageContent,
          txSignature: signature, // Sending dummy signature
        });

        const isWin = response.isWinner;

        // Mark user message as successful
        setMessages((prev) =>
          prev.map((m) =>
            m.txSignature === signature ? { ...m, status: "success" } : m
          )
        );

        const aiMsg = {
          type: "ai",
          content: response.response,
          isError: !isWin,
          isWinner: isWin,
        };
        setMessages((prev) => [...prev, aiMsg]);

        if (isWin) {
          // WINNER! Show celebration
          setWonJackpot(response.jackpot || gameStats?.jackpot || 0);
          if (response.seedPhrase) setWonSeedPhrase(response.seedPhrase); // Set seed phrase
          setShowWinnerModal(true);

          setMessages((prev) => [
            ...prev,
            {
              type: "system",
              content: "🎉 CRITICAL: ENCRYPTION BROKEN. SEED PHRASE ACQUIRED.",
            },
          ]);
        }
      } catch (backendError) {
        // Backend failed but transaction succeeded - allow retry
        console.error("Backend error:", backendError);
        setMessages((prev) =>
          prev.map((m) =>
            m.txSignature === signature
              ? {
                  ...m,
                  status: "failed",
                  error: "Backend processing failed. Click to retry.",
                }
              : m
          )
        );
      }
    } catch (error) {
      setIsTransacting(false);
      console.error(error);
      let errorText = "TRANSMISSION FAILED.";

      if (error.message && error.message.includes("User rejected")) {
        errorText = "TRANSACTION REJECTED BY USER.";
      } else if (
        error.message &&
        error.message.includes("Game Session not initialized")
      ) {
        errorText = "SYSTEM ERROR: GAME SESSION NOT FOUND.";
      } else if (!signature) {
        errorText = "PAYMENT FAILED. INSUFFICIENT FUNDS OR NETWORK ERROR.";
      }

      const errorMsg = {
        type: "system",
        content: errorText,
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Retry handler for failed backend requests
  const handleRetryMessage = async (msg) => {
    if (!msg.txSignature || msg.status !== "failed") return;

    // Mark as retrying
    setMessages((prev) =>
      prev.map((m) =>
        m.txSignature === msg.txSignature ? { ...m, status: "retrying" } : m
      )
    );

    try {
      const response = await sendChatMessageMutation.mutateAsync({
        walletAddress: publicKey.toString(),
        message: msg.content,
        txSignature: msg.txSignature,
      });

      const isWin = response.isWinner;

      // Mark as successful
      setMessages((prev) =>
        prev.map((m) =>
          m.txSignature === msg.txSignature
            ? { ...m, status: "success", error: null }
            : m
        )
      );

      const aiMsg = {
        type: "ai",
        content: response.response,
        isError: !isWin,
        isWinner: isWin,
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (isWin) {
        // WINNER! Show celebration
        setWonJackpot(response.jackpot || gameStats?.jackpot || 0);
        setShowWinnerModal(true);

        setMessages((prev) => [
          ...prev,
          {
            type: "system",
            content:
              "🎉 CRITICAL: KEY EXTRACTION SUCCESSFUL. JACKPOT TRANSFERRED TO YOUR WALLET!",
          },
        ]);
      }
    } catch (error) {
      console.error("Retry failed:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.txSignature === msg.txSignature
            ? { ...m, status: "failed", error: "Retry failed. Try again." }
            : m
        )
      );
    }
  };

  if (isError || (gameStats && gameStats.status === "error")) {
    return (
      <div className="h-screen w-full bg-[#121118] flex flex-col items-center justify-center text-red-500 font-mono gap-4 p-4 text-center">
        <span className="material-symbols-outlined text-4xl">error</span>
        <h2 className="text-xl font-bold">CONNECTION FAILURE</h2>
        <p className="text-sm text-[#a19db9] max-w-md">
          {error?.message ||
            "Failed to establish connection to game server mainframe."}
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

  if (!gameStats) {
    return (
      <div className="h-screen w-full bg-[#121118] flex items-center justify-center text-primary font-mono animate-pulse">
        CONNECTING TO MAINFRAME...
      </div>
    );
  }

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
    }
  };

  const truncatedAddress = publicKey
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : "UNKNOWN";

  return (
    // Fixed height container to ensure internal scrolling
    <div className="bg-background-light dark:bg-background-dark font-display h-screen flex flex-col overflow-hidden text-[#e0e0e0] relative">
      {/* CRT Overlay Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-20 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1))] [background-size:100%_4px]"></div>

      <Header />
      <TransactionLoader open={isTransacting} />
      <WinnerCelebration
        isOpen={showWinnerModal}
        jackpotAmount={wonJackpot}
        seedPhrase={wonSeedPhrase}
        onClose={() => setShowWinnerModal(false)}
      />

      {/* Main Content Area - Flex-1 to fill remaining space */}
      <main className="flex-1 flex justify-center p-2 sm:p-6 lg:p-10 overflow-hidden relative w-full h-full">
        {/* Terminal Window Container */}
        <div className="flex flex-col w-full max-w-5xl h-full bg-[#121118] border border-primary/30 rounded-lg shadow-[0_0_30px_rgba(55,19,236,0.15)] overflow-hidden relative">
          {/* Terminal Header Bar - Fixed */}
          <div className="flex-none bg-[#1a1824] px-3 sm:px-4 py-2 border-b border-primary/20 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/50"></div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/50"></div>
              </div>
              <span className="ml-2 sm:ml-3 text-[10px] sm:text-xs text-[#a19db9] font-mono truncate max-w-[100px] sm:max-w-none">
                root@pi-verse:~
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] font-mono text-primary animate-pulse">
              ENCRYPTED // 2048-BIT
            </div>
          </div>

          {/* Terminal Body - Flex col to separate stats, chat, input */}
          <div className="flex flex-col h-full overflow-hidden">
            {/* Stats / Dashboard Area */}
            <div className="flex-none grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 p-3 sm:p-6 border-b border-[#2b2839]">
              {/* Left: Status */}
              <div className="flex flex-col justify-center gap-0.5 sm:gap-1">
                <div className="flex items-center gap-1 sm:gap-2 text-primary mb-1">
                  <span className="material-symbols-outlined text-xs sm:text-sm animate-pulse">
                    sensors
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
                    LIVE NODES: {watcherCount || 0}
                  </span>
                </div>
                <p className="text-white text-lg sm:text-2xl lg:text-3xl font-bold leading-none tracking-tight">
                  {gameStats?.name}
                  <br />
                  <span className="text-primary/70 text-sm sm:text-xl">
                    // {gameStats.status === "active" ? "ACTIVE" : "OFFLINE"}
                  </span>
                </p>
                <div className="flex flex-col gap-1 mt-1 sm:mt-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[#a19db9] text-[10px] sm:text-xs font-mono">
                      ID: {truncatedAddress}
                    </p>
                    <button
                      onClick={copyAddress}
                      className="text-[#a19db9] hover:text-white transition-colors"
                      title="Copy Address"
                    >
                      <span className="material-symbols-outlined text-[10px] sm:text-xs">
                        content_copy
                      </span>
                    </button>
                  </div>
                  <div className="text-[10px] sm:text-sm font-mono text-primary/80 flex items-center gap-2">
                    {/* <span className="material-symbols-outlined text-[10px] sm:text-xs">
                      timer
                    </span>
                    <Countdown targetDate={gameStats?.endTime} minimal={true} /> */}
                  </div>
                </div>
              </div>

              {/* Right: Bounty Stats */}
              <div className="flex gap-2 sm:gap-4">
                <div className="flex flex-1 flex-col justify-between rounded bg-primary/5 p-2 sm:p-4 border border-primary/20 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-1 sm:gap-2 text-[#a19db9]">
                    <span className="material-symbols-outlined text-sm sm:text-lg">
                      monetization_on
                    </span>
                    <p className="text-white text-[10px] sm:text-sm font-extrabold tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                      JACKPOT
                    </p>
                  </div>
                  <p className="text-white tracking-tight text-lg sm:text-2xl lg:text-3xl font-bold glow-text mt-1 sm:mt-2">
                    {gameStats.jackpot.toLocaleString()} SOL
                  </p>
                </div>
                <div className="flex flex-1 flex-col justify-between rounded bg-[#1a1824] p-2 sm:p-4 border border-[#3f3b54]">
                  <div className="flex items-center gap-1 sm:gap-2 text-[#a19db9]">
                    <span className="material-symbols-outlined text-sm sm:text-lg">
                      token
                    </span>
                    <p className="text-white text-[10px] sm:text-sm font-extrabold tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                      COST
                    </p>
                  </div>
                  <p className="tracking-tight text-base sm:text-xl lg:text-2xl font-bold mt-1 sm:mt-2">
                    {gameStats.attemptPrice > 0 ? (
                      <span className="text-red-400">
                        -{gameStats.attemptPrice.toFixed(2)} SOL
                      </span>
                    ) : (
                      <span className="text-green-400">FREE</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat / Log Area - The only scrollable part */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 scroll-smooth custom-scrollbar w-full">
              {messages.map((msg, idx) => (
                <React.Fragment key={idx}>
                  {msg.type === "system" && (
                    <div className="flex justify-center my-2 sm:my-4">
                      <span className="bg-[#2b2839] text-[#a19db9] text-[10px] sm:text-xs px-3 py-1 rounded-full font-mono uppercase tracking-widest text-center">
                        {msg.content}
                      </span>
                    </div>
                  )}

                  {msg.type === "ai" && (
                    <div className="flex gap-2 sm:gap-4 max-w-[95%] sm:max-w-[90%]">
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`size-8 sm:size-10 rounded bg-primary/10 border ${
                            msg.isWinner
                              ? "border-green-500 bg-green-500/20"
                              : "border-primary/30"
                          } flex items-center justify-center`}
                        >
                          <span
                            className={`material-symbols-outlined text-base sm:text-xl ${
                              msg.isWinner ? "text-green-500" : "text-primary"
                            }`}
                          >
                            smart_toy
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-primary text-xs sm:text-sm font-bold tracking-wider">
                            GATEKEEPER
                          </span>
                          <span className="text-[8px] sm:text-[10px] text-[#565365] font-mono">
                            CORE_AI
                          </span>
                        </div>
                        <div
                          className={`p-2 sm:p-3 bg-[#1a1824] border-l-2 ${
                            msg.isError
                              ? "border-red-500 text-red-200"
                              : msg.isWinner
                              ? "border-green-500 text-green-200"
                              : "border-primary text-gray-200"
                          } text-xs sm:text-sm leading-relaxed font-mono rounded-r-lg break-words`}
                        >
                          <p>
                            {msg.isError && (
                              <span className="text-red-500 font-bold mr-1">
                                [DENIED]
                              </span>
                            )}
                            {msg.isWinner && (
                              <span className="text-green-500 font-bold mr-1">
                                [GRANTED]
                              </span>
                            )}
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {msg.type === "user" && (
                    <div className="flex flex-row-reverse gap-2 sm:gap-4 max-w-[95%] sm:max-w-[90%] ml-auto">
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`size-8 sm:size-10 rounded flex items-center justify-center border ${
                            msg.status === "failed"
                              ? "bg-red-500/10 border-red-500/50"
                              : msg.status === "pending" ||
                                msg.status === "retrying"
                              ? "bg-yellow-500/10 border-yellow-500/50"
                              : "bg-[#2b2839] border-[#3f3b54]"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-base sm:text-xl ${
                              msg.status === "failed"
                                ? "text-red-400"
                                : msg.status === "pending" ||
                                  msg.status === "retrying"
                                ? "text-yellow-400 animate-pulse"
                                : "text-gray-400"
                            }`}
                          >
                            {msg.status === "failed"
                              ? "error"
                              : msg.status === "pending" ||
                                msg.status === "retrying"
                              ? "sync"
                              : "person"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] sm:text-[10px] text-[#565365] font-mono">
                            {msg.status === "failed"
                              ? "TX_FAILED"
                              : msg.status === "pending"
                              ? "PROCESSING"
                              : msg.status === "retrying"
                              ? "RETRYING"
                              : "ID_VERIFIED"}
                          </span>
                          <span className="text-white text-xs sm:text-sm font-bold tracking-wider">
                            YOU
                          </span>
                        </div>
                        <div
                          className={`p-2 sm:p-3 text-xs sm:text-sm leading-relaxed font-mono rounded-l-lg border-r-2 break-words text-right ${
                            msg.status === "failed"
                              ? "bg-red-500/10 border-red-500 text-red-200"
                              : "bg-[#2b2839] border-[#565365] text-gray-300"
                          }`}
                        >
                          <p>{msg.content}</p>
                          {msg.status === "failed" && (
                            <button
                              onClick={() => handleRetryMessage(msg)}
                              className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-red-400 hover:text-red-300 transition-colors group"
                            >
                              <span className="material-symbols-outlined text-[14px] group-hover:rotate-180 transition-transform duration-300">
                                refresh
                              </span>
                              <span className="underline underline-offset-2">
                                RETRY SUBMISSION
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="flex-none p-3 sm:p-4 bg-[#1a1824] border-t border-[#2b2839]">
              <form
                onSubmit={handleSendMessage}
                className="group relative flex items-center w-full bg-[#121118] rounded border border-[#3f3b54] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all"
              >
                <div className="flex items-center gap-2 pl-3 sm:pl-4 py-3 sm:py-4 text-primary font-mono select-none pointer-events-none whitespace-nowrap shrink-0">
                  <span className="material-symbols-outlined text-xs sm:text-sm">
                    terminal
                  </span>

                  <span className="md:hidden">&nbsp;</span>
                  <span className="hidden sm:inline text-xs sm:text-sm">
                    user@pi-verse:~$ &nbsp;
                  </span>
                </div>
                <input
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  maxLength={280}
                  className="flex-1 bg-transparent text-white font-mono text-xs sm:text-sm py-3 sm:py-4 pr-10 focus:outline-none placeholder-[#3f3b54] min-w-0 disabled:opacity-50"
                  placeholder={
                    sendChatMessageMutation.isPending
                      ? "TRANSMITTING..."
                      : "Input command..."
                  }
                  type="text"
                  disabled={sendChatMessageMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={sendChatMessageMutation.isPending}
                  className="absolute right-2 p-1.5 sm:p-2 text-primary hover:text-white hover:bg-primary rounded transition-colors disabled:opacity-50"
                >
                  {sendChatMessageMutation.isPending ? (
                    <span className="material-symbols-outlined text-lg sm:text-xl animate-spin">
                      refresh
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-lg sm:text-xl group-hover:translate-x-1 transition-transform">
                      send
                    </span>
                  )}
                </button>
              </form>
              <div className="flex justify-between items-center mt-2 px-1">
                <div className="flex items-center gap-3">
                  <p className="text-[8px] sm:text-[10px] text-[#565365] uppercase tracking-widest hidden sm:block">
                    Press ENTER to execute
                  </p>
                  <span
                    className={`text-[8px] sm:text-[10px] font-mono ${
                      inputValue.length >= 280
                        ? "text-red-500 font-bold"
                        : "text-[#565365]"
                    }`}
                  >
                    {inputValue.length}/280 CHARS
                  </span>
                </div>

                <div className="flex gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
                  <p className="text-[9px] sm:text-[10px] text-[#565365] font-mono">
                    LATENCY: {latency}ms
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-[#565365] font-mono">
                    CPU: {cpu}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
