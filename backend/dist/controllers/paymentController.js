"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processWalletPayment = exports.verifyPayment = exports.createOrder = void 0;
const razorpay_1 = __importDefault(require("../config/razorpay"));
const Booking_1 = __importDefault(require("../models/Booking"));
const User_1 = __importDefault(require("../models/User"));
const Order_1 = __importDefault(require("../models/Order"));
const WalletTransaction_1 = __importDefault(require("../models/WalletTransaction"));
const crypto_1 = __importDefault(require("crypto"));
// Helper: validate booking date is within today → today+30 days
// AND booking date+time is not in the past
const validateBookingDateTime = (dateStr, timeStr) => {
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
const createOrder = async (req, res) => {
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
        const order = await razorpay_1.default.orders.create(options);
        console.log('Backend: Razorpay order created successfully:', order.id);
        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    }
    catch (error) {
        console.error("Backend: Error creating Razorpay order:", error);
        const errorDetail = error.response ? JSON.stringify(error.response) : error.message;
        res.status(500).json({
            success: false,
            message: "Failed to create payment order. Check if your account is active and KYC is complete.",
            error: errorDetail
        });
    }
};
exports.createOrder = createOrder;
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingData } = req.body;
        console.log('Backend: Verifying payment for order:', razorpay_order_id);
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_secret) {
            console.error('Backend: RAZORPAY_KEY_SECRET missing');
            return res.status(500).json({ message: "Razorpay secret key not configured" });
        }
        const generatedSignature = crypto_1.default
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
            const user = await User_1.default.findByPk(req.user.id);
            if (!user) {
                return res.status(401).json({ message: 'User not found. Please log in again.' });
            }
            // Validate booking date + time (past-time check)
            const dateTimeError = validateBookingDateTime(bookingData.date, bookingData.time);
            if (dateTimeError) {
                return res.status(400).json({ message: dateTimeError });
            }
            console.log('Backend: Creating booking record (pending table assignment)...');
            const newBooking = await Booking_1.default.create({
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
                status: "pending" // ✅ pending until admin assigns a table
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
    }
    catch (error) {
        console.error("Backend: Error verifying payment:", error);
        res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message
        });
    }
};
exports.verifyPayment = verifyPayment;
const processWalletPayment = async (req, res) => {
    try {
        const { amount, bookingData, orderData } = req.body;
        const totalAmount = Number(amount);
        if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
            return res.status(400).json({ message: "Invalid payment amount." });
        }
        const user = await User_1.default.findByPk(req.user.id);
        if (!user) {
            return res.status(401).json({ message: "User not found." });
        }
        const currentBalance = Number(user.walletBalance || 0);
        if (currentBalance < totalAmount) {
            return res.status(400).json({
                message: "Insufficient wallet balance.",
                walletBalance: currentBalance
            });
        }
        let newBooking = null;
        let newOrder = null;
        const transactionRef = `wallet_txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        if (bookingData) {
            // Validate booking past-time check
            const dateTimeError = validateBookingDateTime(bookingData.date, bookingData.time);
            if (dateTimeError) {
                return res.status(400).json({ message: dateTimeError });
            }
            // Create Booking
            newBooking = await Booking_1.default.create({
                ...bookingData,
                customerName: user.name,
                email: user.email,
                phone: user.phone || 'Not provided',
                userId: user.id,
                date: new Date(bookingData.date),
                tableNumber: null,
                tableId: null,
                amount: totalAmount,
                paymentId: transactionRef,
                paymentStatus: "paid",
                status: "pending" // ✅ pending until admin assigns a table
            });
            console.log('Backend: Booking created via Wallet:', newBooking.id);
        }
        if (orderData) {
            let assignedTableNumber = null;
            let activeBookingId = null;
            const activeBooking = await Booking_1.default.findOne({
                where: {
                    userId: user.id,
                    status: 'confirmed'
                },
                order: [['createdAt', 'DESC']]
            });
            if (activeBooking && activeBooking.tableNumber) {
                assignedTableNumber = activeBooking.tableNumber;
                activeBookingId = activeBooking.id;
            }
            const orderType = assignedTableNumber ? 'DINE_IN' : 'TAKEAWAY';
            newOrder = await Order_1.default.create({
                tableNumber: assignedTableNumber,
                userId: user.id,
                bookingId: activeBookingId,
                items: orderData.items,
                totalAmount: totalAmount,
                status: 'pending',
                paymentId: transactionRef,
                paymentStatus: 'paid',
                orderType: orderType
            });
            console.log('Backend: Order created via Wallet:', newOrder.id);
        }
        // Deduct from wallet securely
        await user.decrement('walletBalance', { by: totalAmount });
        await user.reload();
        let desc = "Wallet Payment";
        if (newBooking)
            desc = `Payment for Booking #${newBooking.id}`;
        if (newOrder)
            desc = `Payment for Order #${newOrder.id}`;
        await WalletTransaction_1.default.create({
            userId: user.id,
            amount: totalAmount,
            type: 'debit',
            description: desc
        });
        return res.json({
            success: true,
            message: "Wallet payment processed successfully",
            walletBalance: Number(user.walletBalance),
            booking: newBooking,
            order: newOrder
        });
    }
    catch (error) {
        console.error("Backend: Error processing wallet payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process wallet payment",
            error: error.message
        });
    }
};
exports.processWalletPayment = processWalletPayment;
