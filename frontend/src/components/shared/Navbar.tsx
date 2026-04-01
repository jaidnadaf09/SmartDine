import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import AvatarDropdown from './AvatarDropdown';
import NotificationPanel from './NotificationPanel';
import { Icons } from '../icons/IconSystem';
import '../../App.css';
import './MobileBottomNav.css';

interface NavLink {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface NavbarProps {
  customLinks?: Array<{ name: string; path: string }>;
  roleTag?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  'Home':             <Icons.home size={20} />,
  'Book Table':       <Icons.calendarDays size={20} />,
  'Order':            <Icons.utensilsCrossed size={20} />,
  'Menu':             <Icons.utensilsCrossed size={20} />,
  'My Order':         <Icons.shoppingBag size={20} />,
  'My Orders':        <Icons.shoppingBag size={20} />,
  'Admin Dashboard':  <Icons.dashboard size={20} />,
  'Chef Portal':      <Icons.chef size={20} />,
  'Dashboard':        <Icons.dashboard size={20} />,
  'Kitchen Orders':   <Icons.chef size={20} />,
  'Order History':    <Icons.historyIcon size={20} />,
  'Completed Orders': <Icons.historyIcon size={20} />,
  'Tables & Orders':  <Icons.clipboard size={20} />,
};

const Navbar: React.FC<NavbarProps> = ({ customLinks, roleTag }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { openAuthModal } = useAuthModal();

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isChef  = user?.role?.toLowerCase() === 'chef';

  const defaultLinks: NavLink[] = [
    { name: 'Home',       path: '/',              icon: <Icons.home size={20} /> },
    { name: 'Menu',       path: '/order',         icon: <Icons.utensilsCrossed size={20} /> },
    { name: 'Book Table', path: '/book-table',    icon: <Icons.calendarDays size={20} /> },
  ];

  if (isAuthenticated && !customLinks) {
    defaultLinks.push({ name: 'My Orders', path: '/customer/myorders', icon: <Icons.shoppingBag size={20} /> });
  }

  if (isAdmin && !customLinks) {
    defaultLinks.push({ name: 'Admin Dashboard', path: '/admin/dashboard', icon: <Icons.dashboard size={20} /> });
  }

  if (isChef && !customLinks) {
    defaultLinks.push({ name: 'Chef Portal', path: '/chef', icon: <Icons.chef size={20} /> });
  }

  const finalLinks: NavLink[] = customLinks
    ? customLinks.map(l => ({ ...l, icon: iconMap[l.name] || null }))
    : defaultLinks;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleProtectedNavigation = (e: React.MouseEvent, path: string) => {
    // Only intercept for certain paths that require auth
    const protectedPaths = ['/order', '/book-table', '/customer', '/profile'];
    const isProtected = protectedPaths.some(p => path.startsWith(p));

    if (isProtected && !isAuthenticated) {
      e.preventDefault();
      openAuthModal('login');
      return;
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo */}
        <Link 
          to="/" 
          className="logo-link"
          onClick={() => {
            setTimeout(() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth"
              });
            }, 0);
          }}
        >
          <img src="/spoon-fork-transparent.png" alt="SmartDine logo" className="navbar-logo-img" />
          SmartDine
          {roleTag && <span className="role-tag-badge">{roleTag}</span>}
        </Link>

        {/* Nav Links + Right controls */}
        <div className="navbar-right">
          <nav className="nav-buttons desktop-nav">
            {finalLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={(e) => {
                  handleProtectedNavigation(e, link.path);

                  setTimeout(() => {
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth"
                    });
                  }, 0);
                }}
                className={`nav-btn${isActive(link.path) ? ' active' : ''} navbar-item`}
              >
                {link.icon}
                <span className="nav-label">{link.name}</span>
              </Link>
            ))}
          </nav>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="navbar-user-welcome header-actions">
              <span className="welcome-text">Welcome, {user?.name}</span>
              
              <NotificationPanel />
              <AvatarDropdown />
            </div>
          ) : (
            <>
              <button className="nav-btn login-btn" onClick={() => openAuthModal('login')}>
                Login
              </button>
              <button
                className="nav-btn signup-btn"
                onClick={() => openAuthModal('signup')}
              >
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
