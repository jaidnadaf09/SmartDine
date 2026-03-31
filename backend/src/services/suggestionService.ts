import MenuItem from '../models/MenuItem';
import { Op } from 'sequelize';

/**
 * Category-based suggestion mapping.
 * When a dish from a given category is in the cart, suggest items from these complementary categories.
 */
const SUGGESTION_MAP: Record<string, string[]> = {
    'biryani': ['beverages', 'raita', 'desserts', 'starters'],
    'rice': ['beverages', 'raita', 'desserts', 'curry'],
    'curry': ['rice', 'bread', 'beverages', 'naan'],
    'bread': ['curry', 'beverages', 'starters'],
    'naan': ['curry', 'beverages', 'starters'],
    'starters': ['beverages', 'main course', 'curry'],
    'appetizers': ['beverages', 'main course', 'curry'],
    'main course': ['beverages', 'desserts', 'bread', 'rice'],
    'desserts': ['beverages', 'ice cream'],
    'ice cream': ['beverages', 'desserts'],
    'beverages': ['starters', 'desserts', 'snacks'],
    'drinks': ['starters', 'desserts', 'snacks'],
    'snacks': ['beverages', 'drinks'],
    'pizza': ['beverages', 'desserts', 'starters'],
    'pasta': ['beverages', 'desserts', 'starters', 'bread'],
    'sandwich': ['beverages', 'snacks', 'fries'],
    'burger': ['beverages', 'fries', 'desserts'],
    'chinese': ['beverages', 'starters', 'desserts'],
    'south indian': ['beverages', 'starters', 'desserts'],
    'north indian': ['beverages', 'bread', 'rice', 'desserts'],
};

/**
 * Upsell category mapping — suggest "upgrade" categories when user has items from these categories.
 */
const UPSELL_MAP: Record<string, string[]> = {
    'biryani': ['family pack', 'combo', 'beverages', 'desserts'],
    'rice': ['combo', 'beverages', 'desserts'],
    'curry': ['combo', 'bread', 'rice', 'desserts'],
    'main course': ['combo', 'beverages', 'desserts'],
    'starters': ['main course', 'beverages'],
    'pizza': ['combo', 'beverages', 'desserts'],
    'burger': ['combo', 'beverages', 'fries'],
};

/**
 * Get suggestions for a single dish by its ID.
 * Returns complementary items based on the dish's category.
 */
export const getSuggestionsForDish = async (dishId: number, limit: number = 3): Promise<MenuItem[]> => {
    try {
        const dish = await MenuItem.findByPk(dishId);
        if (!dish) return [];

        const category = dish.category.toLowerCase().trim();

        // Find matching suggestion categories
        let suggestedCategories: string[] = [];
        for (const [key, values] of Object.entries(SUGGESTION_MAP)) {
            if (category.includes(key) || key.includes(category)) {
                suggestedCategories = [...suggestedCategories, ...values];
            }
        }

        // Fallback: suggest from popular categories if no mapping found
        if (suggestedCategories.length === 0) {
            suggestedCategories = ['beverages', 'desserts', 'starters'];
        }

        // Remove duplicates
        suggestedCategories = [...new Set(suggestedCategories)];

        // Build case-insensitive category conditions
        const categoryConditions = suggestedCategories.map(cat => ({
            category: { [Op.iLike]: `%${cat}%` }
        }));

        const suggestions = await MenuItem.findAll({
            where: {
                id: { [Op.ne]: dishId },
                status: 'available',
                [Op.or]: categoryConditions,
            },
            limit,
            order: [['price', 'ASC']],
        });

        return suggestions;
    } catch (error) {
        console.error('SuggestionService: Error getting suggestions:', error);
        return [];
    }
};

/**
 * Get upsell suggestions based on cart items.
 * Analyzes cart categories and suggests upgrades/combos/complementary items.
 */
export const getUpsellForCart = async (
    cartItems: Array<{ id: number; name?: string; category?: string }>,
    limit: number = 3
): Promise<MenuItem[]> => {
    try {
        if (!cartItems || cartItems.length === 0) return [];

        const cartItemIds = cartItems.map(i => i.id);

        // Get full item details if category not provided
        let categories: string[] = [];
        if (cartItems[0]?.category) {
            categories = cartItems.map(i => (i.category || '').toLowerCase().trim());
        } else {
            const items = await MenuItem.findAll({ where: { id: { [Op.in]: cartItemIds } } });
            categories = items.map(i => i.category.toLowerCase().trim());
        }

        // Find upsell categories
        let upsellCategories: string[] = [];
        for (const cat of categories) {
            for (const [key, values] of Object.entries(UPSELL_MAP)) {
                if (cat.includes(key) || key.includes(cat)) {
                    upsellCategories = [...upsellCategories, ...values];
                }
            }
        }

        // Fallback
        if (upsellCategories.length === 0) {
            upsellCategories = ['combo', 'beverages', 'desserts'];
        }

        // Remove duplicates and categories already in cart
        upsellCategories = [...new Set(upsellCategories)].filter(
            cat => !categories.some(c => c.includes(cat) || cat.includes(c))
        );

        const categoryConditions = upsellCategories.map(cat => ({
            category: { [Op.iLike]: `%${cat}%` }
        }));

        if (categoryConditions.length === 0) {
            // If all upsell categories are already in cart, just suggest popular items
            const popular = await MenuItem.findAll({
                where: {
                    id: { [Op.notIn]: cartItemIds },
                    status: 'available',
                },
                limit,
                order: [['price', 'DESC']],
            });
            return popular;
        }

        const upsellItems = await MenuItem.findAll({
            where: {
                id: { [Op.notIn]: cartItemIds },
                status: 'available',
                [Op.or]: categoryConditions,
            },
            limit,
            order: [['price', 'ASC']],
        });

        return upsellItems;
    } catch (error) {
        console.error('SuggestionService: Error getting upsell suggestions:', error);
        return [];
    }
};
