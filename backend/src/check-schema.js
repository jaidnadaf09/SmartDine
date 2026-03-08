
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false
});

async function checkSchema() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders'");
        console.log('Orders table columns:');
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
