import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AvatarDropdown from './AvatarDropdown';
import { Icons } from '../icons/IconSystem';
import { formatTime } from '../../utils/dateFormatter';
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
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5 seconds
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

  const clearAllNotifications = async () => {
    if (!isAuthenticated || !user?.token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/clear`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const deleteNotification = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent marking as read when clicking delete
    if (!isAuthenticated || !user?.token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo */}
        <Link to="/" className="logo-link">
          <Icons.utensilsCrossed className="logo-icon-svg" size={24} />
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
              
              <div className="notification-bell-container" ref={dropdownRef}>
                <button className="notification-bell-btn" onClick={() => setShowNotifications(!showNotifications)}>
                  <Icons.bell size={20} />
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>
                
                {showNotifications && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>Notifications</h3>
                      {notifications.length > 0 && (
                        <button className="clear-all-btn" onClick={clearAllNotifications}>
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="notification-list">
                      {notifications.length === 0 ? (
                        <div className="notification-empty">No new notifications</div>
                      ) : (
                        notifications.slice(0, 10).map(n => (
                          <div key={n.id} className={`notification-item ${n.isRead ? '' : 'unread'}`} onClick={() => markAsRead(n.id)}>
                            <div className="notification-content">
                              <p className="notification-msg">{n.message}</p>
                              <span className="notification-time">
                                {formatTime(n.createdAt)}
                              </span>
                            </div>
                            <div className="notification-actions">
                              {!n.isRead && <Icons.check size={14} className="mark-read-icon" />}
                              <button 
                                className="notification-close-btn" 
                                onClick={(e) => deleteNotification(e, n.id)}
                                title="Dismiss"
                              >
                                <Icons.close size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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
