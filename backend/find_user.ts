import { connectDB } from './src/config/db';
import User from './src/models/User';
import bcrypt from 'bcrypt';
import fs from 'fs';

async function checkUser() {
    let output = "";
    try {
        await connectDB();
        const email = 'test1772704958489@example.com';
        const password = 'password123';

        const user = await User.findOne({ where: { email } });
        if (!user) {
            output += "User not found!\n";
            fs.writeFileSync('error.log', output, 'utf8');
            process.exit(1);
        }

        output += `User record from model: ${JSON.stringify(user.toJSON())}\n`;
        const hash = user.password;
        output += `Hash length: ${hash.length}\n`;
        output += `Hash: ${hash}\n`;

        const isMatch = await bcrypt.compare(password, hash);
        output += `bcrypt.compare match: ${isMatch}\n`;
    } catch (err: any) {
        output += `Error: ${err.message}\n${err.stack}\n`;
    }
    fs.writeFileSync('error.log', output, 'utf8');
    process.exit(0);
}

checkUser();
