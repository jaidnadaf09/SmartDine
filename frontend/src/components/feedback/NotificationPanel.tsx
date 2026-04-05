import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@context/AuthContext';
import { Icons } from '../icons/IconSystem';
import { formatTime } from '@utils/dateFormatter';
import { createPortal } from 'react-dom';
import '../../App.css';

const NotificationPanel: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  const fetchNotifications = useCallback(async () => {
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

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 10,
        right: window.innerWidth - rect.right
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition]);

  // Recalculate position whenever it opens
  useEffect(() => {
    if (showNotifications) {
      updatePosition();
    }
  }, [showNotifications, updatePosition]);

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
    
    // Optimistic UI update: Clear immediately
    setNotifications([]);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/clear`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!res.ok) {
        console.error('Failed to clear notifications on server');
        // Optionally re-fetch to restore state if failed
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
      fetchNotifications();
    }
  };

  const deleteNotification = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!isAuthenticated || !user?.token) return;

    // Optimistic UI update: Remove from list immediately
    setNotifications(prev => prev.filter(n => n.id !== id));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!res.ok) {
        console.error('Failed to delete notification on server');
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isAuthenticated) return null;

  return (
    <div className="notification-bell-container">
      <button 
        ref={triggerRef}
        className="sd-icon-btn sd-notification-btn" 
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Icons.bell className="sd-bell-icon" size={18} strokeWidth={1.8} />
        {unreadCount > 0 && <span className="sd-notification-dot"></span>}
      </button>
      
      {showNotifications && createPortal(
        <div 
          className="notification-dropdown"
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
            zIndex: 'var(--z-dropdown, 1100)'
          }}
        >
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button className="clear-all-btn" onClick={clearAllNotifications}>
                Clear All
              </button>
            )}
          </div>
          <div className="notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotificationPanel;
