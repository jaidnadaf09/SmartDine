import React from 'react';
import { useNavigate } from 'react-router-dom';
import '@styles/pages/Legal.css';

const AboutUs: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="legal-container">
            <button className="back-btn" onClick={() => navigate('/')}>
                ← Back to Home
            </button>
            <div className="legal-content">
                <h1>About Us</h1>

                <section>
                    <h2>Welcome to Rasoi Ghar!</h2>
                    <p>Founded in 2026, Rasoi Ghar is dedicated to providing an exceptional dining experience. We believe that food is not just sustenance, but an experience to be shared and remembered.</p>
                </section>

                <section>
                    <h2>Our Mission</h2>
                    <p>Our mission is to bring people together over delicious, high-quality, authentic food in a warm and inviting atmosphere. We strive to source the best ingredients and prepare every dish with care and passion.</p>
                </section>

                <section>
                    <h2>Our Vision</h2>
                    <p>We envision Rasoi Ghar as a community hub where friends and family can gather, celebrate, and create lasting memories over unforgettable meals.</p>
                </section>

                <section>
                    <h2>The Team</h2>
                    <p>Our team consists of experienced chefs, dedicated servers, and passionate management who all work together to ensure your experience with us is nothing short of perfect.</p>
                </section>
            </div>
        </div>
    );
};

export default AboutUs;
