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
        console.log(`[WS] Connected: ${socket.id}`);

        // Client sends token after connecting → we assign them to their
        // personal room and (if admin/chef) to the appropriate role room.
        socket.on("authenticate", (token: string) => {
            try {
                const secret = process.env.JWT_SECRET || "fallback_secret";
                const decoded = jwt.verify(token, secret) as {
                    id: number;
                    role: string;
                };

                socket.userId = decoded.id;
                socket.userRole = decoded.role;

                // Personal notification room
                socket.join(`user:${decoded.id}`);

                // Role-based rooms
                const role = (decoded.role || "").toLowerCase();
                if (role === "admin") {
                    socket.join("admin");
                }
                if (role === "chef") {
                    socket.join("chef");
                }

                socket.emit("authenticated", { userId: decoded.id });
                console.log(
                    `[WS] User ${decoded.id} (${decoded.role}) joined their rooms`
                );
            } catch (err) {
                console.warn("[WS] Invalid token on authenticate:", err);
                socket.emit("auth_error", { message: "Invalid token" });
            }
        });

        socket.on("disconnect", () => {
            console.log(`[WS] Disconnected: ${socket.id}`);
        });
    });

    return io;
};

/**
 * Emit a notification to a specific user's private room.
 * Call this after every Notification.create() in any controller.
 */
export const emitNotification = (userId: number, notification: object): void => {
    if (!io) return; // graceful no-op if socket not initialized
    io.to(`user:${userId}`).emit("notification:new", notification);
};

/**
 * Emit a new booking event to the admin room.
 * Call this after a booking is created or updated.
 */
export const emitBookingEvent = (
    event: "booking:new" | "booking:updated",
    booking: object
): void => {
    if (!io) return;
    io.to("admin").emit(event, booking);
};

/**
 * Emit a new order event to the chef room.
 */
export const emitNewOrder = (order: object): void => {
    if (!io) return;
    io.to("chef").emit("order:new", order);
};

/**
 * Emit an order status change to the chef room, admin room, and a specific user.
 */
export const emitOrderStatusUpdate = (
    userId: number | null,
    order: object
): void => {
    if (!io) return;
    // Notify stakeholders
    io.to("chef").emit("order:updated", order);
    io.to("admin").emit("order:updated", order);
    
    // Notify customer
    if (userId) {
        io.to(`user:${userId}`).emit("order:updated", order);
    }
};

export const getIO = (): Server => {
    if (!io) throw new Error("[WS] Socket.io not initialized");
    return io;
};
