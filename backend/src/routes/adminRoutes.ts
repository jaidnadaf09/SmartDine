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
    unassignTable,
    updateBookingTable,
    assignTable,
    checkInBooking,
    getTables,
    getAvailableTables,
    addTable,
    updateTable,
    deleteTable,
    getOrders,
    getOrdersHistory,
    updateOrderStatus,
    getPayments,
    getAllReviews,
    markNoShow
} from '../controllers/adminController';
import { updateRestaurantStatus } from '../controllers/restaurantController';
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
router.route('/bookings/:id/unassign-table').patch(unassignTable);
router.route('/bookings/:id/table').put(updateBookingTable);
router.route('/bookings/:id/assign-table').patch(assignTable);
router.route('/bookings/:id/check-in').patch(checkInBooking);
router.route('/bookings/:id/no-show').patch(markNoShow);

router.route('/tables').get(getTables).post(addTable);
router.route('/tables/available').get(getAvailableTables);
router.route('/tables/:id').put(updateTable).delete(deleteTable);

router.route('/orders').get(getOrders);
router.route('/orders/history').get(getOrdersHistory);
router.route('/orders/:id/status').put(updateOrderStatus);

router.route('/payments').get(getPayments);
router.route('/reviews').get(getAllReviews);
router.route('/restaurant-status').put(updateRestaurantStatus);

export default router;
