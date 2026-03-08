import express from 'express';
import { getBookings, createBooking, updateBooking, getUserBookings, checkAvailability, getMyBookings } from '../controllers/bookingController';
import { protect, staffOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, staffOnly, getBookings)
    .post(createBooking);

router.post('/check-availability', checkAvailability);

router.get('/my', protect, getMyBookings);

router.route('/user/:userId')
    .get(getUserBookings);

router.route('/:id')
    .put(protect, staffOnly, updateBooking);

export default router;
