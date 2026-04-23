import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@context/AuthContext';
import { Icons } from '../icons/IconSystem';
import { formatTime } from '@utils/dateFormatter';
import { createPortal } from 'react-dom';
import api from '@utils/api';
import '../../App.css';

const NotificationPanel: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Part 2D: Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      const res = await api.get('/notifications', { 
        signal: abortControllerRef.current.signal 
      });
      
      if (mountedRef.current) {
        setNotifications(res.data);
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      console.error('Fetch error:', err);
    }
  }, []);

  // Part 2G: Initial load
  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer') {
      fetchNotifications();
    }
  }, [isAuthenticated, user?.role, fetchNotifications]);

  // Part 2F: Polling fallback (60s) - Silent only
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') return;
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.role, fetchNotifications]);

  // Part 2E: UI Sync Listener (Listening for CustomerLayout's signals)
  useEffect(() => {
    const handleSync = (event: any) => {
      console.log("[UI Sync] Registered Layout Signal:", event.detail);
      // Trigger data refresh to update the bell dot/list
      fetchNotifications();
    };

    window.addEventListener('smartdine:notification', handleSync);
    return () => window.removeEventListener('smartdine:notification', handleSync);
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
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const clearAllNotifications = async () => {
    if (!isAuthenticated) return;
    setNotifications([]);
    try {
      await api.delete('/notifications/clear');
    } catch (err) {
      console.error('Error clearing notifications:', err);
      fetchNotifications();
    }
  };

  const deleteNotification = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await api.delete(`/notifications/${id}`);
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
        <Icons.bell color="#ffffff" size={17} strokeWidth={1.5} />
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
