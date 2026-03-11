import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AvatarDropdown from '../../../components/shared/AvatarDropdown';
import '../../../App.css';
import '../../../styles/ChefPortal.css';

interface ChefLayoutProps {
  children: React.ReactNode;
}

const ChefLayout: React.FC<ChefLayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/chef/dashboard', label: '📊 Dashboard' },
    { path: '/chef/orders',    label: '👨‍🍳 Kitchen Orders' },
    { path: '/chef/order-history', label: '📜 Completed Orders' },
  ];

  return (
    <div className="chef-wrapper">
      {/* ── Top Header ── */}
      <header className="chef-header">
        <div className="chef-header-inner">
          <div className="chef-brand">
            <span>🍽️</span>
            <span className="chef-brand-name">SmartDine</span>
            <span className="chef-role-tag">Chef Portal</span>
          </div>

          <nav className="chef-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`chef-nav-btn ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="chef-header-right">
            <AvatarDropdown showName={false} />
          </div>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="chef-main">
        {children}
      </main>
    </div>
  );
};

export default ChefLayout;

