import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';
import restaurantImage from '../assets/Restaurant_business_plan_main.jpg';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const featuredDishes = [
    { id: 1, name: 'Paneer Butter Masala', price: '₹280', description: 'Paneer in tomato gravy' },
    { id: 2, name: 'Chicken Tikka', price: '₹320', description: 'Grilled spicy chicken' },
    { id: 3, name: 'Butter Naan', price: '₹40', description: 'Soft butter bread' },
    { id: 4, name: 'Veg Biryani', price: '₹220', description: 'Spiced basmati rice' },
    { id: 5, name: 'Masala Dosa', price: '₹120', description: 'Crispy dosa with potato' },
    { id: 6, name: 'Chicken Biryani', price: '₹350', description: 'Aromatic chicken rice' },
    { id: 7, name: 'Gulab Jamun', price: '₹90', description: 'Sweet milk dumplings' },
    { id: 8, name: 'Chole Bhature', price: '₹150', description: 'Chickpeas with fried bread' },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2>Welcome to Rasoi Ghar</h2>
          <p>Experience the finest Food culture</p>
          <button
            className="cta-btn"
            onClick={() => {
              const element = document.getElementById('featured-menu');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore Our Menu
          </button>
        </div>
      </section>

      {/* Featured Dishes Section */}
      <section className="menu-section" id="featured-menu">
        <div className="section-header">
          <h2>Chef's Specials</h2>
          <p className="menu-subtitle">Taste the most loved dishes from our kitchen</p>
        </div>
        <div className="menu-grid">
          {featuredDishes.map((item) => (
            <div key={item.id} className="menu-item">
              <h3>{item.name}</h3>
              <p className="description">{item.description}</p>
              <p className="price">{item.price}</p>
            </div>
          ))}
        </div>
        <div className="view-all-container">
          <button className="view-all-btn" onClick={() => navigate('/order')}>
            View Full Menu
          </button>
        </div>
      </section>

      {/* SmartDine Restaurant Showcase Section */}
      <section className="showcase">
        <div className="showcase-content">
          <div className="showcase-text">
            <h2>Experience Dining at Rasoi Ghar</h2>
            <p>Enjoy a comfortable and elegant restaurant environment where delicious food meets great hospitality.
              Perfect for family dinners, celebrations, and casual dining.</p>
            <ul className="showcase-features">
              <li>✓ Natural lighting and fresh ambiance</li>
              <li>✓ Comfortable seating arrangements</li>
              <li>✓ Modern and elegant design</li>
              <li>✓ Perfect for meetings and social gatherings</li>
            </ul>
            <button className="cta-btn" onClick={() => navigate('/book-table')}>
              Book a Table Now
            </button>
          </div>
          <div className="showcase-image">
            <img
              src={restaurantImage}
              alt="Rasoi Ghar Restaurant Interior"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
              }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose Rasoi Ghar?</h2>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">🍽️</div>
            <h3>Premium Quality</h3>
            <p>Fresh ingredients and authentic recipes</p>
          </div>
          <div className="feature">
            <div className="feature-icon">👨🏻‍🍳</div>
            <h3>Expert Chefs</h3>
            <p>Experienced chefs preparing delicious meals</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🏠</div>
            <h3>Cozy Ambiance</h3>
            <p>The perfect place to relax and connect</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Quick Service</h3>
            <p>Fast delivery without compromising quality</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <h3 className="footer-title">Quick Links</h3>
          <div className="footer-links">
            <button className="footer-btn" onClick={() => navigate('/about-us')}>About Us</button>
            <button className="footer-btn" onClick={() => navigate('/contact-us')}>Contact Us</button>
            <button className="footer-btn" onClick={() => navigate('/privacy-policy')}>Privacy Policy</button>
            <button className="footer-btn" onClick={() => navigate('/refund-policy')}>Refund Policy</button>
            <button className="footer-btn" onClick={() => navigate('/terms-and-conditions')}>Terms & Conditions</button>
          </div>
          <p className="copyright">&copy; 2026 Rasoi Ghar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
