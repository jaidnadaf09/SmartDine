import { Response } from 'express';
import Booking from '../models/Booking';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { findAvailableTable } from '../utils/bookingUtils';

// Helper: validate booking date is within today → today+30 days
// AND booking date+time is not in the past
const validateBookingDateTime = (dateStr: string, timeStr?: string): string | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    maxDate.setHours(23, 59, 59, 999);

    const bookingDate = new Date(dateStr);

    if (bookingDate < today) {
        return 'Booking date cannot be in the past.';
    }
    if (bookingDate > maxDate) {
        return 'Bookings allowed only within 30 days from today.';
    }

    // If time is provided, validate combined date+time is not in the past
    if (timeStr) {
        const bookingDateTime = new Date(`${dateStr}T${timeStr}`);
        if (bookingDateTime < new Date()) {
            return 'Cannot book a table for a past time.';
        }
    }

    return null;
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Staff
export const getBookings = async (req: AuthRequest, res: Response) => {
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
export const checkAvailability = async (req: AuthRequest, res: Response) => {
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
// @access  Private (requires login)
export const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        console.log('Received booking request:', req.body);

        // Fetch authenticated user from DB
        const user = await User.findByPk(req.user!.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found. Please log in again.' });
        }

        // Validate booking date + time (past-time check)
        const dateTimeError = validateBookingDateTime(req.body.date, req.body.time);
        if (dateTimeError) {
            return res.status(400).json({ message: dateTimeError });
        }

        const booking = await Booking.create({
            ...req.body,
            // Override customer details with verified user data – ignore any body values
            customerName: user.name,
            email: user.email,
            phone: user.phone || 'Not provided',
            userId: user.id,
            tableId: null,
            tableNumber: null,
            status: req.body.status || 'pending',
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
export const updateBooking = async (req: AuthRequest, res: Response) => {
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

// @desc    Cancel a booking (user-initiated)
// @route   DELETE /api/bookings/:id/cancel
// @access  Private (booking owner only)
export const cancelBooking = async (req: AuthRequest, res: Response) => {
    try {
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Only allow the booking owner to cancel
        if (booking.userId !== req.user!.id) {
            return res.status(403).json({ message: 'You can only cancel your own bookings.' });
        }

        // Only allow cancellation if status is pending AND no table has been assigned
        if (booking.status !== 'pending' || booking.tableId !== null) {
            return res.status(400).json({
                message: 'Booking cannot be cancelled after table assignment or when preparation has started.'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully.', booking });
    } catch (error: any) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings/user/:userId
// @access  Public (for now, based on frontend implementation)
export const getUserBookings = async (req: AuthRequest, res: Response) => {
    try {
        const bookings = await Booking.findAll({ where: { userId: req.params.userId } });
        res.json(bookings);
    } catch (error: any) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
