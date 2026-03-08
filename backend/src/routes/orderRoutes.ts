import express from 'express';
import { getOrders, createOrder, updateOrderStatus, getUserOrders, getMyOrders } from '../controllers/orderController';
import { protect, staffOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, staffOnly, getOrders)
    .post(createOrder); // Public/Customer accessible

router.get('/my', protect, getMyOrders);

router.route('/user/:userId')
    .get(getUserOrders);

router.route('/:id/status')
    .patch(protect, staffOnly, updateOrderStatus);

export default router;
