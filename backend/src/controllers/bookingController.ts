import { Response } from 'express';
import Booking from '../models/Booking';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { findAvailableTable } from '../utils/bookingUtils';
import WalletTransaction from '../models/WalletTransaction';
import { isRestaurantOpen, isValidWorkingHour } from '../utils/workingHours';
import { Notification, RestaurantSetting, Table } from '../models';
import sequelize from '../config/db';
import { findBestAvailableTable } from '../services/tableAssignmentService';

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
        const bookings = await Booking.findAll({ order: [['id', 'DESC']] });
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
        const { date, time, guests } = req.body;
        console.log('Backend: Checking availability for:', date, time, 'guests:', guests);

        let availableTableNumber = null;

        if (guests) {
            // New capacity-aware logic if guests passed
            const availableTable = await findBestAvailableTable({
                guestCount: parseInt(guests, 10),
                date,
                timeSlot: time
            });
            if (availableTable) {
                availableTableNumber = availableTable.tableNumber;
            }
        } else {
            // Legacy fallback if no guests provided
            const fallbackTable = await findAvailableTable(date, time);
            if (fallbackTable) {
                availableTableNumber = fallbackTable;
            }
        }

        if (availableTableNumber !== null) {
            console.log('Backend: Table available:', availableTableNumber);
            res.json({ available: true, tableNumber: availableTableNumber });
        } else {
            console.warn('Backend: No tables available for this slot/capacity');
            res.json({ available: false, message: 'No suitable tables available for this time slot.' });
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
        const settings = await RestaurantSetting.findOne();
        if (settings && settings.status === 'CLOSED') {
            return res.status(403).json({ 
                message: 'Restaurant is currently closed for bookings. Please try again later.' 
            });
        }

        // 2. Validate Restaurant Opening Hours for the SELECTED booking time
        if (!isValidWorkingHour(req.body.time)) {
            return res.status(400).json({ 
                message: 'Tables can only be booked during restaurant working hours (10 AM - 11 PM)' 
            });
        }    console.log('Received booking request:', req.body);

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

        // Use a transaction to prevent race conditions during table assignment
        const result = await sequelize.transaction(async (t) => {
            const bestTable = await findBestAvailableTable({
                guestCount: parseInt(req.body.guests, 10),
                date: req.body.date,
                timeSlot: req.body.time,
                transaction: t
            });

            const assignedTableId = bestTable ? bestTable.id : null;
            const assignedTableNumber = bestTable ? bestTable.tableNumber : null;
            const bookingStatus = bestTable ? 'confirmed' : 'pending';

            const booking = await Booking.create({
                ...req.body,
                // Override with verified server-side values — client cannot influence these
                customerName: user.name,
                email: user.email,
                phone: user.phone || 'Not provided',
                userId: user.id,
                tableId: assignedTableId,
                tableNumber: assignedTableNumber,
                status: bookingStatus,
            }, { transaction: t });

            // Create notification for new booking
            await Notification.create({
                userId: user.id,
                message: `Your table booking request #${booking.id} has been received.`,
                type: 'booking'
            }, { transaction: t });

            return booking;
        });

        res.status(201).json(result);
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

            // Create notification for booking update
            if (booking.userId) {
                await Notification.create({
                    userId: booking.userId,
                    message: `Your booking #${booking.id} has been updated to: ${booking.status.toUpperCase()}`,
                    type: 'booking'
                });
            }

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

        // 5-minute cancellation window check
        const bookingTime = new Date(booking.createdAt || booking.date).getTime();
        const now = new Date().getTime();
        const diffMinutes = (now - bookingTime) / (1000 * 60);

        if (diffMinutes > 5) {
            return res.status(400).json({ 
                message: 'Booking can only be cancelled within 5 minutes after booking.' 
            });
        }

        // Only allow cancellation if status is pending/confirmed AND no table has been assigned
        const validStatuses = ['pending', 'confirmed'];
        if (!validStatuses.includes(booking.status) || booking.tableId !== null) {
            return res.status(400).json({
                message: 'Booking cannot be cancelled after table assignment or when preparation has started.'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        let updatedBalance = undefined;

        // Refund booking amount to wallet if paid/amount exists
        const refundAmount = Number(booking.amount || 10); // default to 10 if not saved (assuming Rs 10 booking fee)
        const user = await User.findByPk(req.user!.id);
        
        if (user && booking.paymentStatus === 'paid') {
            await user.increment('walletBalance', { by: refundAmount });
            await user.reload();
            updatedBalance = Number(user.walletBalance || 0);

            const bookingDateStr = new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            
            await WalletTransaction.create({
                userId: user.id,
                amount: refundAmount,
                type: 'credit',
                description: `Refund for Booking #${booking.id} - Guests: ${booking.guests}, Date: ${bookingDateStr}`
            });
        }

        res.json({ 
            message: 'Booking cancelled successfully.', 
            booking,
            walletBalance: updatedBalance
        });
    } catch (error: any) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Get user's nearest upcoming booking (within next 2 hours)
// @route   GET /api/bookings/upcoming
// @access  Private
export const getUpcomingBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { Op } = require('sequelize');
        
        // Use current local time for comparison
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        const booking = await Booking.findOne({
            where: {
                userId: req.user!.id,
                status: 'confirmed',
                date: {
                    [Op.lte]: twoHoursFromNow,
                    [Op.gte]: new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Today or later
                }
            },
            order: [
                ['date', 'ASC'],
                ['time', 'ASC']
            ]
        });

        if (!booking) {
            return res.json({ upcomingBooking: null });
        }

        // Additional filter for time if needed (since time is a string)
        // Convert "HH:MM" to a comparable number
        const bookingDateTime = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.time}`);
        const timeDiff = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60);

        if (timeDiff > 0 && timeDiff <= 120) {
            return res.json({
                upcomingBooking: {
                    id: booking.id,
                    tableNumber: booking.tableNumber,
                    date: booking.date,
                    time: booking.time,
                    guests: booking.guests
                }
            });
        }

        res.json({ upcomingBooking: null });
    } catch (error: any) {
        console.error('Error fetching upcoming booking:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
// @desc    Get user bookings
// @route   GET /api/bookings/user/:userId
// @access  Public
export const getUserBookings = async (req: AuthRequest, res: Response) => {
    try {
        const bookings = await Booking.findAll({
            where: { userId: req.params.userId },
            include: [
                {
                    model: Table,
                    as: 'table',
                    attributes: ['id', 'tableNumber', 'capacity'],
                }
            ],
            order: [['id', 'DESC']]
        });
        res.json(bookings);
    } catch (error: any) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
