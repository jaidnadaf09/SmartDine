import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Legal.css';

const ContactUs: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-container">
            <button className="back-btn" onClick={() => navigate('/')}>
                ← Back to Home
            </button>
            <div className="legal-content">
                <h1>Contact Us</h1>

                <section>
                    <h2>Get In Touch</h2>
                    <p>We'd love to hear from you! Whether you have a question about our menu, need help with a booking, or just want to share your experience, we are here for you.</p>
                </section>

                <section className="contact-details">
                    <h2>Contact Information</h2>
                    <p><strong>Email:</strong> support@smartdine.com</p>
                    <p><strong>Phone:</strong> +91 9518348788</p>
                    <p><strong>Address:</strong> Block No. 1, Jai Hind Nagar, Bijapur Road, Chaitanya Nagar, Konark Nagar, Jule, Solapur, Maharashtra 413004</p>
                </section>

                <section>
                    <h2>Operating Hours</h2>
                    <p><strong>Monday - Friday:</strong> 10:00 AM - 10:00 PM</p>
                    <p><strong>Saturday - Sunday:</strong> 09:00 AM - 11:00 PM</p>
                </section>
            </div>
        </div>
    );
};

export default ContactUs;
