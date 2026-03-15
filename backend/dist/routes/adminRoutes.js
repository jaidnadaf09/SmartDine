"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const restaurantController_1 = require("../controllers/restaurantController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Middleware to protect all admin routes
router.use(authMiddleware_1.protect, authMiddleware_1.adminOnly);
router.use((req, res, next) => {
    console.log(`[ADMIN ROUTER] Processing: ${req.method} ${req.path}`);
    next();
});
router.route('/staff').get(adminController_1.getStaffMembers);
router.route('/stats').get(adminController_1.getDashboardStats);
router.route('/users').get(adminController_1.getUsers);
router.route('/users/:id').delete(adminController_1.deleteUser);
router.route('/users/:id/role').put(adminController_1.updateUserRole);
router.route('/bookings').get(adminController_1.getBookings);
router.route('/bookings/history').get(adminController_1.getBookingsHistory);
router.route('/bookings/:id/status').put(adminController_1.updateBookingStatus);
router.route('/bookings/:id/cancel').put(adminController_1.cancelBooking);
router.route('/bookings/:id/complete').patch(adminController_1.completeBooking);
router.route('/bookings/:id/table').put(adminController_1.updateBookingTable);
router.route('/tables').get(adminController_1.getTables).post(adminController_1.addTable);
router.route('/tables/available').get(adminController_1.getAvailableTables);
router.route('/tables/:id').put(adminController_1.updateTable).delete(adminController_1.deleteTable);
router.route('/orders').get(adminController_1.getOrders);
router.route('/orders/history').get(adminController_1.getOrdersHistory);
router.route('/orders/:id/status').put(adminController_1.updateOrderStatus);
router.route('/payments').get(adminController_1.getPayments);
router.route('/restaurant-status').put(restaurantController_1.updateRestaurantStatus);
exports.default = router;
