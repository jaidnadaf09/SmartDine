import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AvatarDropdown from './AvatarDropdown';
import {
  Home,
  UtensilsCrossed,
  CalendarDays,
  ShoppingBag,
  LayoutDashboard,
  ChefHat,
} from 'lucide-react';
import '../../App.css';

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
  'Home':            <Home size={16} />,
  'Book Table':      <CalendarDays size={16} />,
  'Order':           <UtensilsCrossed size={16} />,
  'Menu':            <UtensilsCrossed size={16} />,
  'My Order':        <ShoppingBag size={16} />,
  'My Orders':       <ShoppingBag size={16} />,
  'Admin Dashboard': <LayoutDashboard size={16} />,
  'Chef Portal':     <ChefHat size={16} />,
};

const Navbar: React.FC<NavbarProps> = ({ customLinks, roleTag }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isChef  = user?.role?.toLowerCase() === 'chef';

  const defaultLinks: NavLink[] = [
    { name: 'Home',       path: '/',              icon: <Home size={15} /> },
    { name: 'Menu',       path: '/order',         icon: <UtensilsCrossed size={15} /> },
    { name: 'Book Table', path: '/book-table',    icon: <CalendarDays size={15} /> },
  ];

  if (isAuthenticated && !customLinks) {
    defaultLinks.push({ name: 'My Orders', path: '/customer/myorders', icon: <ShoppingBag size={15} /> });
  }

  if (isAdmin && !customLinks) {
    defaultLinks.push({ name: 'Admin Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={15} /> });
  }

  if (isChef && !customLinks) {
    defaultLinks.push({ name: 'Chef Portal', path: '/chef', icon: <ChefHat size={15} /> });
  }

  const finalLinks: NavLink[] = customLinks
    ? customLinks.map(l => ({ ...l, icon: iconMap[l.name] || null }))
    : defaultLinks;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo */}
        <Link to="/" className="logo-link">
          <span className="logo-icon">🍽️</span>
          SmartDine
          {roleTag && <span className="role-tag-badge">{roleTag}</span>}
        </Link>

        {/* Nav Links + Right controls */}
        <div className="navbar-right">
          <nav className="nav-buttons">
            {finalLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-btn${isActive(link.path) ? ' active' : ''}`}
              >
                {link.icon}
                <span className="nav-label">{link.name}</span>
              </Link>
            ))}
          </nav>



          {/* Auth */}
          {isAuthenticated ? (
            <AvatarDropdown showName={false} />
          ) : (
            <>
              <button className="nav-btn login-btn" onClick={() => navigate('/login')}>
                Login
              </button>
              <button
                className="nav-btn signup-btn"
                onClick={() => navigate('/signup')}
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
