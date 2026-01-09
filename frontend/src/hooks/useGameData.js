import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { socket } from '../services/socket';
import * as api from '../services/api';

export function useLiveFeed() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['feed'],
    queryFn: api.fetchFeed,
    refetchOnWindowFocus: false // rely on socket for updates
  });

  useEffect(() => {
    socket.on('new_feed_event', (newEvent) => {
      // Optimistically update the feed cache
      queryClient.setQueryData(['feed'], (oldData) => {
          if(!oldData) return [newEvent];
          // Prepend new event
          return [newEvent, ...oldData].slice(0, 50);
      });
    });

    return () => {
      socket.off('new_feed_event');
    };
  }, [queryClient]);

  return query;
}

export function useGameStats() {
    const queryClient = useQueryClient();
    const [watcherCount, setWatcherCount] = useState(0);

    const query = useQuery({
        queryKey: ['stats'],
        queryFn: api.fetchStats,
    });

    useEffect(() => {
        socket.on('stats_update', (newStats) => {
            queryClient.setQueryData(['stats'], (old) => ({...old, ...newStats}));
        });

        socket.on('watcher_count', (count) => {
            setWatcherCount(count);
        });

        return () => {
             socket.off('stats_update');
             socket.off('watcher_count');
        }
    }, [queryClient]);

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
        }
    });
}

export function useSendChatMessage() {
     return useMutation({
        mutationFn: api.sendChatMessage,
     });
}
