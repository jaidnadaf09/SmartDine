import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, useScroll, useMotionTemplate } from 'framer-motion';
import '@styles/pages/LandingPage.css';
import restaurantImage from '@assets/images/Restaurant_business_plan_main.jpg';
import restaurantInterior from '@assets/images/restaurant_interior.png';
import reservedTable from '@assets/images/reserved_table.png';
import { Icons } from '@components/icons/IconSystem';

const heroMessages = [
  "Experience the finest culinary culture at Rasoi Ghar.",
  "Delicious food meets authentic recipes.",
  "Reserve your table in seconds.",
  "Freshly prepared meals, served with perfection.",
  "Smart dining experience powered by technology."
];

const TypewriterText: React.FC = () => {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (index >= heroMessages.length) return;

    const currentMessage = heroMessages[index];
    let timeout: any;

    if (!deleting && subIndex <= currentMessage.length) {
      timeout = setTimeout(() => {
        setText(currentMessage.substring(0, subIndex));
        setSubIndex(prev => prev + 1);
      }, 55);
    } else if (!deleting && subIndex > currentMessage.length) {
      timeout = setTimeout(() => {
        setDeleting(true);
        setSubIndex(prev => prev - 1);
      }, 2200);
    } else if (deleting && subIndex >= 0) {
      timeout = setTimeout(() => {
        setText(currentMessage.substring(0, subIndex));
        setSubIndex(prev => prev - 1);
      }, 35);
    } else if (deleting && subIndex < 0) {
      setDeleting(false);
      setIndex(prev => (prev + 1) % heroMessages.length);
      setSubIndex(0);
    }

    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting]);

  return (
    <>
      {text}
      <span className="typing-cursor">|</span>
    </>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const { scrollY } = useScroll();
  const rawProgress = useTransform(scrollY, [0, 500], [0, 1]);
  const progress = useSpring(rawProgress, { stiffness: 80, damping: 20 });

  // Background Parallax
  const bgX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const bgY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);
  const bgScale = useTransform(progress, [0, 1], [1, 1.1]);

  // Transforms
  const heroScale = useTransform(progress, [0, 1], [1, 0.92]);
  const heroOpacity = useTransform(progress, [0, 1], [1, 0.6]);
  const heroBgSize = useTransform(progress, [0, 1], [100, 108]);
  const heroBgSizePercent = useMotionTemplate`${heroBgSize}%`;

  // Text
  const textX = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const textYMouse = useTransform(smoothY, [-0.5, 0.5], [-12, 12]);
  const textYScroll = useTransform(progress, [0, 1], [0, -100]);
  const textY = useTransform([textYMouse, textYScroll], (values: any) => values[0] + values[1]);
  const textOpacity = useTransform(progress, [0, 1], [1, 0.4]);
  const textScale = useTransform(progress, [0, 1], [1, 0.9]);

  // Image
  const imgX = useTransform(smoothX, [-0.5, 0.5], [-25, 25]);
  const imgYMouse = useTransform(smoothY, [-0.5, 0.5], [-25, 25]);
  const imgYScroll = useTransform(progress, [0, 1], [0, -80]);
  const imgY = useTransform([imgYMouse, imgYScroll], (values: any) => values[0] + values[1]);
  const imgScale = useTransform(progress, [0, 1], [1.02, 1.12]);
  const imgRotateX = useTransform(smoothY, [-0.5, 0.5], [-4, 4]);
  const imgRotateY = useTransform(smoothX, [-0.5, 0.5], [4, -4]);

  // Light Layer
  const lightX = useTransform(smoothX, [-0.5, 0.5], [-30, 30]);
  const lightY = useTransform(smoothY, [-0.5, 0.5], [-30, 30]);

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
      <motion.section 
        className="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        onMouseMove={handleMouseMove}
        style={{
          scale: heroScale,
          opacity: heroOpacity,
          backgroundSize: heroBgSizePercent
        }}
      >
        <motion.div 
          className="hero-depth-bg" 
          style={{
            x: bgX,
            y: bgY,
            scale: bgScale
          }} 
        />
        <motion.div 
          className="hero-light-layer" 
          style={{
            x: lightX,
            y: lightY,
            opacity: 0.15
          }}
        />
        <div className="hero-grid-container">
          <motion.div 
            className="hero-text-content"
            style={{
              x: textX,
              y: textY,
              opacity: textOpacity,
              scale: textScale
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div 
                className="restaurant-status-badge open"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <span className="status-dot"></span>
                Open 24/7 • Ready to Serve You
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Ready to Taste the Excellence?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="hero-description"
              >
                <TypewriterText />
              </motion.p>
              <div className="hero-actions">
                <motion.button 
                  className="cta-btn" 
                  onClick={() => navigate('/order')}
                >
                  Order Online Now
                </motion.button>
                <motion.button 
                  className="cta-btn secondary" 
                  onClick={() => navigate('/book-table')}
                >
                  Table Reservation
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
          <div className="hero-image-wrapper">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ perspective: 1000 }}
            >
              <motion.img 
                src={restaurantInterior} 
                alt="Rasoi Ghar Interior" 
                className="hero-side-image" 
                loading="lazy" 
                style={{
                  x: imgX,
                  y: imgY,
                  scale: imgScale,
                  rotateX: imgRotateX,
                  rotateY: imgRotateY
                }}
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      <div className="section-divider"></div>

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

      <div className="section-divider"></div>

      {/* Book Table Section - 2-Column Grid */}
      <section className="book-table-section">
        <div className="book-table-grid">
          <div className="book-table-image">
            <img src={reservedTable} alt="Reserved Table" className="side-image" loading="lazy" />
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

      <div className="section-divider"></div>

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
            <img src={restaurantImage} alt="Rasoi Ghar Vibe" loading="lazy" />
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

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
