import { Request, Response } from 'express';
import Table from '../models/Table';
import { getAvailableTableSlots, getDailyTableAvailability as getDailyTableAvailabilityService } from '../services/tableAvailabilityService';

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

// @desc    Get table availability grouped by remaining time slots
// @route   GET /api/tables/availability
// @access  Public
export const getTableAvailability = async (req: Request, res: Response) => {
    try {
        const { date, guests } = req.query;

        if (!date || !guests) {
            return res.status(400).json({ message: 'Date and guests are required' });
        }

        const data = await getAvailableTableSlots(date as string, parseInt(guests as string, 10));
        res.json(data);
    } catch (error: any) {
        console.error('Error fetching table availability by slots:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get complete daily table availability (all tables, irrespective of capacity)
// @route   GET /api/tables/daily-availability
// @access  Public
export const getDailyTableAvailability = async (req: Request, res: Response) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        const data = await getDailyTableAvailabilityService(date as string);
        res.json(data);
    } catch (error: any) {
        console.error('Error fetching daily table availability:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
