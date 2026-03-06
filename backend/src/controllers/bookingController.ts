import { Request, Response } from 'express';
import Booking from '../models/Booking';

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

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Public
export const createBooking = async (req: Request, res: Response) => {
    try {
        console.log('Received booking request:', req.body);
        const booking = await Booking.create(req.body);
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
