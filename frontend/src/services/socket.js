import io from 'socket.io-client';

// Change URL to production one when deploying
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

// Debug: Log connection and events
socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
socket.on('disconnect', (r) => console.log('[Socket] Disconnected:', r));
socket.on('connect_error', (e) => console.error('[Socket] Error:', e.message));
socket.on('new_feed_event', (d) => console.log('[Socket] new_feed_event:', d));
