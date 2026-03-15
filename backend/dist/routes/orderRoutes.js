"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/')
    .get(authMiddleware_1.protect, authMiddleware_1.staffOnly, orderController_1.getOrders)
    .post(orderController_1.createOrder); // Public/Customer accessible
router.route('/my')
    .get(authMiddleware_1.protect, orderController_1.getMyOrders);
router.route('/user/:userId')
    .get(orderController_1.getUserOrders);
router.route('/:id/status')
    .patch(authMiddleware_1.protect, authMiddleware_1.staffOnly, orderController_1.updateOrderStatus);
router.route('/:id/cancel')
    .post(authMiddleware_1.protect, orderController_1.cancelOrder);
exports.default = router;
