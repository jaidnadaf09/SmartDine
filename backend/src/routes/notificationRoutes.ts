import express from 'express';
import { getNotifications, markAsRead, clearNotifications, deleteNotification } from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getNotifications);
router.delete('/clear', protect, clearNotifications);
router.delete('/:id', protect, deleteNotification);
router.put('/:id/read', protect, markAsRead);

export default router;
