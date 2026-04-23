import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

let io: Server;

interface AuthenticatedSocket extends Socket {
    userId?: number;
    userRole?: string;
}

export const initSocket = (server: any): Server => {
    io = new Server(server, {
        cors: {
            origin: [
                "http://localhost:5173",
                process.env.FRONTEND_URL || "",
            ].filter(Boolean),
            credentials: true,
        },
        // Cap reconnect storms at the client level too
        connectionStateRecovery: {},
    });

    io.on("connection", (socket: AuthenticatedSocket) => {
        const token = socket.handshake.auth?.token;
        
        if (token) {
            try {
                const secret = process.env.JWT_SECRET || "fallback_secret";
                const decoded = jwt.verify(token, secret) as {
                    id: number;
                    role: string;
                };

                socket.userId = decoded.id;
                socket.userRole = decoded.role;

                // Instant room joining
                socket.join(`user:${decoded.id}`);

                const role = (decoded.role || "").toLowerCase();
                if (role === "admin") socket.join("admin");
                if (role === "chef") socket.join("chef");

                console.log(`[WS] Authenticated: ${decoded.id} (${decoded.role}) joined rooms`);
            } catch (err) {
                console.warn("[WS] Handshake auth failed:", err);
            }
        } else {
            console.log(`[WS] Anonymous Connection: ${socket.id}`);
        }

        socket.on("disconnect", () => {
            console.log(`[WS] Disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const emitNotification = (userId: number, payload: { type: string }): void => {
    if (!io) return;
    io.to(`user:${userId}`).emit("notification:new", payload);
};

export const emitOrderUpdate = (order: any): void => {
    if (!io) return;
    io.to("admin").emit("order:updated", order);
    io.to("chef").emit("order:updated", order);
    if (order && order.userId) {
        io.to(`user:${order.userId}`).emit("order:updated", order);
    }
};

export const emitBookingUpdate = (booking: any): void => {
    if (!io) return;
    io.to("admin").emit("booking:updated", booking);
    if (booking && booking.userId) {
        io.to(`user:${booking.userId}`).emit("booking:updated", booking);
    }
};

export const getIO = (): Server => {
    if (!io) throw new Error("[WS] Socket.io not initialized");
    return io;
};
