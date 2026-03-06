import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Legal.css';

const ReturnRefundPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-container">
            <button className="back-btn" onClick={() => navigate('/')}>
                ← Back to Home
            </button>
            <div className="legal-content">
                <h1>Return & Refund Policy</h1>
                <p><strong>Last Updated:</strong> March 2026</p>

                <section>
                    <h2>1. Food Orders</h2>
                    <p>Due to the perishable nature of food, we do not accept returns on any food items once they have been fulfilled and handed over to the customer or delivery partner.</p>
                </section>

                <section>
                    <h2>2. Refunds for Online Orders</h2>
                    <p>If you receive an incorrect or damaged item, please contact us immediately upon receipt. We will evaluate the issue and, if approved, initiate a refund to your original method of payment (via Razorpay). Refunds may take 5-7 business days to reflect in your account depending on your bank's policies.</p>
                </section>

                <section>
                    <h2>3. Table Booking Cancellations</h2>
                    <p>Table bookings can be cancelled free of charge up to 2 hours before the scheduled time. Cancellations made within 2 hours of the booking time may be subject to a nominal cancellation fee.</p>
                </section>

                <section>
                    <h2>4. Failed Transactions</h2>
                    <p>If a transaction fails but money is deducted from your account, it will automatically be refunded to your source account by the payment gateway within 3-5 business days.</p>
                </section>
            </div>
        </div>
    );
};

export default ReturnRefundPolicy;
