"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error("DATABASE_URL is not defined in environment variables");
    process.exit(1);
}
const sequelize = new sequelize_1.Sequelize(databaseUrl, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    dialectOptions: {
        ssl: process.env.NODE_ENV === "production"
            ? { require: true, rejectUnauthorized: false }
            : false,
    },
});
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("PostgreSQL connected successfully");
        await sequelize.sync({ alter: true });
        console.log("Database synced");
    }
    catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
exports.default = sequelize;
