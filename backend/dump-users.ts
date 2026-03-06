import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
    process.env.MYSQL_DB as string,
    process.env.MYSQL_USER as string,
    process.env.MYSQL_PASSWORD as string,
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        logging: false,
    }
);

const checkUsers = async () => {
    try {
        await sequelize.authenticate();
        const [users] = await sequelize.query('SELECT id, name, email, password FROM users');
        console.log('Users in DB:', users);
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkUsers();
