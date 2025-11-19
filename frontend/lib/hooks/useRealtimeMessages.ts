'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { messageApi, Message } from '@/lib/api/message';
import { useTenantId } from './useTenant';
import { useQueryClient } from '@tanstack/react-query';

interface UseRealtimeMessagesOptions {
  onNewMessage?: (message: Message) => void;
  onMessageRead?: (data: { messageId: number; readBy: number }) => void;
  onMessageDeleted?: (messageId: number) => void;
  onMessageArchived?: (messageId: number) => void;
  playSound?: boolean;
  showNotification?: boolean;
}

export function useRealtimeMessages(options: UseRealtimeMessagesOptions = {}) {
  const {
    onNewMessage,
    onMessageRead,
    onMessageDeleted,
    onMessageArchived,
    playSound = true,
    showNotification = true,
  } = options;

  const tenantId = useTenantId();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const { socket, isConnected: socketConnected, emit } = useWebSocket({
    namespace: '/messages',
    autoConnect: true,
  });

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (playSound && typeof window !== 'undefined') {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Fallback: use Web Audio API if file doesn't exist
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        });
      } catch (error) {
        console.warn('Could not play notification sound:', error);
      }
    }
  }, [playSound]);

  // Show browser notification
  const showBrowserNotification = useCallback((message: Message) => {
    if (showNotification && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`Pesan Baru dari ${message.sender_name}`, {
          body: message.subject,
          icon: '/favicon.ico',
          tag: `message-${message.id}`,
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(`Pesan Baru dari ${message.sender_name}`, {
              body: message.subject,
              icon: '/favicon.ico',
              tag: `message-${message.id}`,
            });
          }
        });
      }
    }
  }, [showNotification]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!tenantId) return;
    try {
      const count = await messageApi.getUnreadCount(tenantId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [tenantId]);

  // Handle new message
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      // Play sound
      playNotificationSound();
      
      // Show browser notification
      showBrowserNotification(message);
      
      // Invalidate queries to refresh message list
      queryClient.invalidateQueries({ queryKey: ['messages', tenantId] });
      
      // Update unread count
      setUnreadCount((prev) => prev + 1);
      
      // Call custom handler
      onNewMessage?.(message);
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, tenantId, queryClient, onNewMessage, playNotificationSound, showBrowserNotification]);

  // Handle message read
  useEffect(() => {
    if (!socket) return;

    const handleMessageRead = (data: { messageId: number; readBy: number }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', tenantId] });
      onMessageRead?.(data);
    };

    socket.on('messageRead', handleMessageRead);

    return () => {
      socket.off('messageRead', handleMessageRead);
    };
  }, [socket, tenantId, queryClient, onMessageRead]);

  // Handle message deleted
  useEffect(() => {
    if (!socket) return;

    const handleMessageDeleted = (data: { messageId: number }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', tenantId] });
      fetchUnreadCount();
      onMessageDeleted?.(data.messageId);
    };

    socket.on('messageDeleted', handleMessageDeleted);

    return () => {
      socket.off('messageDeleted', handleMessageDeleted);
    };
  }, [socket, tenantId, queryClient, fetchUnreadCount, onMessageDeleted]);

  // Handle message archived
  useEffect(() => {
    if (!socket) return;

    const handleMessageArchived = (data: { messageId: number }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', tenantId] });
      onMessageArchived?.(data.messageId);
    };

    socket.on('messageArchived', handleMessageArchived);

    return () => {
      socket.off('messageArchived', handleMessageArchived);
    };
  }, [socket, tenantId, queryClient, onMessageArchived]);

  // Handle unread count update
  useEffect(() => {
    if (!socket) return;

    const handleUnreadCount = (data: { count: number }) => {
      setUnreadCount(data.count);
    };

    socket.on('unreadCount', handleUnreadCount);

    // Request unread count on connection
    if (socketConnected) {
      fetchUnreadCount();
    }

    return () => {
      socket.off('unreadCount', handleUnreadCount);
    };
  }, [socket, socketConnected, fetchUnreadCount]);

  // Fetch unread count on mount and when tenant changes
  useEffect(() => {
    if (tenantId && socketConnected) {
      fetchUnreadCount();
    }
  }, [tenantId, socketConnected, fetchUnreadCount]);

  // Update connection status
  useEffect(() => {
    setIsConnected(socketConnected);
  }, [socketConnected]);

  return {
    unreadCount,
    isConnected,
    socket,
    emit,
    refreshUnreadCount: fetchUnreadCount,
  };
}

