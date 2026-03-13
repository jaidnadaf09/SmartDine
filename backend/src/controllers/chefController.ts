import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Order, Table, Booking, User } from '../models';


// @desc    Get chef dashboard stats
// @route   GET /api/chef/stats
// @access  Private/Chef
export const getChefDashboardStats = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pendingCount = await Order.count({ where: { status: 'pending' } });
        const preparingCount = await Order.count({ where: { status: 'preparing' } });
        const readyCount = await Order.count({ where: { status: 'ready' } });
        const completedTodayCount = await Order.count({
            where: {
                status: 'completed',
                updatedAt: { [Op.gte]: today }
            }
        });

        res.json({
            pendingOrders: pendingCount,
            preparingOrders: preparingCount,
            readyOrders: readyCount,
            completedToday: completedTodayCount
        });
    } catch (error) {
        console.error("Error fetching chef stats:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get active kitchen orders
// @route   GET /api/chef/orders
// @access  Private/Chef
export const getKitchenOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.findAll({
            where: {
                status: {
                    [Op.in]: ['pending', 'preparing', 'ready']
                }
            },
            include: [{
                model: User,
                as: 'customer',
                attributes: ['name']
            }],
            order: [['createdAt', 'ASC']]
        });
        res.json(orders);
    } catch (error: any) {
        console.error("Error fetching kitchen orders:", error);
        res.status(500).json({ message: 'Server Error', detail: error?.message });
    }
};



// @desc    Update order status in kitchen workflow
// @route   PUT /api/chef/orders/:id/status
// @access  Private/Chef
export const updateChefOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const order = await Order.findByPk(req.params.id);

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
                const booking = await Booking.findByPk(order.bookingId);
                if (booking) {
                    booking.status = 'completed';
                    booking.tableId = null; 
                    booking.tableNumber = null as any; 
                    await booking.save();
                    console.log(`Booking ${order.bookingId} marked as completed and unassigned from Table.`);
                }
            }

            // 2. Clear table and set as available
            if (order.tableNumber) {
                // Find and complete all active bookings for this table
                const activeBookings = await Booking.findAll({
                    where: {
                        tableNumber: order.tableNumber,
                        status: { [Op.in]: ['pending', 'confirmed'] }
                    }
                });
                for (const booking of activeBookings) {
                    booking.status = 'completed';
                    booking.tableId = null;
                    await booking.save();
                }

                // Update Table status and clear customer
                const table = await Table.findOne({ where: { tableNumber: order.tableNumber } });
                if (table) {
                    table.status = 'available';
                    table.customerId = null; // As requested in Feature 7
                    await table.save();
                    console.log(`Table ${order.tableNumber} set to available and unassigned.`);
                }
            }
        }


        res.json(order);
    } catch (error) {
        console.error("Error updating chef order status:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get completed orders for today
// @route   GET /api/chef/order-history
// @access  Private/Chef
export const getChefOrderHistory = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const orders = await Order.findAll({
            where: {
                status: 'completed',
                updatedAt: { [Op.gte]: today }
            },
            include: [{
                model: User,
                as: 'customer',
                attributes: ['name']
            }],
            order: [['updatedAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error("Error fetching chef order history:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

