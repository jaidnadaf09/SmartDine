"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingController_1 = require("../controllers/bookingController");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get('/upcoming', authMiddleware_1.protect, bookingController_1.getUpcomingBooking);
router.route('/')
    .get(authMiddleware_1.protect, authMiddleware_1.staffOnly, bookingController_1.getBookings)
    .post(authMiddleware_1.protect, bookingController_1.createBooking);
router.post('/check-availability', bookingController_1.checkAvailability);
router.route('/user/:userId')
    .get(bookingController_1.getUserBookings);
router.route('/:id')
    .put(authMiddleware_1.protect, authMiddleware_1.staffOnly, bookingController_1.updateBooking);
router.route('/:id/table')
    .put(authMiddleware_1.protect, authMiddleware_1.staffOnly, adminController_1.updateBookingTable);
// User-initiated cancellation (pending + no table only)
router.delete('/:id/cancel', authMiddleware_1.protect, bookingController_1.cancelBooking);
exports.default = router;
