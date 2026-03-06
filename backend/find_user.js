const User = require('./src/models/User').default;
const bcrypt = require('bcrypt');
const { connectDB } = require('./src/config/db');

async function checkUser() {
    await connectDB();
    const email = 'test1772704958489@example.com';
    const password = 'password123';

    const user = await User.findOne({ where: { email } });
    if (!user) {
        console.log("User not found!");
        process.exit();
    }

    console.log("User record from model:", user.toJSON());
    const hash = user.password;
    console.log("Hash length:", hash.length);
    console.log("Hash:", hash);

    const isMatch = await bcrypt.compare(password, hash);
    console.log("bcrypt.compare match:", isMatch);
    process.exit();
}

checkUser();
