import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Order, Table, Booking } from '../models';


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
            order: [['createdAt', 'ASC']] // Oldest first for priority
        });
        res.json(orders);
    } catch (error: any) {
        console.error("Error fetching kitchen orders:", error?.message || error);
        console.error("Full error:", JSON.stringify(error, null, 2));
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
                    booking.tableId = null; // Unassign table so getTables shows it as AVAILABLE
                    await booking.save();
                    console.log(`Booking ${booking.id} marked as completed and table unassigned.`);
                }
            }

            // 2. Also find any booking linked to this table number and complete it
            if (order.tableNumber) {
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
                    console.log(`Booking ${booking.id} (table ${order.tableNumber}) completed and unassigned.`);
                }

                // 3. Set the table's own status to 'available'
                const table = await Table.findOne({ where: { tableNumber: order.tableNumber } });
                if (table) {
                    table.status = 'available';
                    await table.save();
                    console.log(`Table ${order.tableNumber} set to available.`);
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
            order: [['updatedAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error("Error fetching chef order history:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

