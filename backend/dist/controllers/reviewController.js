"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyReviews = exports.createReview = void 0;
const models_1 = require("../models");
// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body;
        const userId = req.user.id;
        // Check if order exists and belongs to user
        const order = await models_1.Order.findOne({ where: { id: orderId, userId } });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // Only allow reviews for completed orders
        if (order.status !== 'completed') {
            return res.status(400).json({ message: 'You can only review completed orders' });
        }
        // Check if review already exists
        const existingReview = await models_1.Review.findOne({ where: { orderId } });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this order' });
        }
        const review = await models_1.Review.create({
            userId,
            orderId,
            rating,
            comment
        });
        res.status(201).json(review);
    }
    catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
exports.createReview = createReview;
// @desc    Get reviews for a user
// @route   GET /api/reviews/my
// @access  Private
const getMyReviews = async (req, res) => {
    try {
        const reviews = await models_1.Review.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(reviews);
    }
    catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getMyReviews = getMyReviews;
