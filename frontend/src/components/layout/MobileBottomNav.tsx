import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icons } from '../icons/IconSystem';
import './MobileBottomNav.css';

const MobileBottomNav: React.FC = () => {
  const handleMobileNavClick = () => {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }, 0);
  };

  return (
    <nav className="mobile-bottom-nav">
      <NavLink to="/" onClick={handleMobileNavClick} className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
        <Icons.home size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/order" onClick={handleMobileNavClick} className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
        <Icons.utensilsCrossed size={20} />
        <span>Menu</span>
      </NavLink>

      <NavLink to="/book-table" onClick={handleMobileNavClick} className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
        <Icons.calendarDays size={20} />
        <span>Book</span>
      </NavLink>

      <NavLink to="/customer/myorders" onClick={handleMobileNavClick} className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
        <Icons.shoppingBag size={20} />
        <span>Orders</span>
      </NavLink>
    </nav>
  );
};

export default MobileBottomNav;

