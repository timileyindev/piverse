import io from 'socket.io-client';

// Change URL to production one when deploying
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

// Debug: Log connection status
socket.on('connect', () => {
  console.log('[Socket.IO] Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket.IO] Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('[Socket.IO] Connection Error:', error.message);
});
