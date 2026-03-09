import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LandingPage.css';
import restaurantImage from '../assets/Restaurant_business_plan_main.jpg';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const foodMenu = [
    { id: 1, name: 'Chicken Tandoori', price: '₹120', description: 'Classic Indian roasted chicken' },
    { id: 2, name: 'Chicken Pahadi', price: '₹150', description: 'Green herbs and spices marinated chicken' },
    { id: 3, name: 'Paneer Tikka', price: '₹110', description: 'Cottage cheese grilled in tandoor' },
    { id: 4, name: 'Veg Manchurian', price: '₹130', description: 'Indo-Chinese vegetable dumplings' },
    { id: 5, name: 'Chicken Tikka', price: '₹320', description: 'Grilled spicy chicken' },
    { id: 6, name: 'Butter Naan', price: '₹40', description: 'Soft butter bread' },
    { id: 7, name: 'Veg Biryani', price: '₹220', description: 'Spiced basmati rice' },
    { id: 8, name: 'Gulab Jamun', price: '₹90', description: 'Sweet milk dumplings' },
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">🍽️ SmartDine</h1>
          <nav className="nav-buttons">
            <button
              className="nav-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              Menu
            </button>
            <button className="nav-btn" onClick={() => navigate('/book-table')}>
              Book Table
            </button>
            <button className="nav-btn" onClick={() => navigate('/order')}>
              Order
            </button>
            {isAuthenticated && ( // Only show "My Order" if authenticated
              <>
                <button className="nav-btn" onClick={() => navigate('/customer')}>
                  My Order
                </button>
                {/* Admin button only visible for admin role */}
                {user?.role?.toLowerCase() === 'admin' && (
                  <button className="nav-btn" onClick={() => navigate('/admin/dashboard')}>
                    Admin Panel
                  </button>
                )}
              </>
            )}
            {isAuthenticated ? (
              <button className="nav-btn logout-btn" onClick={logout}>
                Logout
              </button>
            ) : (
              <>
                <button className="nav-btn login-btn" onClick={() => navigate('/login')}>
                  Login
                </button>
                <button className="nav-btn signup-btn" onClick={() => navigate('/signup')}>
                  Sign Up
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2>Welcome to Rasoi Ghar</h2>
          <p>Experience the finest Food culture</p>
          <button
            className="cta-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            Explore Our Menu
          </button>
        </div>
      </section>

      {/* Menu Section */}
      {showMenu && (
        <section className="menu-section">
          <h2>🍽 Our Menu</h2>
          <p className="menu-subtitle">Freshly prepared dishes crafted with authentic flavors.</p>
          <div className="landing-menu-list">
            {foodMenu.map((item) => (
              <div key={item.id} className="landing-menu-row">
                <span className="landing-menu-name">{item.name}</span>
                <span className="landing-menu-dots"></span>
                <span className="landing-menu-price">{item.price}</span>
              </div>
            ))}
          </div>
        </section>
      )}

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
              alt="SmartDine Restaurant Interior"
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
        <h2>Why Choose Smart Dine?</h2>
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
        <div className="footer-links">
          <button className="footer-btn" onClick={() => navigate('/about-us')}>About Us</button>
          <button className="footer-btn" onClick={() => navigate('/contact-us')}>Contact Us</button>
          <button className="footer-btn" onClick={() => navigate('/privacy-policy')}>Privacy Policy</button>
          <button className="footer-btn" onClick={() => navigate('/refund-policy')}>Refund Policy</button>
          <button className="footer-btn" onClick={() => navigate('/terms-and-conditions')}>Terms & Conditions</button>
        </div>
        <p>&copy; 2026 Smart Dine. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
