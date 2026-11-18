import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getNotifications, markAsRead as markReadService, markAllRead as markAllReadService } from '../services/notificationService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await getNotifications();
      const payload = data.data || data;
      const list = payload.notifications;
      if (!Array.isArray(list)) {
        throw new Error('Unexpected notifications response from the server');
      }
      setNotifications(list);
      setUnreadCount(payload.unreadCount ?? list.filter((notification) => !notification.isRead).length);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = async (id) => {
    const notification = notifications.find(item => item._id === id);
    if (!notification || notification.isRead) return;
    try {
      await markReadService(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  };

  const markAllRead = async () => {
    if (markingAllRead || unreadCount === 0) return;
    setMarkingAllRead(true);
    try {
      await markAllReadService();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark notifications as read');
    } finally {
      setMarkingAllRead(false);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, markingAllRead, fetchNotifications, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
