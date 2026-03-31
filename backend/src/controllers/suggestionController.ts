import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getSuggestionsForDish, getUpsellForCart } from '../services/suggestionService';

/**
 * @desc    Get add-on suggestions for a specific dish
 * @route   GET /api/suggestions/:dishId
 * @access  Public
 */
export const getDishSuggestions = async (req: AuthRequest, res: Response) => {
    try {
        const dishId = parseInt(req.params.dishId, 10);
        if (isNaN(dishId)) {
            return res.status(400).json({ message: 'Invalid dish ID' });
        }

        const suggestions = await getSuggestionsForDish(dishId, 3);
        res.json(suggestions);
    } catch (error: any) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

/**
 * @desc    Get upsell suggestions based on cart items
 * @route   POST /api/suggestions/cart
 * @access  Public
 */
export const getCartUpsell = async (req: AuthRequest, res: Response) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Cart items are required' });
        }

        const upsellItems = await getUpsellForCart(items, 3);
        res.json(upsellItems);
    } catch (error: any) {
        console.error('Error fetching upsell suggestions:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
