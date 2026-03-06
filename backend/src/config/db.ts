import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
    process.env.MYSQL_DB || 'smartdine',
    process.env.MYSQL_USER || 'root',
    process.env.MYSQL_PASSWORD || '',
    {
        host: process.env.MYSQL_HOST || 'localhost',
        dialect: 'mysql',
        logging: false, // Set to console.log to see SQL queries
    }
);

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Connected successfully.');
        // Sync models
        await sequelize.sync({ alter: true }); // alter: true will update schema without dropping
        console.log('Database synced.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

export default sequelize;
