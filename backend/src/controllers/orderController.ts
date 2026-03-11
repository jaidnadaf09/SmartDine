import { Request, Response } from 'express';
import { Order, User, Table, Booking } from '../models';
import { AuthRequest } from '../middleware/authMiddleware';
import { Op } from 'sequelize';

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Staff
export const getOrders = async (req: AuthRequest, res: Response) => {
    try {
        const orders = await Order.findAll({
            where: {
                status: {
                    [Op.ne]: 'completed'
                }
            },
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (from customer frontend) or Private
export const createOrder = async (req: Request, res: Response) => {
    try {
        const { items, totalAmount, userId, paymentId, paymentStatus } = req.body;

        if (!items || Object.keys(items).length === 0) {
            return res.status(400).json({ message: 'No order items provided' });
        }

        let assignedTableNumber = null;
        let activeBookingId = null;

        if (userId) {
            const activeBooking = await Booking.findOne({
                where: {
                    userId,
                    status: 'confirmed'
                },
                order: [['createdAt', 'DESC']]
            });

            if (activeBooking && activeBooking.tableNumber) {
                assignedTableNumber = activeBooking.tableNumber;
                activeBookingId = activeBooking.id;
            }
        }

        const orderType = assignedTableNumber ? 'DINE_IN' : 'TAKEAWAY';

        const newOrder = await Order.create({
            tableNumber: assignedTableNumber,
            userId: userId || null,
            bookingId: activeBookingId || null,
            items: items, // JSON array of items mapped directly
            totalAmount: totalAmount || 0,
            status: 'pending',
            paymentId: paymentId || null,
            paymentStatus: paymentStatus || 'pending',
            orderType: orderType
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(400).json({ message: 'Invalid order data' });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Staff
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        const updatedOrder = await order.save();

        // Table Management: When order is completed, release table and booking
        if (status === 'completed') {
            console.log(`Order ${order.id} marked as COMPLETED. Releasing table...`);
            // Complete the associated booking
            if (order.bookingId) {
                const booking = await Booking.findByPk(order.bookingId);
                if (booking) {
                    booking.status = 'completed';
                    booking.tableId = null;
                    await booking.save();
                    console.log(`Booking ${booking.id} completed and table unassigned.`);
                }
            }

            // Complete any active bookings for this table number
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
                    console.log(`Associated active booking ${booking.id} for table ${order.tableNumber} completed.`);
                }

                // Also update the table status directly to ensure it shows as AVAILABLE
                const table = await Table.findOne({ where: { tableNumber: order.tableNumber } });
                if (table) {
                    table.status = 'available';
                    await table.save();
                    console.log(`Table ${order.tableNumber} status set to AVAILABLE.`);
                }
            }
        }

        res.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user orders (by URL param - mostly for admin or internal use)
// @route   GET /api/orders/user/:userId
// @access  Public (for now)
export const getUserOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.params.userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get current user's orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.id) {
            console.warn("getMyOrders: No req.user or ID found in request");
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        console.log(`Fetching orders for user ID: ${req.user.id} (${typeof req.user.id})`);
        
        const userId = typeof req.user.id === 'string' ? parseInt(req.user.id) : req.user.id;
        
        const orders = await Order.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        
        console.log(`Found ${orders.length} orders for user ${req.user.id}`);
        res.json(orders);
    } catch (error: any) {
        console.error('Error fetching my orders:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
