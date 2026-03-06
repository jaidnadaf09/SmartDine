import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

import authRoutes from './routes/authRoutes';
import orderRoutes from './routes/orderRoutes';
import tableRoutes from './routes/tableRoutes';
import bookingRoutes from './routes/bookingRoutes';
import menuRoutes from './routes/menuRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import adminRoutes from './routes/adminRoutes';

import path from 'path';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from the React app
// When running from root with 'npm start', process.cwd() is the root
const frontendPath = path.join(process.cwd(), 'dist');
app.use(express.static(frontendPath));

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    // Check if the file exists in the frontend dist, otherwise serve index.html for SPA routing
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// app.get('/', (req, res) => {
//     res.send('SmartDine API is running');
// });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
