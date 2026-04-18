import { io, Socket } from "socket.io-client";

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const socket: Socket = io(SOCKET_URL, {
    autoConnect: false,        // Connect manually after authentication
    withCredentials: true,
    reconnectionAttempts: 3,   // Cap retries to avoid storm on backend down
    reconnectionDelay: 2000,
});

// Silent failure — never block the UI if WebSocket is unavailable
socket.on("connect_error", (err) => {
    console.warn(
        "[SmartDine] WebSocket unavailable, polling fallback active.",
        err.message
    );
});

socket.on("connect", () => {
    console.log("[SmartDine] WebSocket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
    console.log("[SmartDine] WebSocket disconnected:", reason);
});

export default socket;
