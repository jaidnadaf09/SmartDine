import { Request, Response } from 'express';
import Table from '../models/Table';

// @desc    Get all tables
// @route   GET /api/tables
// @access  Public
export const getTables = async (req: Request, res: Response) => {
    try {
        const tables = await Table.findAll();
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a table
// @route   POST /api/tables
// @access  Private/Admin
export const createTable = async (req: Request, res: Response) => {
    try {
        const table = await Table.create(req.body);
        res.status(201).json(table);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Update table status
// @route   PUT /api/tables/:id
// @access  Private/Staff
export const updateTable = async (req: Request, res: Response) => {
    try {
        const table = await Table.findByPk(req.params.id);

        if (table) {
            table.status = req.body.status || table.status;
            table.orders = req.body.orders !== undefined ? req.body.orders : table.orders;

            const updatedTable = await table.save();
            res.json(updatedTable);
        } else {
            res.status(404).json({ message: 'Table not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
