import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME || "postgres",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "",
    {
        host: process.env.DB_HOST,
        port: 5432,
        dialect: "postgres",
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
);

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("PostgreSQL Connected successfully.");

        // Sync models
        await sequelize.sync({ alter: true });

        console.log("Database synced.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        process.exit(1);
    }
};

export default sequelize;