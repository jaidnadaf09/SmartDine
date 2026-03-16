import express from 'express';
import { protect, chefOnly } from '../middleware/authMiddleware';
import {
    getChefDashboardStats,
    getKitchenOrders,
    updateChefOrderStatus,
    getChefOrderHistory
} from '../controllers/chefController';
import { getAllReviews } from '../controllers/reviewController';

const router = express.Router();

// Apply protection to all chef routes
router.use(protect);
router.use(chefOnly);

// Stats
router.get('/stats', getChefDashboardStats);

// Active Kitchen Orders
router.get('/orders', getKitchenOrders);
router.put('/orders/:id/status', updateChefOrderStatus);

// Order History (Completed Today)
router.get('/order-history', getChefOrderHistory);

// Reviews / Feedback
router.get('/reviews', getAllReviews);

export default router;
