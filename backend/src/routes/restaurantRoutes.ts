import express from 'express';
import { getRestaurantStatus } from '../controllers/restaurantController';

const router = express.Router();

// @desc    Get current restaurant status
// @route   GET /api/restaurant/status
// @access  Public
router.get('/status', getRestaurantStatus);

export default router;
