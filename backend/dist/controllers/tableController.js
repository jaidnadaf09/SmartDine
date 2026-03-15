"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTable = exports.createTable = exports.getTables = void 0;
const Table_1 = __importDefault(require("../models/Table"));
// @desc    Get all tables
// @route   GET /api/tables
// @access  Public
const getTables = async (req, res) => {
    try {
        const tables = await Table_1.default.findAll();
        res.json(tables);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getTables = getTables;
// @desc    Create a table
// @route   POST /api/tables
// @access  Private/Admin
const createTable = async (req, res) => {
    try {
        const table = await Table_1.default.create(req.body);
        res.status(201).json(table);
    }
    catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};
exports.createTable = createTable;
// @desc    Update table status
// @route   PUT /api/tables/:id
// @access  Private/Staff
const updateTable = async (req, res) => {
    try {
        const table = await Table_1.default.findByPk(req.params.id);
        if (table) {
            table.status = req.body.status || table.status;
            table.orders = req.body.orders !== undefined ? req.body.orders : table.orders;
            const updatedTable = await table.save();
            res.json(updatedTable);
        }
        else {
            res.status(404).json({ message: 'Table not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateTable = updateTable;
