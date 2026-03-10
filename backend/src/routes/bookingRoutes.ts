import express from 'express';
import { getBookings, createBooking, updateBooking, getUserBookings, checkAvailability, cancelBooking } from '../controllers/bookingController';
import { updateBookingTable } from '../controllers/adminController';
import { protect, staffOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, staffOnly, getBookings)
    .post(protect, createBooking);

router.post('/check-availability', checkAvailability);

router.route('/user/:userId')
    .get(getUserBookings);

router.route('/:id')
    .put(protect, staffOnly, updateBooking);

router.route('/:id/table')
    .put(protect, staffOnly, updateBookingTable);

// User-initiated cancellation (pending + no table only)
router.delete('/:id/cancel', protect, cancelBooking);

export default router;
