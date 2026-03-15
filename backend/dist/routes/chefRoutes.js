"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const chefController_1 = require("../controllers/chefController");
const router = express_1.default.Router();
// Apply protection to all chef routes
router.use(authMiddleware_1.protect);
router.use(authMiddleware_1.chefOnly);
// Stats
router.get('/stats', chefController_1.getChefDashboardStats);
// Active Kitchen Orders
router.get('/orders', chefController_1.getKitchenOrders);
router.put('/orders/:id/status', chefController_1.updateChefOrderStatus);
// Order History (Completed Today)
router.get('/order-history', chefController_1.getChefOrderHistory);
exports.default = router;
