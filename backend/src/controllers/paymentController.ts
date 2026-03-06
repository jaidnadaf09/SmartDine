import { Request, Response } from "express";
import razorpay from "../config/razorpay";
import Booking from "../models/Booking";
import crypto from "crypto";

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { amount, bookingId } = req.body;

        if (!amount || !bookingId) {
            return res.status(400).json({ message: "Amount and bookingId are required" });
        }

        const options = {
            amount: amount * 100, // Rs to Paise
            currency: "INR",
            receipt: `receipt_booking_${bookingId}`,
        };

        const order = await razorpay.orders.create(options);

        // Update booking with amount (optional but good for records)
        await Booking.update(
            { amount: amount * 100 },
            { where: { id: bookingId } }
        );

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

export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            bookingId
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

        // Update booking status
        await Booking.update(
            {
                paymentId: razorpay_payment_id,
                paymentStatus: "paid",
                status: "confirmed" // Confirmation usually happens after payment
            },
            { where: { id: bookingId } }
        );

        res.json({ success: true, message: "Payment verified and booking confirmed" });
    } catch (error: any) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "Payment verification failed", error: error.message });
    }
};
