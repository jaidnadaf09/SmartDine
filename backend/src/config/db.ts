import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error("DATABASE_URL is not defined in environment variables");
    process.exit(1);
}

const sequelize = new Sequelize(databaseUrl, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    dialectOptions: {
        ssl: process.env.NODE_ENV === "production"
            ? { require: true, rejectUnauthorized: false }
            : false,
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("PostgreSQL connected successfully");

        await sequelize.sync({ alter: true });
        console.log("Database synced");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
};

export default sequelize;