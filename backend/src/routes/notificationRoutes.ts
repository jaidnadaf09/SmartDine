import express from 'express';
import { 
    getNotifications, 
    markAsRead, 
    deleteNotification, 
    clearNotifications 
} from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.delete('/clear', protect, clearNotifications);
router.delete('/:id', protect, deleteNotification);

export default router;
