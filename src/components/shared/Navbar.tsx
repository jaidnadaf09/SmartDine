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
  Bell,
  Check,
  History,
  ClipboardList
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
  'Home':             <Home size={16} />,
  'Book Table':       <CalendarDays size={16} />,
  'Order':            <UtensilsCrossed size={16} />,
  'Menu':             <UtensilsCrossed size={16} />,
  'My Order':         <ShoppingBag size={16} />,
  'My Orders':        <ShoppingBag size={16} />,
  'Admin Dashboard':  <LayoutDashboard size={16} />,
  'Chef Portal':      <ChefHat size={16} />,
  'Dashboard':        <LayoutDashboard size={16} />,
  'Kitchen Orders':   <ChefHat size={16} />,
  'Order History':    <History size={16} />,
  'Completed Orders': <History size={16} />,
  'Tables & Orders':  <ClipboardList size={16} />,
};

const Navbar: React.FC<NavbarProps> = ({ customLinks, roleTag }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isChef  = user?.role?.toLowerCase() === 'chef';
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const fetchNotifications = React.useCallback(async () => {
    if (!isAuthenticated || !user?.token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [isAuthenticated, user?.token]);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
          <UtensilsCrossed className="logo-icon-svg" size={24} />
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
            <div className="navbar-user-welcome">
              <div className="notification-bell-container" ref={dropdownRef}>
                <button className="notification-bell-btn" onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>
                
                {showNotifications && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>Notifications</h3>
                    </div>
                    <div className="notification-list">
                      {notifications.length === 0 ? (
                        <div className="notification-empty">No new notifications</div>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <div key={n.id} className={`notification-item ${n.isRead ? '' : 'unread'}`} onClick={() => markAsRead(n.id)}>
                            <p className="notification-msg">{n.message}</p>
                            <span className="notification-time">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {!n.isRead && <Check size={12} className="mark-read-icon" />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <span className="welcome-text">Welcome, {user?.name}</span>
              <AvatarDropdown showName={false} />
            </div>
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
