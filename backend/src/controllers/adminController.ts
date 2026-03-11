import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { User, Order, Table, Booking } from '../models';

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response) => {
    console.log("Admin: Fetching all users");
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
    console.log("Admin: Fetching all bookings");
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

// @desc    Update table for booking (Assign, Change, Unassign)
// @route   PUT /api/admin/bookings/:id/table
// @access  Private/Admin
export const updateBookingTable = async (req: Request, res: Response) => {
    try {
        const { tableId } = req.body;
        console.log("API /table: Booking ID:", req.params.id);
        console.log("API /table: Table ID:", tableId);

        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            console.log("API /table ERROR: Booking not found");
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (tableId === null) {
            booking.tableId = null;
            booking.tableNumber = null as any;
        } else {
            const table = await Table.findByPk(tableId);
            if (!table) {
                return res.status(404).json({ message: 'Table not found' });
            }
            booking.tableId = table.id;
            booking.tableNumber = table.tableNumber;
        }

        await booking.save();

        res.json({ message: 'Table updated successfully', booking });
    } catch (error) {
        console.error('Error updating booking table:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all tables
// @route   GET /api/admin/tables
// @access  Private/Admin
export const getTables = async (req: Request, res: Response) => {
    console.log("Admin: Fetching all tables");
    try {
        const tables = await Table.findAll();
        const bookings = await Booking.findAll({
            where: { tableId: { [Op.ne]: null } }
        });

        const assignedTableIds = bookings.map((b: any) => b.tableId);

        const updatedTables = tables.map(table => {
            const tableData = table.toJSON();
            const isReserved = assignedTableIds.includes(table.id);
            return {
                ...tableData,
                status: isReserved ? 'RESERVED' : 'AVAILABLE'
            };
        });

        res.json(updatedTables);
    } catch (error) {
        console.error("Error fetching tables:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get available tables
// @route   GET /api/admin/tables/available
// @access  Private/Admin
export const getAvailableTables = async (req: Request, res: Response) => {
    console.log("Admin: Fetching available tables");
    try {
        const bookings = await Booking.findAll({
            where: { tableId: { [Op.ne]: null } }
        });

        const assignedTableIds = bookings.map(b => b.tableId);

        let whereClause = {};
        if (assignedTableIds.length > 0) {
            whereClause = { id: { [Op.notIn]: assignedTableIds } };
        }

        const tables = await Table.findAll({ where: whereClause });
        res.json(tables);
    } catch (error) {
        console.error("Error fetching available tables:", error);
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

// @desc    Get all active orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getOrders = async (req: Request, res: Response) => {
    console.log("Admin: Fetching all active orders");
    try {
        const orders = await Order.findAll({
            where: {
                status: { [Op.ne]: 'completed' }
            },
            include: [{
                model: User,
                as: 'customer',
                attributes: ['name', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get order history (completed orders)
// @route   GET /api/admin/orders/history
// @access  Private/Admin
export const getOrdersHistory = async (req: Request, res: Response) => {
    console.log("Admin: Fetching order history");
    try {
        const orders = await Order.findAll({
            where: {
                status: 'completed'
            },
            include: [{
                model: User,
                as: 'customer',
                attributes: ['name', 'email']
            }],
            order: [['updatedAt', 'DESC']]
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

        // 1. Table Management: When order is completed, release table and booking
        if (status === 'completed') {
            console.log(`Admin/Chef: Order ${order.id} marked as COMPLETED. Releasing table...`);
            
            // Re-fetch order to ensure we have the latest bookingId and tableNumber
            const fullOrder = await Order.findByPk(req.params.id);
            
            if (fullOrder?.bookingId) {
                const booking = await Booking.findByPk(fullOrder.bookingId);
                if (booking) {
                    booking.status = 'completed';
                    booking.tableId = null;
                    await booking.save();
                }
            }

            if (fullOrder?.tableNumber) {
                // Release the table in the tables model
                const table = await Table.findOne({ where: { tableNumber: fullOrder.tableNumber } });
                if (table) {
                    table.status = 'available';
                    await table.save();
                }

                // Also find any other active bookings for this table number and complete them
                await Booking.update(
                    { status: 'completed', tableId: null },
                    { 
                        where: { 
                            tableNumber: fullOrder.tableNumber,
                            status: { [Op.in]: ['pending', 'confirmed'] }
                        } 
                    }
                );
            }
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get payment history
// @route   GET /api/admin/payments
// @access  Private/Admin
export const getPayments = async (req: Request, res: Response) => {
    console.log("Admin: Fetching all payments/successful bookings");
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
    console.log("Admin: Calculating dashboard statistics");
    try {
        const totalOrders = await Order.count();
        const ordersList = await Order.findAll();
        const totalRevenue = ordersList.reduce((acc, order) => acc + Number(order.totalAmount || 0), 0);

        const totalUsers = await User.count({ where: { role: 'customer' } });
        const totalBookings = await Booking.count();

        // Fetch Recent History
        const recentBookings = await Booking.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'customerName', 'date', 'time', 'status']
        });

        const recentOrders = await Order.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                as: 'customer',
                attributes: ['name']
            }],
            attributes: ['id', 'totalAmount', 'status', 'createdAt']
        });

        const recentPayments = await Booking.findAll({
            where: {
                paymentStatus: { [Op.in]: ['paid', 'failed'] }
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
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
