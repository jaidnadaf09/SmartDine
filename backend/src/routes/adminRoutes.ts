import express from 'express';
import {
    getStaffMembers,
    getDashboardStats,
    getUsers,
    deleteUser,
    getBookings,
    updateBookingStatus,
    assignTable,
    getTables,
    addTable,
    updateTable,
    deleteTable,
    getOrders,
    updateOrderStatus,
    getPayments
} from '../controllers/adminController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Middleware to protect all admin routes
router.use(protect, adminOnly);

router.route('/staff').get(getStaffMembers);
router.route('/stats').get(getDashboardStats);

router.route('/users').get(getUsers);
router.route('/users/:id').delete(deleteUser);

router.route('/bookings').get(getBookings);
router.route('/bookings/:id/status').put(updateBookingStatus);
router.route('/bookings/:id/assign-table').put(assignTable);

router.route('/tables').get(getTables).post(addTable);
router.route('/tables/:id').put(updateTable).delete(deleteTable);

router.route('/orders').get(getOrders);
router.route('/orders/:id/status').put(updateOrderStatus);

router.route('/payments').get(getPayments);

export default router;
