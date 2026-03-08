import { Request, Response } from "express";
import razorpay from "../config/razorpay";
import Booking from "../models/Booking";
import crypto from "crypto";

export const createOrder = async (req: Request, res: Response) => {
    try {
        const amount = Number(req.body.amount);
        console.log('Backend: Creating Razorpay order for amount:', amount);

        if (!amount || isNaN(amount)) {
            console.error('Backend: Invalid amount in request:', req.body.amount);
            return res.status(400).json({ message: "Valid amount is required" });
        }

        const options = {
            amount: Math.round(amount * 100), // Rs to Paise, ensure integer
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };

        console.log('Backend: Sending options to Razorpay:', options);

        // Log keys partially for verification (security safe)
        const keyId = process.env.RAZORPAY_KEY_ID || "";
        console.log(`Backend: Order Attempt using Key ID: ${keyId.substring(0, 8)}...`);

        const order = await razorpay.orders.create(options);
        console.log('Backend: Razorpay order created successfully:', order.id);

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error: any) {
        console.error("Backend: Error creating Razorpay order:", error);
        // Provide more detail if available in error objects from SDK
        const errorDetail = error.response ? JSON.stringify(error.response) : error.message;
        res.status(500).json({
            success: false,
            message: "Failed to create payment order. Check if your account is active and KYC is complete.",
            error: errorDetail
        });
    }
};

import { findAvailableTable } from "../utils/bookingUtils";

export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            bookingData
        } = req.body;

        console.log('Backend: Verifying payment for order:', razorpay_order_id);

        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_secret) {
            console.error('Backend: RAZORPAY_KEY_SECRET missing');
            return res.status(500).json({ message: "Razorpay secret key not configured" });
        }

        const generatedSignature = crypto
            .createHmac("sha256", key_secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            console.error('Backend: Invalid signature mismatch');
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        console.log('Backend: Signature verified.');

        // If bookingData exists, proceed to create the booking
        if (bookingData) {
            console.log('Backend: Checking table availability for booking...');

            // 1. Double check availability
            const tableNumber = await findAvailableTable(bookingData.date, bookingData.time);
            if (!tableNumber) {
                console.error('Backend: No tables available during verification');
                return res.status(400).json({ message: "No tables available for this slot anymore. Please contact support." });
            }

            // 2. Create the booking record
            console.log('Backend: Creating confirmed booking record for table:', tableNumber);
            const newBooking = await Booking.create({
                ...bookingData,
                date: new Date(bookingData.date), // Ensure Date object
                tableNumber,
                paymentId: razorpay_payment_id,
                paymentStatus: "paid",
                status: "confirmed"
            });

            console.log('Backend: Booking created successfully. ID:', newBooking.id);
            return res.json({
                success: true,
                message: "Payment verified and booking confirmed",
                booking: newBooking
            });
        }

        // If bookingData doesn't exist, this is just a standard order verification
        return res.json({
            success: true,
            message: "Payment verified successfully"
        });

    } catch (error: any) {
        console.error("Backend: Error verifying payment:", error);
        res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message
        });
    }
};
