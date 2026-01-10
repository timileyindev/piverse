import io from 'socket.io-client';

// Change URL to production one when deploying
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
//   transports: ['websocket'], // Force WebSocket to avoid sticky session issues
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
