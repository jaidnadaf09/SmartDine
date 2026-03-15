"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMenuItem = exports.updateMenuItem = exports.createMenuItem = exports.getMenuItems = void 0;
const MenuItem_1 = __importDefault(require("../models/MenuItem"));
// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
    try {
        const menuItems = await MenuItem_1.default.findAll();
        res.json(menuItems);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getMenuItems = getMenuItems;
// @desc    Create a menu item
// @route   POST /api/menu
// @access  Private/Admin
const createMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem_1.default.create(req.body);
        res.status(201).json(menuItem);
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};
exports.createMenuItem = createMenuItem;
// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
const updateMenuItem = async (req, res) => {
    try {
        const item = await MenuItem_1.default.findByPk(req.params.id);
        if (item) {
            item.name = req.body.name || item.name;
            item.category = req.body.category || item.category;
            item.price = req.body.price || item.price;
            item.status = req.body.status || item.status;
            item.description = req.body.description || item.description;
            const updatedItem = await item.save();
            res.json(updatedItem);
        }
        else {
            res.status(404).json({ message: 'Item not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateMenuItem = updateMenuItem;
// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
    try {
        const item = await MenuItem_1.default.findByPk(req.params.id);
        if (item) {
            await item.destroy();
            res.json({ message: 'Item removed' });
        }
        else {
            res.status(404).json({ message: 'Item not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteMenuItem = deleteMenuItem;
