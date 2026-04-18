import { Request, Response } from 'express';
import MenuItem from '../models/MenuItem';

import { generateDescription } from '../utils/generateDescription';

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
export const getMenuItems = async (req: Request, res: Response) => {
    try {
        const menuItems = await MenuItem.findAll();
        
        // Backfill descriptions if missing
        let hasUpdates = false;
        for (const item of menuItems) {
            if (!item.description || item.description.trim() === '') {
                item.description = generateDescription(item.name, item.category);
                await item.save();
                hasUpdates = true;
            }
        }
        
        res.json(menuItems);
    } catch (error) {
        console.error("Error fetching menu items:", error);
        return res.status(500).json({ message: 'Failed to fetch menu items' });
    }
};

// @desc    Create a menu item
// @route   POST /api/menu
// @access  Private/Admin
export const createMenuItem = async (req: Request, res: Response) => {
    try {
        const menuItem = await MenuItem.create(req.body);
        res.status(201).json(menuItem);
    } catch (error) {
        console.error("Error creating menu item:", error);
        return res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
export const updateMenuItem = async (req: Request, res: Response) => {
    try {
        const item = await MenuItem.findByPk(req.params.id);

        if (item) {
            item.name = req.body.name || item.name;
            item.category = req.body.category || item.category;
            item.price = req.body.price || item.price;
            item.status = req.body.status || item.status;
            item.description = req.body.description || item.description;

            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        console.error("Error updating menu item:", error);
        return res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
export const deleteMenuItem = async (req: Request, res: Response) => {
    try {
        const item = await MenuItem.findByPk(req.params.id);

        if (item) {
            await item.destroy();
            res.json({ message: 'Item removed' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        console.error("Error deleting menu item:", error);
        return res.status(500).json({ message: 'Server Error' });
    }
};
