import { Request, Response } from "express";
import razorpay from "../config/razorpay";
import Booking from "../models/Booking";
import crypto from "crypto";

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ message: "Amount is required" });
        }

        const options = {
            amount: amount * 100, // Rs to Paise
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error: any) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: "Failed to create payment order", error: error.message });
    }
};

import { findAvailableTable } from "../utils/bookingUtils";

export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            bookingData // All details from frontend
        } = req.body;

        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_secret) {
            return res.status(500).json({ message: "Razorpay secret key not configured" });
        }

        const generatedSignature = crypto
            .createHmac("sha256", key_secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        // 1. Double check availability
        const tableNumber = await findAvailableTable(bookingData.date, bookingData.time);
        if (!tableNumber) {
            return res.status(400).json({ message: "No tables available for this slot anymore. Please contact support for refund." });
        }

        // 2. Create the booking record
        const newBooking = await Booking.create({
            ...bookingData,
            tableNumber,
            paymentId: razorpay_payment_id,
            paymentStatus: "paid",
            status: "confirmed"
        });

        res.json({
            success: true,
            message: "Payment verified and booking confirmed",
            booking: newBooking
        });
    } catch (error: any) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Payment verification failed", error: error.message });
    }
};
