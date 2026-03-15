"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const User_1 = __importDefault(require("./models/User"));
const MenuItem_1 = __importDefault(require("./models/MenuItem"));
const Table_1 = __importDefault(require("./models/Table"));
const InventoryItem_1 = __importDefault(require("./models/InventoryItem"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
const seedDatabase = async () => {
    try {
        await (0, db_1.connectDB)();
        // Clear existing data
        await User_1.default.destroy({ where: {} });
        await MenuItem_1.default.destroy({ where: {} });
        await Table_1.default.destroy({ where: {} });
        await InventoryItem_1.default.destroy({ where: {} });
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash('password123', salt);
        // 1. Create Staff Members (Admin, Chef, Waiter)
        await User_1.default.bulkCreate([
            { name: 'Admin User', email: 'admin@smartdine.com', password: hashedPassword, role: 'admin', status: 'active' },
            { name: 'John Chef', email: 'john@smartdine.com', password: hashedPassword, role: 'CHEF', shift: 'Morning', status: 'active' },
            { name: 'Sarah Waiter', email: 'sarah@smartdine.com', password: hashedPassword, role: 'WAITER', shift: 'Morning', status: 'active' },
            { name: 'Mike Chef', email: 'mike@smartdine.com', password: hashedPassword, role: 'CHEF', shift: 'Evening', status: 'active' }
        ]);
        console.log('Staff seeded successfully');
        // 2. Create Menu Items
        await MenuItem_1.default.bulkCreate([
            // Chicken Starters
            { name: 'Chicken Tandoori', category: 'Chicken Starters', price: 120, status: 'available' },
            { name: 'Afghani Chicken', category: 'Chicken Starters', price: 130, status: 'available' },
            { name: 'Malai Kabab', category: 'Chicken Starters', price: 160, status: 'available' },
            { name: 'Pahadi Kabab', category: 'Chicken Starters', price: 160, status: 'available' },
            { name: 'Banjara Kabab', category: 'Chicken Starters', price: 160, status: 'available' },
            { name: 'Tikka Kabab', category: 'Chicken Starters', price: 160, status: 'available' },
            { name: 'Reshmi Kabab', category: 'Chicken Starters', price: 160, status: 'available' },
            { name: 'Chicken 65 Boneless Full', category: 'Chicken Starters', price: 700, status: 'available' },
            { name: 'Chicken 65 Boneless Half', category: 'Chicken Starters', price: 350, status: 'available' },
            { name: 'Chicken Crispy Pakoda Full', category: 'Chicken Starters', price: 700, status: 'available' },
            { name: 'Chicken Crispy Pakoda Half', category: 'Chicken Starters', price: 350, status: 'available' },
            { name: 'Chicken Seekh', category: 'Chicken Starters', price: 120, status: 'available' },
            // Veg Main Course
            { name: 'Kaju Curry', category: 'Veg Main Course', price: 190, status: 'available' },
            { name: 'Kaju Masala', category: 'Veg Main Course', price: 200, status: 'available' },
            { name: 'Paneer Masala', category: 'Veg Main Course', price: 190, status: 'available' },
            { name: 'Paneer Tikka Masala', category: 'Veg Main Course', price: 200, status: 'available' },
            { name: 'Dal Fry', category: 'Veg Main Course', price: 110, status: 'available' },
            { name: 'Dal Tadka', category: 'Veg Main Course', price: 120, status: 'available' },
            { name: 'Tomato Bhaji', category: 'Veg Main Course', price: 110, status: 'available' },
            { name: 'Shenga Bhaji', category: 'Veg Main Course', price: 110, status: 'available' },
            { name: 'Mix Veg', category: 'Veg Main Course', price: 150, status: 'available' },
            { name: 'Dahi Chutney', category: 'Veg Main Course', price: 80, status: 'available' },
            // Indian Breads
            { name: 'Roti', category: 'Indian Breads', price: 20, status: 'available' },
            { name: 'Butter Roti', category: 'Indian Breads', price: 30, status: 'available' },
            { name: 'Naan', category: 'Indian Breads', price: 35, status: 'available' },
            { name: 'Butter Naan', category: 'Indian Breads', price: 45, status: 'available' },
            { name: 'Garlic Naan', category: 'Indian Breads', price: 45, status: 'available' },
            { name: 'Plain Kulcha', category: 'Indian Breads', price: 35, status: 'available' },
            { name: 'Butter Kulcha', category: 'Indian Breads', price: 45, status: 'available' },
            { name: 'Masala Kulcha', category: 'Indian Breads', price: 45, status: 'available' },
            { name: 'Chapati', category: 'Indian Breads', price: 15, status: 'available' },
            { name: 'Biscuit Roti', category: 'Indian Breads', price: 15, status: 'available' },
            // Chicken Main Course
            { name: 'Chicken Handi Full', category: 'Chicken Main Course', price: 700, status: 'available' },
            { name: 'Chicken Handi Half', category: 'Chicken Main Course', price: 350, status: 'available' },
            { name: 'Chicken Dum Murga Khima', category: 'Chicken Main Course', price: 1050, status: 'available' },
            { name: 'Chicken Dum Murga', category: 'Chicken Main Course', price: 900, status: 'available' },
            { name: 'Chicken Masala', category: 'Chicken Main Course', price: 160, status: 'available' },
            { name: 'Chicken Dry', category: 'Chicken Main Course', price: 180, status: 'available' },
            { name: 'Chicken Kadhai', category: 'Chicken Main Course', price: 200, status: 'available' },
            { name: 'Chicken Ajmeri', category: 'Chicken Main Course', price: 210, status: 'available' },
            { name: 'Chicken Kashmiri', category: 'Chicken Main Course', price: 210, status: 'available' },
            { name: 'Chicken Hyderabadi', category: 'Chicken Main Course', price: 210, status: 'available' },
            { name: 'Chicken Kolhapuri', category: 'Chicken Main Course', price: 200, status: 'available' },
            { name: 'Chicken Jaipuri', category: 'Chicken Main Course', price: 210, status: 'available' },
            { name: 'Chicken Multan', category: 'Chicken Main Course', price: 240, status: 'available' },
            { name: 'Chicken Green', category: 'Chicken Main Course', price: 210, status: 'available' },
            { name: 'Chicken Malvani', category: 'Chicken Main Course', price: 220, status: 'available' },
            { name: 'Chicken Angara', category: 'Chicken Main Course', price: 210, status: 'available' },
            { name: 'Chicken Shahi', category: 'Chicken Main Course', price: 210, status: 'available' },
            { name: 'Butter Chicken', category: 'Chicken Main Course', price: 210, status: 'available' },
            { name: 'Chicken Adraki', category: 'Chicken Main Course', price: 210, status: 'available' },
            // Mandi Special
            { name: 'Mutton Mandi Raan', category: 'Mandi Special', price: 1650, status: 'available' },
            { name: 'Mutton Mandi', category: 'Mandi Special', price: 1400, status: 'available' },
            { name: 'Chicken Alfaham Mandi', category: 'Mandi Special', price: 1100, status: 'available' },
            { name: 'Chicken Mandi Full (4 Person)', category: 'Mandi Special', price: 1050, status: 'available' },
            { name: 'Chicken Mandi Half (2 Person)', category: 'Mandi Special', price: 550, status: 'available' },
            { name: 'Chicken Mandi (1 Person)', category: 'Mandi Special', price: 270, status: 'available' },
            // Biryani Course
            { name: 'Mutton Dum Biryani', category: 'Biryani Course', price: 220, status: 'available' },
            { name: 'Chicken Dum Biryani', category: 'Biryani Course', price: 150, status: 'available' },
            { name: 'Anda Biryani', category: 'Biryani Course', price: 120, status: 'available' },
            { name: 'Veg Biryani', category: 'Biryani Course', price: 110, status: 'available' },
            // Rice
            { name: 'Jeera Rice', category: 'Rice', price: 120, status: 'available' },
            { name: 'Plain Rice', category: 'Rice', price: 100, status: 'available' },
            { name: 'Ghee Rice', category: 'Rice', price: 130, status: 'available' },
            { name: 'Kaju Rice', category: 'Rice', price: 130, status: 'available' },
            { name: 'China Rice', category: 'Rice', price: 150, status: 'available' },
            // Orders Per KG
            { name: 'Mutton Dum Biryani (1 KG)', category: 'Orders Per KG', price: 1400, status: 'available' },
            { name: 'Chicken Dum Biryani (1 KG)', category: 'Orders Per KG', price: 900, status: 'available' },
            { name: 'Dalcha Khana (1 KG)', category: 'Orders Per KG', price: 1200, status: 'available' },
            { name: 'Mutton Aachaar (1 KG)', category: 'Orders Per KG', price: 1300, status: 'available' },
            { name: 'Mutton Masala (1 KG)', category: 'Orders Per KG', price: 1100, status: 'available' },
        ]);
        console.log('Menu seeded successfully');
        // 3. Create Tables
        await Table_1.default.bulkCreate([
            { tableNumber: 1, capacity: 4, status: 'occupied', orders: 0 },
            { tableNumber: 2, capacity: 2, status: 'available', orders: 0 },
            { tableNumber: 3, capacity: 6, status: 'reserved', orders: 0 },
            { tableNumber: 4, capacity: 4, status: 'available', orders: 0 },
        ]);
        console.log('Tables seeded successfully');
        // 4. Create Inventory Items
        await InventoryItem_1.default.bulkCreate([
            { name: 'Paneer', quantity: 20, unit: 'kg', status: 'sufficient' },
            { name: 'Basmati Rice', quantity: 50, unit: 'kg', status: 'sufficient' },
            { name: 'Chicken', quantity: 15, unit: 'kg', status: 'low' },
            { name: 'Cooking Oil', quantity: 40, unit: 'L', status: 'sufficient' },
            { name: 'Vegetables', quantity: 10, unit: 'kg', status: 'critical' },
        ]);
        console.log('Inventory seeded successfully');
        console.log('Data Imported!');
        process.exit();
    }
    catch (error) {
        console.error(`Error with data import`, error);
        process.exit(1);
    }
};
seedDatabase();
