import { Request, Response } from 'express';
import { Op } from 'sequelize';
import User from '../models/User';
import Order from '../models/Order';
import Table from '../models/Table';
import Booking from '../models/Booking';

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll({
            where: { role: 'customer' },
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.destroy();
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await Booking.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        booking.status = status;
        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Assign table to booking
// @route   PUT /api/admin/bookings/:id/assign-table
// @access  Private/Admin
export const assignTable = async (req: Request, res: Response) => {
    try {
        const { tableId } = req.body;
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const table = await Table.findByPk(tableId);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        // Additional logic could be added here to mark table as occupied
        await table.update({ status: 'occupied' });

        booking.status = 'confirmed';
        await booking.save();

        res.json({ message: 'Table assigned and booking confirmed', booking, table });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all tables
// @route   GET /api/admin/tables
// @access  Private/Admin
export const getTables = async (req: Request, res: Response) => {
    try {
        const tables = await Table.findAll();
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add new table
// @route   POST /api/admin/tables
// @access  Private/Admin
export const addTable = async (req: Request, res: Response) => {
    try {
        const { tableNumber, capacity, status } = req.body;
        const table = await Table.create({ tableNumber, capacity, status, orders: 0 });
        res.status(201).json(table);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update table
// @route   PUT /api/admin/tables/:id
// @access  Private/Admin
export const updateTable = async (req: Request, res: Response) => {
    try {
        const { tableNumber, capacity, status } = req.body;
        const table = await Table.findByPk(req.params.id);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }
        await table.update({ tableNumber, capacity, status });
        res.json(table);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete table
// @route   DELETE /api/admin/tables/:id
// @access  Private/Admin
export const deleteTable = async (req: Request, res: Response) => {
    try {
        const table = await Table.findByPk(req.params.id);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }
        await table.destroy();
        res.json({ message: 'Table removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.status = status;
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get payment history
// @route   GET /api/admin/payments
// @access  Private/Admin
export const getPayments = async (req: Request, res: Response) => {
    try {
        // Since we store payments in Bookings for now (Razorpay integration)
        const payments = await Booking.findAll({
            where: {
                paymentStatus: {
                    [Op.in]: ['paid', 'failed']
                }
            },
            attributes: ['id', 'customerName', 'amount', 'paymentId', 'paymentStatus', 'updatedAt'],
            order: [['updatedAt', 'DESC']]
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all staff members
// @route   GET /api/admin/staff
// @access  Private/Admin
export const getStaffMembers = async (req: Request, res: Response) => {
    try {
        const staff = await User.findAll({
            where: {
                role: {
                    [Op.in]: ['CHEF', 'WAITER', 'admin']
                }
            },
            attributes: { exclude: ['password'] }
        });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalOrders = await Order.count();
        const ordersList = await Order.findAll();
        const totalRevenue = ordersList.reduce((acc, order) => acc + Number(order.totalAmount), 0);

        const activeUsers = await User.count({ where: { status: 'active' } });
        const tablesList = await Table.findAll();
        const tableCapacity = tablesList.reduce((acc, table) => acc + table.capacity, 0);
        const staffMembers = await User.count({
            where: {
                role: {
                    [Op.in]: ['CHEF', 'WAITER', 'admin']
                }
            }
        });

        res.json({
            totalOrders,
            totalRevenue,
            activeUsers,
            tableCapacity,
            staffMembers,
            averageRating: 4.8 // Mock average rating
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
