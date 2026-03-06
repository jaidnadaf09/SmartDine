import express from 'express';
import { getOrders, createOrder, updateOrderStatus, updateOrderItemStatus, getUserOrders } from '../controllers/orderController';
import { protect, staffOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, staffOnly, getOrders)
    .post(createOrder); // Public/Customer accessible

router.route('/user/:userId')
    .get(getUserOrders);

router.route('/:id/status')
    .put(protect, staffOnly, updateOrderStatus);

router.route('/:id/item/:itemId')
    .put(protect, staffOnly, updateOrderItemStatus);

export default router;
