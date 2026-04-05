import React from 'react';
import { useNavigate } from 'react-router-dom';
import '@styles/pages/Legal.css';

const TermsAndConditions: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-container">
            <button className="back-btn" onClick={() => navigate('/')}>
                ← Back to Home
            </button>
            <div className="legal-content">
                <h1>Terms and Conditions & Disclaimer</h1>
                <p><strong>Last Updated:</strong> March 2026</p>

                <section>
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing or using the SmartDine website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.</p>
                </section>

                <section>
                    <h2>2. Services</h2>
                    <p>SmartDine provides an online platform for browsing menus, placing food orders, and booking tables at Rasoi Ghar.</p>
                </section>

                <section>
                    <h2>3. Pricing and Availability</h2>
                    <p>All prices are subject to change without notice. Menu items are subject to availability. We reserve the right to limit the quantities of any products or services that we offer.</p>
                </section>

                <section>
                    <h2>4. Disclaimer of Warranties</h2>
                    <p>Our website and services are provided "as is" and "as available" without any warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability or fitness for a particular purpose.</p>
                </section>

                <section>
                    <h2>5. Limitation of Liability</h2>
                    <p>SmartDine shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.</p>
                </section>
            </div>
        </div>
    );
};

export default TermsAndConditions;
