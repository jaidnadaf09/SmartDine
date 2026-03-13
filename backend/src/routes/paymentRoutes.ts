import express from "express";
import { createOrder, verifyPayment, processWalletPayment } from "../controllers/paymentController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/wallet-pay", protect, processWalletPayment);

export default router;
