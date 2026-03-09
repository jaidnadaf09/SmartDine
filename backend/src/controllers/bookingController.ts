import { Request, Response } from 'express';
import Booking from '../models/Booking';

import { findAvailableTable } from '../utils/bookingUtils';

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Staff
export const getBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await Booking.findAll();
        res.json(bookings);
    } catch (error: any) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Check availability for a slot
// @route   POST /api/bookings/check-availability
// @access  Public
export const checkAvailability = async (req: Request, res: Response) => {
    try {
        const { date, time } = req.body;
        console.log('Backend: Checking availability for:', date, time);

        const availableTable = await findAvailableTable(date, time);

        if (availableTable) {
            console.log('Backend: Table available:', availableTable);
            res.json({ available: true, tableNumber: availableTable });
        } else {
            console.warn('Backend: No tables available for this slot');
            res.json({ available: false, message: 'No tables available for this time slot.' });
        }
    } catch (error: any) {
        console.error('Backend: Error checking availability:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Public
export const createBooking = async (req: Request, res: Response) => {
    try {
        console.log('Received booking request:', req.body);

        const booking = await Booking.create({
            ...req.body,
            tableId: null,
            tableNumber: null,
            status: 'pending' // Correctly default to pending so Admin can assign it
        });

        res.status(201).json(booking);
    } catch (error: any) {
        console.error('CRITICAL BOOKING ERROR:', error);
        res.status(400).json({
            message: error.message || 'Invalid booking data',
            details: error.errors?.map((e: any) => e.message) || []
        });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private/Staff
export const updateBooking = async (req: Request, res: Response) => {
    try {
        const booking = await Booking.findByPk(req.params.id);

        if (booking) {
            booking.status = req.body.status || booking.status;
            booking.tableNumber = req.body.tableNumber || booking.tableNumber;

            const updatedBooking = await booking.save();
            res.json(updatedBooking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error: any) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings/user/:userId
// @access  Public (for now, based on frontend implementation)
export const getUserBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await Booking.findAll({ where: { userId: req.params.userId } });
        res.json(bookings);
    } catch (error: any) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
