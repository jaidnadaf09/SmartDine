import { Response } from "express";
import razorpay from "../config/razorpay";
import Booking from "../models/Booking";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import crypto from "crypto";

// Helper: validate booking date is within today → today+30 days
// AND booking date+time is not in the past
const validateBookingDateTime = (dateStr: string, timeStr?: string): string | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    maxDate.setHours(23, 59, 59, 999);

    const bookingDate = new Date(dateStr);

    if (bookingDate < today) {
        return 'Booking date cannot be in the past.';
    }
    if (bookingDate > maxDate) {
        return 'Bookings allowed only within 30 days from today.';
    }

    // If time is provided, validate combined date+time is not in the past
    if (timeStr) {
        const bookingDateTime = new Date(`${dateStr}T${timeStr}`);
        if (bookingDateTime < new Date()) {
            return 'Cannot book a table for a past time.';
        }
    }

    return null;
};

export const createOrder = async (req: AuthRequest, res: Response) => {
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
        const errorDetail = error.response ? JSON.stringify(error.response) : error.message;
        res.status(500).json({
            success: false,
            message: "Failed to create payment order. Check if your account is active and KYC is complete.",
            error: errorDetail
        });
    }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
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

        // If bookingData exists, create the booking using the authenticated user's data
        if (bookingData) {
            // Fetch authenticated user from DB (ignore any name/email/phone from frontend)
            const user = await User.findByPk(req.user!.id);
            if (!user) {
                return res.status(401).json({ message: 'User not found. Please log in again.' });
            }

            // Validate booking date + time (past-time check)
            const dateTimeError = validateBookingDateTime(bookingData.date, bookingData.time);
            if (dateTimeError) {
                return res.status(400).json({ message: dateTimeError });
            }

            console.log('Backend: Creating booking record (pending table assignment)...');
            const newBooking = await Booking.create({
                ...bookingData,
                // Override with real user data from DB — ignores any frontend-supplied values
                customerName: user.name,
                email: user.email,
                phone: user.phone || 'Not provided',
                userId: user.id,
                date: new Date(bookingData.date),
                tableNumber: null,
                tableId: null,
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

        // Standard order verification (no booking)
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
