import express from 'express';
import { protect, chefOnly } from '../middleware/authMiddleware';
import {
    getChefDashboardStats,
    getKitchenOrders,
    updateChefOrderStatus,
    getChefReviews
} from '../controllers/chefController';

const router = express.Router();

// Apply protection to all chef routes
router.use(protect);
router.use(chefOnly);

// Stats
router.get('/stats', getChefDashboardStats);

// Active Kitchen Orders
router.get('/orders', getKitchenOrders);
router.put('/orders/:id/status', updateChefOrderStatus);
 
// Feedback
router.get('/reviews', getChefReviews);

export default router;
