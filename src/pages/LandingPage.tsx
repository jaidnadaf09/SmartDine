import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';
import restaurantImage from '../assets/Restaurant_business_plan_main.jpg';
import restaurantInterior from '../assets/restaurant_interior.png';
import reservedTable from '../assets/reserved_table.png';
import { useRestaurantStatus } from '../hooks/useRestaurantStatus';
import { Icons } from '../components/icons/IconSystem';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { status, isOperating, pauseUntil } = useRestaurantStatus();

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
      {/* Hero Section - Optimized 2-Column Grid */}
      <section className="hero">
        <div className="hero-grid-container">
          <div className="hero-text-content">
            <div className={`restaurant-status-badge ${isOperating ? 'open' : status === 'PAUSED' ? 'paused' : 'closed'}`}>
              <span className="status-dot"></span>
              {status === 'PAUSED' ? 'Orders Paused' : isOperating ? 'Open Now' : 'Closed'} • {
                status === 'PAUSED' ? `Resumes at ${new Date(pauseUntil!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` :
                isOperating ? `Closes at 11:00 PM` : `Opens at 10:00 AM`
              }
            </div>
            <h2>Ready to Taste the Excellence?</h2>
            <p>Experience the finest culinary culture at Rasoi Ghar. Delicious food meets authentic recipes for an unforgettable meal.</p>
            <div className="hero-actions">
              <button className="cta-btn" onClick={() => navigate('/order')}>Order Online Now</button>
              <button className="cta-btn secondary" onClick={() => navigate('/book-table')}>Table Reservation</button>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img src={restaurantInterior} alt="Rasoi Ghar Interior" className="hero-side-image" />
          </div>
        </div>
      </section>

      {/* Featured Dishes Section */}
      <section className="menu-section" id="featured-menu">
        <div className="section-header">
          <h2>Chef's Specials</h2>
          <p className="menu-subtitle">Taste the most loved dishes from our kitchen</p>
        </div>
        <div className="menu-grid">
          {featuredDishes.slice(0, 4).map((item) => (
            <div key={item.id} className="menu-item" onClick={() => navigate('/order')}>
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

      {/* Book Table Section - 2-Column Grid */}
      <section className="book-table-section">
        <div className="book-table-grid">
          <div className="book-table-image">
            <img src={reservedTable} alt="Reserved Table" className="side-image" />
          </div>
          <div className="book-table-content">
            <h2>Reserve Your Table Now</h2>
            <p>Skip the wait and secure your spot for a delightful dining experience. Perfect for family gatherings, dates, or celebrating special moments.</p>
            <button className="cta-btn" onClick={() => navigate('/book-table')}>
              Book Table
            </button>
          </div>
        </div>
      </section>

      {/* Experience & Features - Simplified */}
      <section className="showcase">
        <div className="showcase-content">
          <div className="showcase-text">
            <h2>Why Choose Rasoi Ghar?</h2>
            <p>Enjoy a comfortable and elegant restaurant environment where delicious food meets great hospitality.</p>
            
            <div className="features-mini-grid">
               <div className="mini-feature">
                  <Icons.utensils className="mini-icon" size={28} />
                  <div>
                    <h4>Premium Quality</h4>
                    <p>Fresh ingredients & authentic recipes</p>
                  </div>
               </div>
               <div className="mini-feature">
                  <Icons.chef className="mini-icon" size={28} />
                  <div>
                    <h4>Expert Chefs</h4>
                    <p>Experienced culinary masters</p>
                  </div>
               </div>
               <div className="mini-feature">
                  <Icons.home className="mini-icon" size={28} />
                  <div>
                    <h4>Cozy Ambiance</h4>
                    <p>Perfect place to relax and enjoy</p>
                  </div>
               </div>
               <div className="mini-feature">
                  <Icons.zap className="mini-icon" size={28} />
                  <div>
                    <h4>Quick Service</h4>
                    <p>Fast delivery without compromise</p>
                  </div>
               </div>
            </div>
          </div>
          <div className="showcase-image">
            <img src={restaurantImage} alt="Rasoi Ghar Vibe" />
          </div>
        </div>
      </section>


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
