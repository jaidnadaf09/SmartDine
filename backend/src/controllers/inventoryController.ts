import { Request, Response } from 'express';
import InventoryItem from '../models/InventoryItem';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private/Admin
export const getInventoryItems = async (req: Request, res: Response) => {
    try {
        const items = await InventoryItem.findAll();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create an inventory item
// @route   POST /api/inventory
// @access  Private/Admin
export const createInventoryItem = async (req: Request, res: Response) => {
    try {
        const item = await InventoryItem.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Update an inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin
export const updateInventoryItem = async (req: Request, res: Response) => {
    try {
        const item = await InventoryItem.findByPk(req.params.id);

        if (item) {
            item.name = req.body.name || item.name;
            item.quantity = req.body.quantity !== undefined ? req.body.quantity : item.quantity;
            item.unit = req.body.unit || item.unit;
            item.status = req.body.status || item.status;

            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
