import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db";

// Import all models to ensure they are registered with Sequelize before sync
import "./models/User";
import "./models/Booking";
import "./models/Table";
import "./models/Order";
import "./models/MenuItem";
import "./models/InventoryItem";

import authRoutes from "./routes/authRoutes";
import orderRoutes from "./routes/orderRoutes";
import tableRoutes from "./routes/tableRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import menuRoutes from "./routes/menuRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import adminRoutes from "./routes/adminRoutes";
import paymentRoutes from "./routes/paymentRoutes";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://smartdine-l22i.onrender.com",
            process.env.FRONTEND_URL || ""
        ].filter(Boolean),
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    })
);

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);

// Test route
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

        await sequelize.sync({ alter: true });
        console.log("Database tables synchronized");

        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });

    } catch (error) {
        console.error("Database connection failed:", error);
    }
};

startServer();
