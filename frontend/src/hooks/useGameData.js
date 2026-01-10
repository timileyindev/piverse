import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { socket } from '../services/socket';
import * as api from '../services/api';
import { useConnection } from '@solana/wallet-adapter-react';
import { useSolanaConfig } from '../context/ConfigContext';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export function useLiveFeed() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['feed'],
    queryFn: api.fetchFeed,
    refetchOnWindowFocus: false // rely on socket for updates
  });

  useEffect(() => {
    socket.on('new_feed_event', (newEvent) => {
      // Transform socket event to match feed item format
      // Socket sends: { type, walletAddress, userMessage, aiResponse, timestamp }
      // Feed expects: { role, content, walletAddress, createdAt, _id }
      
      if (newEvent.type === 'chat' && newEvent.userMessage && newEvent.aiResponse) {
        const userMsg = {
          _id: `user_${Date.now()}`,
          role: 'user',
          content: newEvent.userMessage,
          walletAddress: newEvent.walletAddress,
          createdAt: newEvent.timestamp,
          isNew: true // Flag for animation
        };
        
        const aiMsg = {
          _id: `ai_${Date.now()}`,
          role: 'ai', 
          content: newEvent.aiResponse,
          walletAddress: newEvent.walletAddress,
          createdAt: newEvent.timestamp,
          isNew: true // Flag for animation
        };
        
        queryClient.setQueryData(['feed'], (oldData) => {
          if(!oldData) return [aiMsg, userMsg];
          // Prepend both messages (AI first since feed is reversed)
          return [aiMsg, userMsg, ...oldData].slice(0, 50);
        });
      } else {
        // Fallback for other event types
        queryClient.setQueryData(['feed'], (oldData) => {
          if(!oldData) return [newEvent];
          return [newEvent, ...oldData].slice(0, 50);
        });
      }
    });

    return () => {
      socket.off('new_feed_event');
    };
  }, [queryClient]);

  return query;
}

export function useGameStats() {
    const { connection } = useConnection();
    const config = useSolanaConfig();
    // If config failed, return error immediately
    if (config.error) {
        return { 
            data: null, 
            watcherCount: 0, 
            status: 'error',
            isPending: false, 
            isLoading: false, 
            isError: true, 
            error: new Error(config.error) 
        };
    }

    const { programId, idl, isLoading: configLoading } = config;
    const [watcherCount, setWatcherCount] = useState(0);

    const query = useQuery({
        queryKey: ['gameStats', programId?.toString()],
        queryFn: async () => {
             if (!programId || !idl) {
                 throw new Error("Program not loaded");
             }
             
             // Get the current game ID from the backend
             const backendStats = await api.fetchStats();
             
             if (!backendStats?.gameId) {
                 return {
                     status: "not_initialized",
                     name: "OFFLINE",
                     jackpot: 0,
                     totalAttempts: 0,
                     attemptPrice: 0.01,
                     pda: null,
                     gameId: null,
                     devWallet: null,
                     initialized: false
                 };
             }

             // Derive PDA locally from gameId
             const gameIdBN = BigInt(backendStats.gameId);
             const gameIdBuffer = Buffer.alloc(8);
             gameIdBuffer.writeBigUInt64LE(gameIdBN);
             
             const [gameStatePda] = PublicKey.findProgramAddressSync(
                 [Buffer.from("game_state"), gameIdBuffer],
                 programId
             );

             const provider = new AnchorProvider(connection, { publicKey: PublicKey.default }, { preflightCommitment: "processed" });
             const program = new Program(idl, provider);

             try {
                 const account = await program.account.gameState.fetch(gameStatePda);
                 
                 // Parse market status enum
                 const marketStatusKey = Object.keys(account.marketStatus)[0];
                 
                 return {
                     status: account.isActive ? "active" : "inactive",
                     name: backendStats?.name,
                     jackpot: account.jackpot.toNumber() / 1000000000,
                     totalAttempts: account.totalAttempts.toNumber(),
                     attemptPrice: account.attemptPrice.toNumber() / 1000000000,
                     pda: gameStatePda.toString(),
                     gameId: backendStats.gameId,
                     devWallet: account.devWallet.toString(),
                     endTime: account.endTime.toNumber() * 1000,
                     marketStatus: marketStatusKey, // 'active', 'breached', or 'failed'
                     winner: account.winner?.toString() || null,
                     initialized: true
                 };
             } catch (e) {
                 console.warn('[useGameStats] On-chain fetch failed:', e.message);
                 return {
                     status: "error",
                     name: backendStats?.name,
                     jackpot: 0,
                     totalAttempts: 0,
                     attemptPrice: 0.01,
                     pda: gameStatePda.toString(),
                     gameId: backendStats.gameId,
                     devWallet: null,
                     endTime: null,
                     initialized: false
                 };
             }
        },
        refetchInterval: 10000,
        enabled: !configLoading && !!programId && !!idl,
        retry: 2,
    });

    useEffect(() => {
        socket.on('watcher_count', (count) => {
            setWatcherCount(count);
        });

        return () => {
             socket.off('watcher_count');
        }
    }, []);

    return { ...query, watcherCount };
}

export function useMarketStats() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['market'],
        queryFn: api.fetchMarketStats,
    });

    useEffect(() => {
        socket.on('market_stats_update', (newStats) => {
             queryClient.setQueryData(['market'], newStats);
        });
        
        return () => {
            socket.off('market_stats_update');
        }
    }, [queryClient]);

    return query;
}

export function useUserPredictions(walletAddress) {
    return useQuery({
        queryKey: ['predictions', walletAddress],
        queryFn: () => api.fetchUserPredictions(walletAddress),
        enabled: !!walletAddress
    });
}

export function usePlacePrediction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.placePrediction,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['predictions', variables.walletAddress]);
            queryClient.invalidateQueries(['activePrediction', variables.walletAddress]);
        }
    });
}

export function useSendChatMessage() {
     return useMutation({
        mutationFn: api.sendChatMessage,
     });
}

export function useActivePrediction(walletAddress, gameStats) {
  const { connection } = useConnection();
  const { idl } = useSolanaConfig();
  
  return useQuery({
      queryKey: ['activePrediction', walletAddress, gameStats?.pda],
      queryFn: async () => {
          if (!walletAddress || !gameStats?.pda || !idl) return null;
          
          const provider = new AnchorProvider(connection, { publicKey: new PublicKey(walletAddress) }, { preflightCommitment: "processed" });
          const program = new Program(idl, provider);
          const programPubkey = new PublicKey(idl.address);

          const gameStatePubkey = new PublicKey(gameStats.pda);
          const [predictionPda] = PublicKey.findProgramAddressSync(
              [
                Buffer.from("prediction"), 
                gameStatePubkey.toBuffer(), 
                new PublicKey(walletAddress).toBuffer()
              ],
              programPubkey
          );

          try {
              const account = await program.account.prediction.fetch(predictionPda);
              return {
                  amount: account.amount.toString(),
                  side: Object.keys(account.side)[0], // { fail: {} } -> 'fail'
                  claimed: account.claimed,
                  pda: predictionPda.toString()
              };
          } catch (e) {
              // Account likely doesn't exist yet (User hasn't bet)
              return null;
          }
      },
      enabled: !!walletAddress && !!gameStats?.pda && !!idl
  });
}
