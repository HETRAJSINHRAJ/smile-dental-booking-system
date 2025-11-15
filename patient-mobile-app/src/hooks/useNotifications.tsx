import { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import notificationService from '../services/notificationService';
import { PushNotification } from '../types/notification';
import { useAuth } from '../contexts/AuthContextWithToast';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Initialize notification service
  useEffect(() => {
    if (user?.uid) {
      notificationService.initialize(user.uid);
    }

    return () => {
      // Cleanup if needed
    };
  }, [user?.uid]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const data = await notificationService.getUserNotifications(user.uid);
      setNotifications(data);
      
      const count = await notificationService.getUnreadCount(user.uid);
      setUnreadCount(count);
      await notificationService.setBadgeCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [fetchNotifications]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      await notificationService.clearAllNotifications();
      await notificationService.setBadgeCount(0);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, []);

  // Refresh on app state change
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        fetchNotifications();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    clearAll,
  };
};
