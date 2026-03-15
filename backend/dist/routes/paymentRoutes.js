"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post("/create-order", authMiddleware_1.protect, paymentController_1.createOrder);
router.post("/verify", authMiddleware_1.protect, paymentController_1.verifyPayment);
router.post("/wallet-pay", authMiddleware_1.protect, paymentController_1.processWalletPayment);
exports.default = router;
