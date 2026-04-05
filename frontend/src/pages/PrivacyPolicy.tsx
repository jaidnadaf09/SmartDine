import React from 'react';
import { useNavigate } from 'react-router-dom';
import '@styles/pages/Legal.css';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-container">
            <button className="back-btn" onClick={() => navigate('/')}>
                ← Back to Home
            </button>
            <div className="legal-content">
                <h1>Privacy Policy</h1>
                <p><strong>Last Updated:</strong> March 2026</p>

                <section>
                    <h2>1. Information We Collect</h2>
                    <p>We collect information you provide directly to us when you create an account, make a booking, or place an order. This includes your name, email address, phone number, and any special requests you provide.</p>
                </section>

                <section>
                    <h2>2. How We Use Your Information</h2>
                    <p>We use the information we collect to operate our restaurant services, process orders and bookings, communicate with you, and improve our customer experience.</p>
                </section>

                <section>
                    <h2>3. Data Security</h2>
                    <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>
                </section>

                <section>
                    <h2>4. Third-Party Services</h2>
                    <p>We use third-party payment processors (like Razorpay) to handle secure transactions. We do not store your full credit card information on our servers.</p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
