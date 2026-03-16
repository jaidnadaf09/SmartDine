import "./loadEnv";
import express from "express";
import cors from "cors";
import { sequelize } from "./models";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
// @ts-ignore
import xss from "xss-clean";

import authRoutes from "./routes/authRoutes";
import orderRoutes from "./routes/orderRoutes";
import tableRoutes from "./routes/tableRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import menuRoutes from "./routes/menuRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import adminRoutes from "./routes/adminRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import chefRoutes from "./routes/chefRoutes";
import walletRoutes from "./routes/walletRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import { initScheduler } from "./utils/scheduler";


const app = express();

// 1. Enable trust proxy (must be before middleware)
app.set("trust proxy", 1);

// 2. Security Middleware (helmet and xss-clean)
app.use(helmet());
app.use(xss());

// 3. Body Parsing
app.use(express.json());

// 4. CORS configuration
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://myrasoighar.netlify.app",
            process.env.FRONTEND_URL || ""
        ].filter(Boolean),
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    })
);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 5. Apply rate limiter to all API routes (after body parser and cors)
app.use("/api", apiLimiter);

// Request logger
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
    next();
});

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/chef", chefRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
    res.send("SmartDine API is running");
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
    console.error("GLOBAL ERROR:", err);
    res.status(500).json({
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully");

        // Fix PostgreSQL ENUM: add 'ready' status if missing
        // (Sequelize sync({ alter: true }) cannot add new values to existing ENUMs)
        try {
            await sequelize.query(
                `ALTER TYPE "enum_orders_status" ADD VALUE IF NOT EXISTS 'ready';`
            );
            await sequelize.query(
                `ALTER TYPE "enum_orders_status" ADD VALUE IF NOT EXISTS 'cancelled';`
            );
            console.log("ENUM fix applied: 'ready' and 'cancelled' status ensured.");
        } catch (enumError: any) {
            // Ignore if the type doesn't exist yet (first run) or value already exists
            console.log("ENUM fix note:", enumError?.message || "skipped");
        }

        await sequelize.sync({ alter: true });
        console.log("Database tables synchronized");

        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            
            // Initialize automated tasks
            initScheduler();
        });

    } catch (error) {
        console.error("Database connection failed:", error);
    }
};

startServer();
