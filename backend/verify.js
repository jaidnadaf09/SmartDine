const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '2175',
        database: process.env.MYSQL_DB || 'smartdine'
    });

    const [rows] = await connection.execute('SELECT * FROM users');
    console.log("Users in DB:", rows.length);
    for (let user of rows) {
        console.log(`\nEmail: ${user.email}`);
        console.log(`Password Hash: ${user.password}`);
        if (user.password) {
            if (user.password.startsWith('$2b$')) {
                const isMatch = await bcrypt.compare('12345', user.password);
                console.log(`Password matches '12345'? ${isMatch}`);
                const isMatch2 = await bcrypt.compare('123456', user.password);
                console.log(`Password matches '123456'? ${isMatch2}`);
            } else {
                console.log("Password is NOT a bcrypt hash.");
            }
        } else {
            console.log("No password set.");
        }
    }
    await connection.end();
}
check().catch(console.error);
