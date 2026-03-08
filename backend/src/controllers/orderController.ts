import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import Table from '../models/Table';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Staff
export const getOrders = async (req: AuthRequest, res: Response) => {
    try {
        const orders = await Order.findAll({
            include: [
                { model: User, as: 'customer', attributes: ['name', 'email'] },
                { model: Table, as: 'table' }
            ],
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
        const { tableNumber, items, totalAmount, userId, bookingId, paymentId, paymentStatus } = req.body;

        if (!items || Object.keys(items).length === 0) {
            return res.status(400).json({ message: 'No order items provided' });
        }

        const newOrder = await Order.create({
            tableNumber: tableNumber || null,
            userId: userId || null,
            bookingId: bookingId || null,
            items: items, // JSON array of items mapped directly
            totalAmount: totalAmount || 0,
            status: 'pending',
            paymentId: paymentId || null,
            paymentStatus: paymentStatus || 'pending'
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

        if (order) {
            order.status = status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user orders
// @route   GET /api/orders/user/:userId
// @access  Public (for now, based on frontend)
export const getUserOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.params.userId },
            include: [
                { model: Table, as: 'table' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get my orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const orders = await Order.findAll({
            where: { userId: req.user.id },
            include: [
                { model: Table, as: 'table' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching my orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
