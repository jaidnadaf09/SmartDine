import { Request, Response } from 'express';
import { Op } from 'sequelize';
import User from '../models/User';
import Order from '../models/Order';
import Table from '../models/Table';

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
        const orders = await Order.findAll();
        const totalRevenue = orders.reduce((acc, order) => acc + Number(order.totalAmount), 0);

        const activeUsers = await User.count({ where: { status: 'active' } });
        const tables = await Table.findAll();
        const tableCapacity = tables.reduce((acc, table) => acc + table.capacity, 0);
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
