import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AvatarDropdown from './AvatarDropdown';
import { Icons } from '../icons/IconSystem';
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
          <nav className="nav-buttons">
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
            <div className="navbar-user-welcome">
              <div className="notification-bell-container" ref={dropdownRef}>
                <button className="notification-bell-btn" onClick={() => setShowNotifications(!showNotifications)}>
                  <Icons.bell size={20} />
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
                            {!n.isRead && <Icons.check size={12} className="mark-read-icon" />}
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
