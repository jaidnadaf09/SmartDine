import express from 'express';
import { getStaffMembers, getDashboardStats } from '../controllers/adminController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/staff').get(protect, adminOnly, getStaffMembers);
router.route('/stats').get(protect, adminOnly, getDashboardStats);

export default router;
