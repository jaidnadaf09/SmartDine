import dotenv from 'dotenv';
import { connectDB } from './config/db';
import User from './models/User';
import MenuItem from './models/MenuItem';
import Table from './models/Table';
import InventoryItem from './models/InventoryItem';

import bcrypt from 'bcrypt';

dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.destroy({ where: {} });
        await MenuItem.destroy({ where: {} });
        await Table.destroy({ where: {} });
        await InventoryItem.destroy({ where: {} });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 1. Create Staff Members (Admin, Chef, Waiter)
        await User.bulkCreate([
            { name: 'Admin User', email: 'admin@smartdine.com', password: hashedPassword, role: 'admin', status: 'active' },
            { name: 'John Chef', email: 'john@smartdine.com', password: hashedPassword, role: 'CHEF', shift: 'Morning', status: 'active' },
            { name: 'Sarah Waiter', email: 'sarah@smartdine.com', password: hashedPassword, role: 'WAITER', shift: 'Morning', status: 'active' },
            { name: 'Mike Chef', email: 'mike@smartdine.com', password: hashedPassword, role: 'CHEF', shift: 'Evening', status: 'active' }
        ]);
        console.log('Staff seeded successfully');

        // 2. Create Menu Items
        await MenuItem.bulkCreate([
            { name: 'Latte', category: 'Coffee', price: 4.5, status: 'available' },
            { name: 'Croissant', category: 'Pastries', price: 3.0, status: 'available' },
            { name: 'Avocado Toast', category: 'Sandwiches', price: 5.5, status: 'unavailable' },
            { name: 'Chocolate Cake', category: 'Desserts', price: 4.0, status: 'available' },
        ]);
        console.log('Menu seeded successfully');

        // 3. Create Tables
        await Table.bulkCreate([
            { tableNumber: 1, capacity: 4, status: 'occupied', orders: 0 },
            { tableNumber: 2, capacity: 2, status: 'available', orders: 0 },
            { tableNumber: 3, capacity: 6, status: 'reserved', orders: 0 },
            { tableNumber: 4, capacity: 4, status: 'available', orders: 0 },
        ]);
        console.log('Tables seeded successfully');

        // 4. Create Inventory Items
        await InventoryItem.bulkCreate([
            { name: 'Coffee Beans', quantity: 50, unit: 'kg', status: 'sufficient' },
            { name: 'Milk', quantity: 30, unit: 'L', status: 'sufficient' },
            { name: 'Sugar', quantity: 20, unit: 'kg', status: 'low' },
            { name: 'Cups', quantity: 500, unit: 'pcs', status: 'sufficient' },
            { name: 'Croissants', quantity: 15, unit: 'pcs', status: 'critical' },
        ]);
        console.log('Inventory seeded successfully');

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error with data import`, error);
        process.exit(1);
    }
};

seedDatabase();
