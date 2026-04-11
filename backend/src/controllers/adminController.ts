import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { User, Order, Table, Booking } from '../models';
import { getAllReviews } from './reviewController';

export { getAllReviews };

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response) => {
    console.log("Admin: Fetching all users across all roles");
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'createdAt']
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { role } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.role = role;
        await user.save();
        
        res.json({ message: 'User role updated successfully', user: { id: user.id, name: user.name, role: user.role } });
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

        // Prevent self-deletion
        if ((req as any).user && (req as any).user.id === user.id) {
            return res.status(400).json({ message: 'You cannot delete your own admin account' });
        }

        await user.destroy();
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all bookings (pending + confirmed), pending sorted newest first
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getBookings = async (req: Request, res: Response) => {
    console.log("Admin: Fetching active bookings (pending + confirmed)");
    try {
        const bookings = await Booking.findAll({
            where: {
                status: { [Op.in]: ['pending', 'confirmed', 'checked_in'] }
            },
            include: [
                {
                    model: Table,
                    as: 'table',
                    attributes: ['id', 'tableNumber', 'capacity']
                }
            ],
            order: [['createdAt', 'DESC']] // Improvement #1: newest first
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Assign a table to a booking with capacity validation
// @route   PATCH /api/admin/bookings/:id/assign-table
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

        // Capacity validation
        if (table.capacity < booking.guests) {
            return res.status(400).json({
                message: `Table ${table.tableNumber} only has ${table.capacity} seats, but booking requires ${booking.guests}.`
            });
        }

        // Prevent assigning already-reserved table (excluding current booking)
        const existingBooking = await Booking.findOne({
            where: {
                tableId,
                status: { [Op.in]: ['pending', 'confirmed'] },
                id: { [Op.ne]: booking.id }
            }
        });
        if (existingBooking) {
            return res.status(409).json({
                message: `Table ${table.tableNumber} is already assigned to another active booking.`
            });
        }

        booking.tableId = table.id;
        // IMPORTANT: Directly syncing tableNumber ensures frontend MyOrders displays it safely
        booking.tableNumber = table.tableNumber;
        booking.status = 'confirmed';
        await booking.save();

        res.json({ message: 'Table assigned successfully', booking });
    } catch (error) {
        console.error('Error assigning table:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Check-in a booking
// @route   PATCH /api/admin/bookings/:id/check-in
// @access  Private/Admin
export const checkInBooking = async (req: Request, res: Response) => {
    try {
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (!booking.tableId) {
            return res.status(400).json({ message: 'Assign table before check-in' });
        }

        booking.status = 'checked_in';
        await booking.save();

        res.json({ message: 'Customer checked in successfully', booking });
    } catch (error) {
        console.error('Error checking in booking:', error);
        res.status(500).json({ message: 'Check-in failed' });
    }
};

// @desc    Get booking history
// @route   GET /api/admin/bookings/history
// @access  Private/Admin
export const getBookingsHistory = async (req: Request, res: Response) => {
    console.log("Admin: Fetching booking history");
    try {
        const { search, status, payment, dateRange } = req.query;

        const whereClause: any = {};

        if (status) {
            whereClause.status = status;
        } else {
            whereClause.status = { [Op.in]: ['completed', 'cancelled'] };
        }

        if (search && typeof search === 'string') {
            whereClause.customerName = {
                [Op.iLike]: `%${search}%`
            };
        }

        if (payment) {
            whereClause.paymentStatus = payment;
        }

        if (dateRange) {
            const now = new Date();
            let calculatedDate = new Date();

            if (dateRange === '1d') {
                calculatedDate.setHours(0, 0, 0, 0);
                whereClause.createdAt = { [Op.gte]: calculatedDate };
            } else if (dateRange === '7d') {
                calculatedDate.setDate(now.getDate() - 7);
                whereClause.createdAt = { [Op.gte]: calculatedDate };
            } else if (dateRange === '30d') {
                calculatedDate.setDate(now.getDate() - 30);
                whereClause.createdAt = { [Op.gte]: calculatedDate };
            }
        }

        const bookings = await Booking.findAll({
            where: whereClause,
            include: [
                {
                    model: Table,
                    as: 'table',
                    attributes: ['id', 'tableNumber', 'capacity']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        console.error("Error fetching booking history:", error);
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

// @desc    Cancel a booking with reason
// @route   PUT /api/admin/bookings/:id/cancel
// @access  Private/Admin
export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const { reason } = req.body;
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Release table if assigned
        if (booking.tableId) {
            const table = await Table.findByPk(booking.tableId);
            if (table) {
                table.status = "available";
                // table.customerId = null; // Assuming based on initial prompt logic
                await table.save();
            }
        }

        booking.status = "cancelled";
        booking.cancelReason = reason || "No reason provided";
        booking.tableId = null;
        booking.tableNumber = null as any;

        await booking.save();

        res.json({ message: "Booking cancelled successfully", booking });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Complete a booking and release table
// @route   PATCH /api/admin/bookings/:id/complete
// @access  Private/Admin
export const completeBooking = async (req: Request, res: Response) => {
    console.log(`Admin: Completing booking ${req.params.id}`);
    try {
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Release table if assigned
        if (booking.tableId) {
            const table = await Table.findByPk(booking.tableId);
            if (table) {
                table.status = "available";
                await table.save();
            }
        }

        booking.status = "completed";
        booking.tableId = null;
        // NOTE: tableNumber is intentionally preserved for customer display history

        await booking.save();

        res.json({ message: "Booking completed and table released successfully", booking });
    } catch (error) {
        console.error("Error completing booking:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Unassign table from a booking
// @route   PATCH /api/admin/bookings/:id/unassign-table
// @access  Private/Admin
export const unassignTable = async (req: Request, res: Response) => {
    console.log(`Admin: Unassigning table from booking ${req.params.id}`);
    try {
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        booking.tableId = null;
        booking.tableNumber = null as any;

        await booking.save();

        res.json({ message: "Table unassigned successfully", booking });
    } catch (error) {
        console.error("Error unassigning table:", error);
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
        // Only exclude tables that have an ACTIVE booking (pending/confirmed/checked_in)
        const activeBookings = await Booking.findAll({
            where: {
                tableId: { [Op.ne]: null },
                status: { [Op.in]: ['pending', 'confirmed', 'checked_in'] }
            }
        });

        const assignedTableIds = activeBookings
            .map(b => b.tableId)
            .filter((id): id is number => id !== null);

        let whereClause: any = {};
        if (assignedTableIds.length > 0) {
            whereClause = { id: { [Op.notIn]: assignedTableIds } };
        }

        const tables = await Table.findAll({
            where: whereClause,
            order: [['tableNumber', 'ASC']]
        });
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
                status: { [Op.in]: ['pending', 'preparing', 'ready'] }
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
                status: { [Op.in]: ['completed', 'cancelled'] }
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
                    // NOTE: tableNumber preserved for customer display history
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

// @desc    Get consolidated payment history (Bookings + Orders)
// @route   GET /api/admin/payments
// @access  Private/Admin
export const getPayments = async (req: Request, res: Response) => {
    console.log("Admin: Consolidating history from Bookings and Orders");
    try {
        // 1. Fetch Booking payments
        const bookingPayments = await Booking.findAll({
            where: {
                paymentStatus: { [Op.in]: ['paid', 'failed'] }
            },
            attributes: ['id', 'customerName', 'amount', 'paymentId', 'paymentStatus', 'updatedAt'],
        });

        // 2. Fetch Order payments
        const orderPayments = await Order.findAll({
            where: {
                paymentStatus: { [Op.in]: ['paid', 'failed'] }
            },
            include: [{
                model: User,
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
                customerName: (o as any).customer?.name || 'Guest',
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
    } catch (error: any) {
        console.error("Error consolidating payments:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
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

        const totalUsers = await User.count();
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
