import express from 'express';
import { getOrders, createOrder, updateOrderStatus, getUserOrders, getMyOrders, cancelOrder } from '../controllers/orderController';
import { protect, staffOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, staffOnly, getOrders)
    .post(createOrder); // Public/Customer accessible

router.route('/my')
    .get(protect, getMyOrders);

router.route('/user/:userId')
    .get(getUserOrders);

router.route('/:id/status')
    .patch(protect, staffOnly, updateOrderStatus);

router.route('/:id/cancel')
    .post(protect, cancelOrder);

export default router;
