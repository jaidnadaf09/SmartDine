import express from 'express';
import { createReview, getMyReviews, updateReview } from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/my', protect, getMyReviews);
router.put('/:orderId', protect, updateReview);

export default router;
