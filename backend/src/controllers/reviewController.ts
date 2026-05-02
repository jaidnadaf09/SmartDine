import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Review, Order, User } from '../models';
import { emitNotification, emitReviewUpdate } from '../socket/socketServer';

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId, rating, comment } = req.body;
        const userId = req.user!.id;

        // Strict Validation
        if (!orderId || !rating || rating < 1) {
            return res.status(400).json({ message: 'Invalid review data. Rating is required (min: 1).' });
        }

        // Check if order exists and belongs to user
        const order = await Order.findOne({ where: { id: orderId, userId } });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only allow reviews for completed orders
        if (order.status !== 'completed') {
            return res.status(400).json({ message: 'You can only review completed orders' });
        }

        // Check if review already exists
        const existing = await Review.findOne({
            where: { orderId, userId }
        });
        if (existing) {
            return res.status(400).json({ message: 'Review already exists' });
        }

        const review = await Review.create({
            userId,
            orderId,
            rating,
            comment
        });

        // Notify Admin of new review
        emitNotification(review.userId!, { type: 'created' });
        emitReviewUpdate(review);

        res.status(201).json(review);
    } catch (error: any) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/my
// @access  Private
export const getMyReviews = async (req: AuthRequest, res: Response) => {
    try {
        const reviews = await Review.findAll({
            where: { userId: req.user!.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/admin/reviews
// @access  Private/Admin
export const getAllReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await Review.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'totalAmount', 'createdAt']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(reviews);
    } catch (error: any) {
        console.error('Error fetching all reviews:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

export const updateReview = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { orderId } = req.params;
        const { rating, comment } = req.body;
        
        const review = await Review.findOne({
            where: { orderId, userId }
        });
        
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        
        review.rating = rating;
        review.comment = comment;
        await review.save();
        
        res.json(review);
    } catch (err) {
        console.error('Error updating review:', err);
        res.status(500).json({ message: 'Failed to update review' });
    }
};
