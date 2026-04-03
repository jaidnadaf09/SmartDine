/**
 * One-time DB repair: reset any 'confirmed' bookings that have no table assigned
 * back to 'pending' so they appear correctly in the Admin Live Bookings view.
 *
 * Run: node scripts/fixPendingBookings.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Sequelize } = require('sequelize');

const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;

if (!dbUrl) {
    console.error('❌ No DATABASE_URL or DB_URL found in environment.');
    process.exit(1);
}

const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: dbUrl.includes('sslmode') || dbUrl.includes('ssl=true')
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {}
});

async function run() {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    const [results] = await sequelize.query(
        `UPDATE bookings SET status = 'pending' WHERE "tableId" IS NULL AND status = 'confirmed' RETURNING id, "customerName"`
    );

    if (results.length === 0) {
        console.log('✅ No stale records found — all bookings are consistent.');
    } else {
        console.log(`✅ Fixed ${results.length} booking(s):`);
        results.forEach(r => console.log(`   - Booking #${r.id} (${r.customerName}) → pending`));
    }

    await sequelize.close();
}

run().catch(err => {
    console.error('❌ Repair failed:', err.message);
    process.exit(1);
});
