"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChefOrderHistory = exports.updateChefOrderStatus = exports.getKitchenOrders = exports.getChefDashboardStats = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
// @desc    Get chef dashboard stats
// @route   GET /api/chef/stats
// @access  Private/Chef
const getChefDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const pendingCount = await models_1.Order.count({ where: { status: 'pending' } });
        const preparingCount = await models_1.Order.count({ where: { status: 'preparing' } });
        const readyCount = await models_1.Order.count({ where: { status: 'ready' } });
        const completedTodayCount = await models_1.Order.count({
            where: {
                status: 'completed',
                updatedAt: { [sequelize_1.Op.gte]: today }
            }
        });
        res.json({
            pendingOrders: pendingCount,
            preparingOrders: preparingCount,
            readyOrders: readyCount,
            completedToday: completedTodayCount
        });
    }
    catch (error) {
        console.error("Error fetching chef stats:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getChefDashboardStats = getChefDashboardStats;
// @desc    Get active kitchen orders
// @route   GET /api/chef/orders
// @access  Private/Chef
const getKitchenOrders = async (req, res) => {
    try {
        const orders = await models_1.Order.findAll({
            where: {
                status: {
                    [sequelize_1.Op.in]: ['pending', 'preparing', 'ready']
                }
            },
            include: [{
                    model: models_1.User,
                    as: 'customer',
                    attributes: ['name']
                }],
            order: [['createdAt', 'ASC']]
        });
        res.json(orders);
    }
    catch (error) {
        console.error("Error fetching kitchen orders:", error);
        res.status(500).json({ message: 'Server Error', detail: error?.message });
    }
};
exports.getKitchenOrders = getKitchenOrders;
// @desc    Update order status in kitchen workflow
// @route   PUT /api/chef/orders/:id/status
// @access  Private/Chef
const updateChefOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await models_1.Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.status = status;
        await order.save();
        // Table Management Logic: When order is completed
        if (status === 'completed') {
            console.log(`Order ${order.id} completed. Releasing table and booking...`);
            // 1. Complete the associated booking and unassign table
            if (order.bookingId) {
                const booking = await models_1.Booking.findByPk(order.bookingId);
                if (booking) {
                    booking.status = 'completed';
                    booking.tableId = null;
                    booking.tableNumber = null;
                    await booking.save();
                    console.log(`Booking ${order.bookingId} marked as completed and unassigned from Table.`);
                }
            }
            // 2. Clear table and set as available
            if (order.tableNumber) {
                // Find and complete all active bookings for this table
                const activeBookings = await models_1.Booking.findAll({
                    where: {
                        tableNumber: order.tableNumber,
                        status: { [sequelize_1.Op.in]: ['pending', 'confirmed'] }
                    }
                });
                for (const booking of activeBookings) {
                    booking.status = 'completed';
                    booking.tableId = null;
                    await booking.save();
                }
                // Update Table status and clear customer
                const table = await models_1.Table.findOne({ where: { tableNumber: order.tableNumber } });
                if (table) {
                    table.status = 'available';
                    table.customerId = null; // As requested in Feature 7
                    await table.save();
                    console.log(`Table ${order.tableNumber} set to available and unassigned.`);
                }
            }
        }
        res.json(order);
    }
    catch (error) {
        console.error("Error updating chef order status:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateChefOrderStatus = updateChefOrderStatus;
// @desc    Get completed orders for today
// @route   GET /api/chef/order-history
// @access  Private/Chef
const getChefOrderHistory = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const orders = await models_1.Order.findAll({
            where: {
                status: 'completed',
                updatedAt: { [sequelize_1.Op.gte]: today }
            },
            include: [{
                    model: models_1.User,
                    as: 'customer',
                    attributes: ['name']
                }],
            order: [['updatedAt', 'DESC']]
        });
        res.json(orders);
    }
    catch (error) {
        console.error("Error fetching chef order history:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getChefOrderHistory = getChefOrderHistory;
