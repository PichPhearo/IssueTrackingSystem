import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../api/notifications';

const NotificationContext = createContext();

const POLL_INTERVAL = 20000; // 20 seconds

export function NotificationProvider({ children }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!token || !user) return;
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    if (!silent) setLoading(true);

    try {
      const response = await getNotifications();
      const items = response.data?.data || [];
      const count = response.data?.unread_count ?? items.filter((n) => !n.read_at).length;

      setNotifications(items);
      setUnreadCount(count);
    } catch {
      // Silently catch polling network errors
    } finally {
      if (!silent) setLoading(false);
      isFetchingRef.current = false;
    }
  }, [token, user]);

  // Initial fetch and interval polling
  useEffect(() => {
    if (!token || !user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications(false);

    const intervalId = setInterval(() => {
      fetchNotifications(true);
    }, POLL_INTERVAL);

    return () => clearInterval(intervalId);
  }, [token, user, fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, is_read: true, read_at: n.read_at || new Date().toISOString() }
          : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const res = await markNotificationAsRead(id);
      if (res.data?.unread_count !== undefined) {
        setUnreadCount(res.data.unread_count);
      }
    } catch {
      // Re-sync on failure
      fetchNotifications(true);
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at || now }))
    );
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
    } catch {
      // Re-sync on failure
      fetchNotifications(true);
    }
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
