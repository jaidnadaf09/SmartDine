"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInventoryItem = exports.createInventoryItem = exports.getInventoryItems = void 0;
const InventoryItem_1 = __importDefault(require("../models/InventoryItem"));
// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private/Admin
const getInventoryItems = async (req, res) => {
    try {
        const items = await InventoryItem_1.default.findAll();
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getInventoryItems = getInventoryItems;
// @desc    Create an inventory item
// @route   POST /api/inventory
// @access  Private/Admin
const createInventoryItem = async (req, res) => {
    try {
        const item = await InventoryItem_1.default.create(req.body);
        res.status(201).json(item);
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};
exports.createInventoryItem = createInventoryItem;
// @desc    Update an inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin
const updateInventoryItem = async (req, res) => {
    try {
        const item = await InventoryItem_1.default.findByPk(req.params.id);
        if (item) {
            item.name = req.body.name || item.name;
            item.quantity = req.body.quantity !== undefined ? req.body.quantity : item.quantity;
            item.unit = req.body.unit || item.unit;
            item.status = req.body.status || item.status;
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
exports.updateInventoryItem = updateInventoryItem;
