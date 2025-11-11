'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useToastStore } from '@/lib/store/toast';

export interface RealtimeNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  status: 'unread' | 'read';
  createdAt: string;
  metadata?: Record<string, any>;
}

interface UseRealtimeNotificationsOptions {
  showToast?: boolean;
  onNotification?: (notification: RealtimeNotification) => void;
  autoMarkAsRead?: boolean;
}

export function useRealtimeNotifications(
  options: UseRealtimeNotificationsOptions = {}
) {
  const { showToast = true, onNotification, autoMarkAsRead = false } = options;
  const { success, error, warning, info } = useToastStore();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { socket, isConnected, emit } = useWebSocket({
    namespace: '/notifications',
    autoConnect: true,
  });

  // Handle incoming notifications
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: RealtimeNotification) => {
      setNotifications((prev) => [notification, ...prev]);
      
      if (notification.status === 'unread') {
        setUnreadCount((prev) => prev + 1);
      }

      // Show toast notification
      if (showToast) {
        const toastMessage = notification.message || notification.title;
        switch (notification.type) {
          case 'success':
            success(toastMessage, { title: notification.title });
            break;
          case 'error':
            error(toastMessage, { title: notification.title });
            break;
          case 'warning':
            warning(toastMessage, { title: notification.title });
            break;
          default:
            info(toastMessage, { title: notification.title });
        }
      }

      // Auto mark as read if enabled
      if (autoMarkAsRead && notification.status === 'unread') {
        markAsRead(notification.id);
      }

      onNotification?.(notification);
    };

    const handleNotifications = (notificationsList: RealtimeNotification[]) => {
      setNotifications(notificationsList);
      const unread = notificationsList.filter((n) => n.status === 'unread').length;
      setUnreadCount(unread);
    };

    socket.on('notification', handleNotification);
    socket.on('notifications', handleNotifications);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('notifications', handleNotifications);
    };
  }, [socket, showToast, autoMarkAsRead, onNotification, success, error, warning, info]);

  // Request notifications on connect
  useEffect(() => {
    if (isConnected && socket) {
      emit('getNotifications');
    }
  }, [isConnected, socket, emit]);

  const markAsRead = useCallback((notificationId: number) => {
    emit('markAsRead', { notificationId });
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, status: 'read' as const } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, [emit]);

  const markAllAsRead = useCallback(() => {
    emit('markAllAsRead');
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: 'read' as const }))
    );
    setUnreadCount(0);
  }, [emit]);

  const removeNotification = useCallback((notificationId: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification?.status === 'unread') {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refresh: () => emit('getNotifications'),
  };
}

