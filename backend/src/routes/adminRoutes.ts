import express from 'express';
import {
    getStaffMembers,
    getDashboardStats,
    getUsers,
    updateUserRole,
    deleteUser,
    getBookings,
    getBookingsHistory,
    completeBooking,
    updateBookingStatus,
    cancelBooking,
    updateBookingTable,
    getTables,
    getAvailableTables,
    addTable,
    updateTable,
    deleteTable,
    getOrders,
    getOrdersHistory,
    updateOrderStatus,
    getPayments
} from '../controllers/adminController';
import { getAllReviews } from '../controllers/reviewController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Middleware to protect all admin routes
router.use(protect, adminOnly);

router.use((req, res, next) => {
    console.log(`[ADMIN ROUTER] Processing: ${req.method} ${req.path}`);
    next();
});

router.route('/staff').get(getStaffMembers);
router.route('/stats').get(getDashboardStats);

router.route('/users').get(getUsers);
router.route('/users/:id').delete(deleteUser);
router.route('/users/:id/role').put(updateUserRole);

router.route('/bookings').get(getBookings);
router.route('/bookings/history').get(getBookingsHistory);
router.route('/bookings/:id/status').put(updateBookingStatus);
router.route('/bookings/:id/cancel').put(cancelBooking);
router.route('/bookings/:id/complete').patch(completeBooking);
router.route('/bookings/:id/table').put(updateBookingTable);

router.route('/tables').get(getTables).post(addTable);
router.route('/tables/available').get(getAvailableTables);
router.route('/tables/:id').put(updateTable).delete(deleteTable);

router.route('/orders').get(getOrders);
router.route('/orders/history').get(getOrdersHistory);
router.route('/orders/:id/status').put(updateOrderStatus);

router.route('/payments').get(getPayments);
router.get('/reviews', getAllReviews);

export default router;
