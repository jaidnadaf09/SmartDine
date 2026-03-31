"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.getStaffMembers = exports.getPayments = exports.updateOrderStatus = exports.getOrdersHistory = exports.getOrders = exports.deleteTable = exports.updateTable = exports.addTable = exports.getAvailableTables = exports.getTables = exports.updateBookingTable = exports.completeBooking = exports.cancelBooking = exports.updateBookingStatus = exports.getBookingsHistory = exports.getBookings = exports.deleteUser = exports.updateUserRole = exports.getUsers = exports.getAllReviews = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const reviewController_1 = require("./reviewController");
Object.defineProperty(exports, "getAllReviews", { enumerable: true, get: function () { return reviewController_1.getAllReviews; } });
// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    console.log("Admin: Fetching all users across all roles");
    try {
        const users = await models_1.User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'createdAt']
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getUsers = getUsers;
// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await models_1.User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.role = role;
        await user.save();
        res.json({ message: 'User role updated successfully', user: { id: user.id, name: user.name, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateUserRole = updateUserRole;
// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await models_1.User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Prevent self-deletion
        if (req.user && req.user.id === user.id) {
            return res.status(400).json({ message: 'You cannot delete your own admin account' });
        }
        await user.destroy();
        res.json({ message: 'User removed' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteUser = deleteUser;
// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
    console.log("Admin: Fetching active bookings");
    try {
        const bookings = await models_1.Booking.findAll({
            where: {
                status: 'confirmed'
            },
            order: [['createdAt', 'DESC']]
        });
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getBookings = getBookings;
// @desc    Get booking history
// @route   GET /api/admin/bookings/history
// @access  Private/Admin
const getBookingsHistory = async (req, res) => {
    console.log("Admin: Fetching booking history");
    try {
        const bookings = await models_1.Booking.findAll({
            where: {
                status: { [sequelize_1.Op.in]: ['completed', 'cancelled'] }
            },
            order: [['createdAt', 'DESC']]
        });
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getBookingsHistory = getBookingsHistory;
// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await models_1.Booking.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        booking.status = status;
        await booking.save();
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateBookingStatus = updateBookingStatus;
// @desc    Cancel a booking with reason
// @route   PUT /api/admin/bookings/:id/cancel
// @access  Private/Admin
const cancelBooking = async (req, res) => {
    try {
        const { reason } = req.body;
        const booking = await models_1.Booking.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        // Release table if assigned
        if (booking.tableId) {
            const table = await models_1.Table.findByPk(booking.tableId);
            if (table) {
                table.status = "available";
                // table.customerId = null; // Assuming based on initial prompt logic
                await table.save();
            }
        }
        booking.status = "cancelled";
        booking.cancelReason = reason || "No reason provided";
        booking.tableId = null;
        booking.tableNumber = null;
        await booking.save();
        res.json({ message: "Booking cancelled successfully", booking });
    }
    catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.cancelBooking = cancelBooking;
// @desc    Complete a booking and release table
// @route   PATCH /api/admin/bookings/:id/complete
// @access  Private/Admin
const completeBooking = async (req, res) => {
    console.log(`Admin: Completing booking ${req.params.id}`);
    try {
        const booking = await models_1.Booking.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        // Release table if assigned
        if (booking.tableId) {
            const table = await models_1.Table.findByPk(booking.tableId);
            if (table) {
                table.status = "available";
                await table.save();
            }
        }
        booking.status = "completed";
        booking.tableId = null;
        booking.tableNumber = null;
        await booking.save();
        res.json({ message: "Booking completed and table released successfully", booking });
    }
    catch (error) {
        console.error("Error completing booking:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.completeBooking = completeBooking;
// @desc    Update table for booking (Assign, Change, Unassign)
// @route   PUT /api/admin/bookings/:id/table
// @access  Private/Admin
const updateBookingTable = async (req, res) => {
    try {
        const { tableId } = req.body;
        console.log("API /table: Booking ID:", req.params.id);
        console.log("API /table: Table ID:", tableId);
        const booking = await models_1.Booking.findByPk(req.params.id);
        if (!booking) {
            console.log("API /table ERROR: Booking not found");
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (tableId === null) {
            booking.tableId = null;
            booking.tableNumber = null;
        }
        else {
            const table = await models_1.Table.findByPk(tableId);
            if (!table) {
                return res.status(404).json({ message: 'Table not found' });
            }
            booking.tableId = table.id;
            booking.tableNumber = table.tableNumber;
        }
        await booking.save();
        res.json({ message: 'Table updated successfully', booking });
    }
    catch (error) {
        console.error('Error updating booking table:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateBookingTable = updateBookingTable;
// @desc    Get all tables
// @route   GET /api/admin/tables
// @access  Private/Admin
const getTables = async (req, res) => {
    console.log("Admin: Fetching all tables");
    try {
        const tables = await models_1.Table.findAll();
        const bookings = await models_1.Booking.findAll({
            where: { tableId: { [sequelize_1.Op.ne]: null } }
        });
        const assignedTableIds = bookings.map((b) => b.tableId);
        const updatedTables = tables.map(table => {
            const tableData = table.toJSON();
            const isReserved = assignedTableIds.includes(table.id);
            return {
                ...tableData,
                status: isReserved ? 'RESERVED' : 'AVAILABLE'
            };
        });
        res.json(updatedTables);
    }
    catch (error) {
        console.error("Error fetching tables:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getTables = getTables;
// @desc    Get available tables
// @route   GET /api/admin/tables/available
// @access  Private/Admin
const getAvailableTables = async (req, res) => {
    console.log("Admin: Fetching available tables");
    try {
        const bookings = await models_1.Booking.findAll({
            where: { tableId: { [sequelize_1.Op.ne]: null } }
        });
        const assignedTableIds = bookings.map(b => b.tableId);
        let whereClause = {};
        if (assignedTableIds.length > 0) {
            whereClause = { id: { [sequelize_1.Op.notIn]: assignedTableIds } };
        }
        const tables = await models_1.Table.findAll({ where: whereClause });
        res.json(tables);
    }
    catch (error) {
        console.error("Error fetching available tables:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getAvailableTables = getAvailableTables;
// @desc    Add new table
// @route   POST /api/admin/tables
// @access  Private/Admin
const addTable = async (req, res) => {
    try {
        const { tableNumber, capacity, status } = req.body;
        const table = await models_1.Table.create({ tableNumber, capacity, status, orders: 0 });
        res.status(201).json(table);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.addTable = addTable;
// @desc    Update table
// @route   PUT /api/admin/tables/:id
// @access  Private/Admin
const updateTable = async (req, res) => {
    try {
        const { tableNumber, capacity, status } = req.body;
        const table = await models_1.Table.findByPk(req.params.id);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }
        await table.update({ tableNumber, capacity, status });
        res.json(table);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateTable = updateTable;
// @desc    Delete table
// @route   DELETE /api/admin/tables/:id
// @access  Private/Admin
const deleteTable = async (req, res) => {
    try {
        const table = await models_1.Table.findByPk(req.params.id);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }
        await table.destroy();
        res.json({ message: 'Table removed' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteTable = deleteTable;
// @desc    Get all active orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    console.log("Admin: Fetching all active orders");
    try {
        const orders = await models_1.Order.findAll({
            where: {
                status: { [sequelize_1.Op.in]: ['pending', 'preparing', 'ready'] }
            },
            include: [{
                    model: models_1.User,
                    as: 'customer',
                    attributes: ['name', 'email']
                }],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getOrders = getOrders;
// @desc    Get order history (completed orders)
// @route   GET /api/admin/orders/history
// @access  Private/Admin
const getOrdersHistory = async (req, res) => {
    console.log("Admin: Fetching order history");
    try {
        const orders = await models_1.Order.findAll({
            where: {
                status: { [sequelize_1.Op.in]: ['completed', 'cancelled'] }
            },
            include: [{
                    model: models_1.User,
                    as: 'customer',
                    attributes: ['name', 'email']
                }],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getOrdersHistory = getOrdersHistory;
// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await models_1.Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.status = status;
        await order.save();
        // 1. Table Management: When order is completed, release table and booking
        if (status === 'completed') {
            console.log(`Admin/Chef: Order ${order.id} marked as COMPLETED. Releasing table...`);
            // Re-fetch order to ensure we have the latest bookingId and tableNumber
            const fullOrder = await models_1.Order.findByPk(req.params.id);
            if (fullOrder?.bookingId) {
                const booking = await models_1.Booking.findByPk(fullOrder.bookingId);
                if (booking) {
                    booking.status = 'completed';
                    booking.tableId = null;
                    booking.tableNumber = null;
                    await booking.save();
                }
            }
            if (fullOrder?.tableNumber) {
                // Release the table in the tables model
                const table = await models_1.Table.findOne({ where: { tableNumber: fullOrder.tableNumber } });
                if (table) {
                    table.status = 'available';
                    await table.save();
                }
                // Also find any other active bookings for this table number and complete them
                await models_1.Booking.update({ status: 'completed', tableId: null, tableNumber: null }, {
                    where: {
                        tableNumber: fullOrder.tableNumber,
                        status: { [sequelize_1.Op.in]: ['pending', 'confirmed'] }
                    }
                });
            }
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
// @desc    Get consolidated payment history (Bookings + Orders)
// @route   GET /api/admin/payments
// @access  Private/Admin
const getPayments = async (req, res) => {
    console.log("Admin: Consolidating history from Bookings and Orders");
    try {
        // 1. Fetch Booking payments
        const bookingPayments = await models_1.Booking.findAll({
            where: {
                paymentStatus: { [sequelize_1.Op.in]: ['paid', 'failed'] }
            },
            attributes: ['id', 'customerName', 'amount', 'paymentId', 'paymentStatus', 'updatedAt'],
        });
        // 2. Fetch Order payments
        const orderPayments = await models_1.Order.findAll({
            where: {
                paymentStatus: { [sequelize_1.Op.in]: ['paid', 'failed'] }
            },
            include: [{
                    model: models_1.User,
                    as: 'customer',
                    attributes: ['name']
                }],
            attributes: ['id', 'totalAmount', 'paymentId', 'paymentStatus', 'updatedAt'],
        });
        // 3. Normalize and Merge
        const consolidated = [
            ...bookingPayments.map(b => ({
                id: b.id,
                type: 'Booking',
                customerName: b.customerName,
                amount: b.amount,
                paymentId: b.paymentId,
                paymentStatus: b.paymentStatus,
                updatedAt: b.updatedAt,
                method: 'Razorpay / UPI'
            })),
            ...orderPayments.map(o => ({
                id: o.id,
                type: 'Order',
                customerName: o.customer?.name || 'Guest',
                amount: o.totalAmount,
                paymentId: o.paymentId,
                paymentStatus: o.paymentStatus,
                updatedAt: o.updatedAt,
                method: 'Razorpay / UPI'
            }))
        ];
        // 4. Sort by date
        consolidated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        res.json(consolidated);
    }
    catch (error) {
        console.error("Error consolidating payments:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
exports.getPayments = getPayments;
// @desc    Get all staff members
// @route   GET /api/admin/staff
// @access  Private/Admin
const getStaffMembers = async (req, res) => {
    try {
        const staff = await models_1.User.findAll({
            where: {
                role: {
                    [sequelize_1.Op.in]: ['CHEF', 'WAITER', 'admin']
                }
            },
            attributes: { exclude: ['password'] }
        });
        res.json(staff);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getStaffMembers = getStaffMembers;
// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    console.log("Admin: Calculating dashboard statistics");
    try {
        const totalOrders = await models_1.Order.count();
        const ordersList = await models_1.Order.findAll();
        const totalRevenue = ordersList.reduce((acc, order) => acc + Number(order.totalAmount || 0), 0);
        const totalUsers = await models_1.User.count();
        const totalBookings = await models_1.Booking.count();
        // Fetch Recent History
        const recentBookings = await models_1.Booking.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'customerName', 'date', 'time', 'status']
        });
        const recentOrders = await models_1.Order.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{
                    model: models_1.User,
                    as: 'customer',
                    attributes: ['name']
                }],
            attributes: ['id', 'totalAmount', 'status', 'createdAt']
        });
        const recentPayments = await models_1.Booking.findAll({
            where: {
                paymentStatus: { [sequelize_1.Op.in]: ['paid', 'failed'] }
            },
            limit: 5,
            order: [['updatedAt', 'DESC']],
            attributes: ['id', 'customerName', 'amount', 'paymentStatus', 'updatedAt']
        });
        res.json({
            totalUsers,
            totalBookings,
            totalOrders,
            totalRevenue,
            recentBookings,
            recentOrders,
            recentPayments
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getDashboardStats = getDashboardStats;
