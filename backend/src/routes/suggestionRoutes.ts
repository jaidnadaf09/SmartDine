import express from 'express';
import { getDishSuggestions, getCartUpsell } from '../controllers/suggestionController';

const router = express.Router();

// GET /api/suggestions/:dishId — get suggestions for a specific dish
router.get('/:dishId', getDishSuggestions);

// POST /api/suggestions/cart — get upsell suggestions based on cart
router.post('/cart', getCartUpsell);

export default router;
