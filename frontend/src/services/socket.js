import io from 'socket.io-client';

// Use relative URL when not specified - Vite proxy will handle it
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

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
