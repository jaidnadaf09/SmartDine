import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@context/AuthContext';
import { Icons } from '../icons/IconSystem';
import { formatTime } from '@utils/dateFormatter';
import { createPortal } from 'react-dom';
import { playNotificationSound } from '@utils/notificationSound';
import api from '@utils/api';
import socket from '@socket/socketClient';
import '../../App.css';

const NotificationPanel: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const seenNotificationIds = useRef<Set<number>>(new Set());
  const isInitialFetch = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    if (document.hidden) return; // skip polling when tab is hidden
    try {
      const res = await api.get('/notifications');
      const newNotifications: any[] = res.data;
      const incomingIds = newNotifications.map((n: any) => n.id);

      if (!isInitialFetch.current) {
        const hasRealNewNotification = incomingIds.some(
          (id) => !seenNotificationIds.current.has(id)
        );
        if (hasRealNewNotification) {
          playNotificationSound();
        }
      }

      // Accumulate all seen IDs so future polls compare against full history
      incomingIds.forEach((id) => seenNotificationIds.current.add(id));

      setNotifications(newNotifications);
      isInitialFetch.current = false;
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [isAuthenticated]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchNotifications();
    if (intervalRef.current) return; // prevent stacking
    intervalRef.current = setInterval(fetchNotifications, 15000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchNotifications]);

  // Real-time: listen for push notifications via WebSocket
  useEffect(() => {
    const handleNewNotification = (notification: any) => {
      setNotifications(prev => {
        // Deduplicate — don't add if already present
        if (prev.some(n => n.id === notification.id)) return prev;
        seenNotificationIds.current.add(notification.id);
        playNotificationSound();
        return [notification, ...prev];
      });
    };

    socket.on('notification:new', handleNewNotification);
    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, []);

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
