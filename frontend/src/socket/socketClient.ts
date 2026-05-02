import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 
  import.meta.env.VITE_SOCKET_URL || 
  import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 
  'http://localhost:5000';

let socketInstance: Socket | null = null;

/**
 * Singleton getter for the WebSocket client.
 * Enforces a single connection instance across all portals.
 * Reconnects infinitely to ensure real-time stability.
 */
export const getSocket = (): Socket => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    socketInstance.on("connect", () => {
      console.log("[WS] connected", socketInstance?.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[WS] disconnected", reason);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("[WS] error", err.message);
    });
  }

  // ALWAYS update auth token before connecting
  socketInstance.auth = { token };

  // Only connect if not already connected
  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
};

export const reconnectSocket = (): Socket | null => {
  if (socketInstance) {
    socketInstance.disconnect();
  }
  return getSocket();
};
