import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AvatarDropdown from './AvatarDropdown';
import '../../App.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isChef  = user?.role?.toLowerCase() === 'chef';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Book Table', path: '/book-table' },
    { name: 'Order', path: '/order' },
  ];

  if (isAuthenticated) {
    navLinks.push({ name: 'My Order', path: '/customer/myorders' });
  }

  if (isAdmin) {
    navLinks.push({ name: 'Admin Dashboard', path: '/admin/dashboard' });
  }

  if (isChef) {
    navLinks.push({ name: 'Chef Portal', path: '/chef' });
  }

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-link">
          <span className="logo-icon">🍽️</span> SmartDine
        </Link>

        <div className="navbar-right">
          <nav className="nav-buttons">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-btn ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {isAuthenticated ? (
            <AvatarDropdown showName={false} />
          ) : (
            <>
              <button className="nav-btn login-btn" onClick={() => navigate('/login')}>
                Login
              </button>
              <button className="nav-btn signup-btn" style={{ background: 'white', color: '#6f4e37' }} onClick={() => navigate('/signup')}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
