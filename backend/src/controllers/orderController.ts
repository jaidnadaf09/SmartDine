import { Request, Response } from 'express';
import { Order, User, Table, Booking, WalletTransaction, sequelize, Notification, RestaurantSetting } from '../models';
import { AuthRequest } from '../middleware/authMiddleware';
import { Op } from 'sequelize';
import { isRestaurantOpen } from '../utils/workingHours';
import { emitNotification, emitOrderStatusUpdate, emitNewOrder, getIO } from '../socket/socketServer';

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Staff
export const getOrders = async (req: AuthRequest, res: Response) => {
    try {
        const includeAll = req.query.includeAll === 'true';
        const includeHistory = req.query.includeHistory === 'true';
        let whereClause = {};

        if (includeAll) {
            // Return all orders (no filter)
            whereClause = {};
        } else if (includeHistory) {
            // Return only historical orders (Chef History)
            whereClause = {
                status: {
                    [Op.in]: ['completed', 'cancelled']
                }
            };
        } else {
            // Return only active orders (Default/Chef Kitchen)
            whereClause = {
                status: {
                    [Op.notIn]: ['completed', 'cancelled']
                }
            };
        }

        const orders = await Order.findAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'customer',
                attributes: ['id', 'name']
            }],
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
        const settings = await RestaurantSetting.findOne();
        const restaurantStatus = settings?.status || 'OPEN';

        if (restaurantStatus === 'CLOSED') {
            return res.status(403).json({ message: 'Restaurant is currently closed for orders.' });
        }

        if (restaurantStatus === 'PAUSED') {
            return res.status(403).json({ message: 'Orders are temporarily paused. Please try again in a few minutes.' });
        }

        if (!isRestaurantOpen()) {
            return res.status(403).json({ message: 'Restaurant is currently closed. Orders are accepted between 10:00 AM and 11:00 PM.' });
        }
        const { items, totalAmount, userId, paymentId, paymentStatus } = req.body;

        if (!items || Object.keys(items).length === 0) {
            return res.status(400).json({ message: 'No order items provided' });
        }

        let assignedTableNumber = null;
        let activeBookingId = null;

        if (paymentId) {
            const existingOrder = await Order.findOne({
                where: { paymentId }
            });

            if (existingOrder) {
                return res.status(200).json(existingOrder);
            }
        }

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

        const orderData = newOrder.toJSON();
        
        // Notify chef room immediately
        emitNewOrder(orderData);

        // Create notification for customer
        if (userId) {
            const placementNotif = await Notification.create({
                userId,
                message: "Your order has been placed successfully!",
                type: 'order'
            });
            emitNotification(userId, placementNotif.toJSON());
        }

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

        // Create notification for customer
        if (order.userId) {
            const statusNotification = await Notification.create({
                userId: order.userId,
                message: `Your order #${order.id} status is now: ${status.toUpperCase()}`,
                type: 'order'
            });
            emitNotification(order.userId, statusNotification.toJSON());
        }
        // Push order update to stakeholders
        emitOrderStatusUpdate(order.userId ?? null, updatedOrder.toJSON());

        // Specific event for completion
        if (status === 'completed' && order.userId) {
            const io = getIO();
            io.to(`user:${order.userId}`).emit('order:completed', updatedOrder.toJSON());
        }

        // Table Management: When order is completed or cancelled, release table and booking
        if (status === 'completed' || status === 'cancelled') {
            console.log(`Order ${order.id} marked as ${status.toUpperCase()}. Releasing table...`);
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
                    table.customerId = null; // Fulfilling Feature 7 consistency
                    await table.save();
                    console.log(`Table ${order.tableNumber} status set to AVAILABLE and unassigned.`);
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

// @desc    Cancel order and refund to wallet
// @route   POST /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req: AuthRequest, res: Response) => {
    try {
        const orderId = req.params.id;
        const userId = req.user!.id;

        const order = await Order.findOne({ where: { id: orderId, userId } });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending orders can be cancelled' });
        }

        // Update order status
        order.status = 'cancelled';
        await order.save();

        // Create notification for cancellation
        const cancelNotification = await Notification.create({
            userId,
            message: `Order #${order.id} has been cancelled and refunded to your wallet.`,
            type: 'order'
        });
        emitNotification(userId as number, cancelNotification.toJSON());

        const refundAmount = Number(order.totalAmount || 0);
        let currentBalance = 0;

        // Refund to wallet securely using SQL increment
        const user = await User.findByPk(userId);
        if (user) {
            await user.increment('walletBalance', { by: refundAmount });
            
            // Re-fetch to get the updated balance
            await user.reload();
            currentBalance = Number(user.walletBalance || 0);

            // Build descriptive text
            const orderTypeStr = order.orderType === 'DINE_IN' ? 'Dine-In' : 'Takeaway';
            
            let itemDescstr = '';
            if (order.items && Array.isArray(order.items)) {
                // Parse items if stringified JSON
                let itemsList = order.items;
                try {
                    if (typeof itemsList === 'string') itemsList = JSON.parse(itemsList);
                } catch(e){}

                if (Array.isArray(itemsList)) {
                    itemDescstr = itemsList.map((i: any) => `${i.quantity}x ${i.itemName || i.name}`).join(', ');
                }
            }

            const descriptionText = `Refund for Order #${order.id} (${orderTypeStr})` + 
                                  (itemDescstr ? ` - Items: ${itemDescstr}` : '');

            // Record transaction
            await WalletTransaction.create({
                userId: user.id,
                amount: refundAmount,
                type: 'credit',
                description: descriptionText
            });
        }

        res.json({ message: 'Order cancelled successfully', walletBalance: currentBalance, order });
    } catch (error: any) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
