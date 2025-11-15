'use client';

import { useEffect, useState } from 'react';
import { notificationApi } from '@/lib/api/notification';
import { messageApi } from '@/lib/api/message';
import apiClient from '@/lib/api/client';

interface NotificationCounts {
  notifications: number;
  messages: number;
  announcements: number; // Placeholder, announcements biasanya tidak punya unread status
}

export function useStudentNotifications(tenantId: string | null) {
  const [counts, setCounts] = useState<NotificationCounts>({
    notifications: 0,
    messages: 0,
    announcements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = async () => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Try to get tenantId as number from NPSN
      // First, try to use the tenantId directly if it's a number
      const tenantIdNum = /^\d+$/.test(tenantId) ? parseInt(tenantId, 10) : null;
      
      // Fetch unread notifications
      let notificationsCount = 0;
      if (tenantIdNum) {
        try {
          const notificationsResponse = await notificationApi.getUnread(tenantIdNum);
          notificationsCount = notificationsResponse.total || notificationsResponse.data?.length || 0;
        } catch (err) {
          console.warn('Failed to fetch notifications:', err);
          // Continue with 0 count
        }
      } else {
        // If tenantId is NPSN (string), try using mobile API endpoint
        try {
          const response = await apiClient.get('/mobile/notifications/unread', {
            headers: {
              'X-Tenant-NPSN': tenantId,
            },
          });
          if (response.data?.success) {
            notificationsCount = response.data.total || response.data.data?.length || 0;
          }
        } catch (err) {
          console.warn('Failed to fetch notifications via mobile API:', err);
        }
      }

      // Fetch unread messages from inbox
      let messagesCount = 0;
      if (tenantIdNum) {
        try {
          const messagesResponse = await messageApi.getInbox(tenantIdNum);
          if (messagesResponse.data) {
            messagesCount = messagesResponse.data.filter((msg: any) => msg.status === 'unread').length;
          }
        } catch (err) {
          console.warn('Failed to fetch messages:', err);
          // Continue with 0 count
        }
      } else {
        // If tenantId is NPSN (string), try using mobile API endpoint
        try {
          const response = await apiClient.get('/mobile/messages/inbox', {
            headers: {
              'X-Tenant-NPSN': tenantId,
            },
          });
          if (response.data?.success && response.data.data) {
            messagesCount = response.data.data.filter((msg: any) => msg.status === 'unread').length;
          }
        } catch (err) {
          console.warn('Failed to fetch messages via mobile API:', err);
        }
      }

      // For announcements, we'll check if there are new announcements
      // Since announcements don't have read/unread status, we'll use a simple approach:
      // Check if there are announcements created in the last 7 days
      let announcementsCount = 0;
      try {
        const dashboardResponse = await apiClient.get('/mobile/dashboard', {
          headers: {
            'X-Tenant-NPSN': tenantId,
          },
        });
        
        if (dashboardResponse.data?.success && dashboardResponse.data?.data?.announcements) {
          const announcements = dashboardResponse.data.data.announcements;
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          // Count announcements from last 7 days as "new"
          announcementsCount = announcements.filter((announcement: any) => {
            const announcementDate = new Date(announcement.created_at);
            return announcementDate >= sevenDaysAgo;
          }).length;
        }
      } catch (err) {
        console.warn('Failed to fetch announcements:', err);
        // Continue with 0 count
      }

      setCounts({
        notifications: notificationsCount,
        messages: messagesCount,
        announcements: announcementsCount,
      });
    } catch (err: any) {
      console.error('Error fetching notification counts:', err);
      setError(err.message || 'Gagal memuat jumlah notifikasi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantId) return;
    
    fetchCounts();
    
    // Poll every 30 seconds for updates
    const interval = setInterval(() => {
      fetchCounts();
    }, 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  return {
    counts,
    loading,
    error,
    refresh: fetchCounts,
  };
}

