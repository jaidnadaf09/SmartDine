import { Request, Response } from 'express';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import sequelize from '../config/db';

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Staff
export const getOrders = async (req: AuthRequest, res: Response) => {
    try {
        const orders = await Order.findAll({
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [
                        {
                            model: User,
                            as: 'chef',
                            attributes: ['name']
                        }
                    ]
                }
            ]
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
        const { tableNumber, items, totalAmount, userId } = req.body;

        if (items && items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const order = await Order.create({
            tableNumber,
            totalAmount,
            userId,
        });

        if (items && items.length > 0) {
            const orderItemsData = items.map((item: any) => ({
                orderId: order.id,
                itemName: item.itemName,
                quantity: item.quantity || 1,
                status: item.status || 'pending',
                assignedChef: item.assignedChef || null,
                estimatedTime: item.estimatedTime || 5
            }));

            await OrderItem.bulkCreate(orderItemsData);
        }

        const createdOrder = await Order.findByPk(order.id, {
            include: [{ model: OrderItem, as: 'items' }]
        });

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: 'Invalid order data' });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
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

// @desc    Update order item status
// @route   PUT /api/orders/:id/item/:itemId
// @access  Private/Staff
export const updateOrderItemStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { status, assignedChef } = req.body;
        const orderItem = await OrderItem.findOne({
            where: {
                id: req.params.itemId,
                orderId: req.params.id
            }
        });

        if (orderItem) {
            if (status) orderItem.status = status;
            if (assignedChef) orderItem.assignedChef = assignedChef;

            await orderItem.save();

            // Fetch the full order to return updated state
            const order = await Order.findByPk(req.params.id, {
                include: [{ model: OrderItem, as: 'items' }]
            });
            res.json(order);
        } else {
            res.status(404).json({ message: 'Item not found in order' });
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
            include: [{ model: OrderItem, as: 'items' }],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
