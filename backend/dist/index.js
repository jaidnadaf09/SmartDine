"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = require("./models");
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// @ts-ignore
const xss_clean_1 = __importDefault(require("xss-clean"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const tableRoutes_1 = __importDefault(require("./routes/tableRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const menuRoutes_1 = __importDefault(require("./routes/menuRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const chefRoutes_1 = __importDefault(require("./routes/chefRoutes"));
const walletRoutes_1 = __importDefault(require("./routes/walletRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const restaurantRoutes_1 = __importDefault(require("./routes/restaurantRoutes"));
const suggestionRoutes_1 = __importDefault(require("./routes/suggestionRoutes"));
const scheduler_1 = require("./utils/scheduler");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Security Middleware
app.use((0, helmet_1.default)());
app.use((0, xss_clean_1.default)());
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply rate limiter to all API routes
app.use("/api", apiLimiter);
// Middleware
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "https://smartdine-l22i.onrender.com",
        process.env.FRONTEND_URL || ""
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));
app.use(express_1.default.json());
// Request logger
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
    next();
});
// API Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/tables", tableRoutes_1.default);
app.use("/api/bookings", bookingRoutes_1.default);
app.use("/api/menu", menuRoutes_1.default);
app.use("/api/inventory", inventoryRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/payment", paymentRoutes_1.default);
app.use("/api/chef", chefRoutes_1.default);
app.use("/api/wallet", walletRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
app.use("/api/reviews", reviewRoutes_1.default);
app.use("/api/restaurant", restaurantRoutes_1.default);
app.use("/api/suggestions", suggestionRoutes_1.default);
// Test route
app.get("/", (req, res) => {
    res.send("SmartDine API is running");
});
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err);
    res.status(500).json({
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await models_1.sequelize.authenticate();
        console.log("Database connected successfully");
        // Fix PostgreSQL ENUM: add 'ready' status if missing
        // (Sequelize sync({ alter: true }) cannot add new values to existing ENUMs)
        try {
            await models_1.sequelize.query(`ALTER TYPE "enum_orders_status" ADD VALUE IF NOT EXISTS 'ready';`);
            await models_1.sequelize.query(`ALTER TYPE "enum_orders_status" ADD VALUE IF NOT EXISTS 'cancelled';`);
            console.log("ENUM fix applied: 'ready' and 'cancelled' status ensured.");
        }
        catch (enumError) {
            // Ignore if the type doesn't exist yet (first run) or value already exists
            console.log("ENUM fix note:", enumError?.message || "skipped");
        }
        await models_1.sequelize.sync({ alter: true });
        console.log("Database tables synchronized");
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            // Initialize automated tasks
            (0, scheduler_1.initScheduler)();
        });
    }
    catch (error) {
        console.error("Database connection failed:", error);
    }
};
startServer();
