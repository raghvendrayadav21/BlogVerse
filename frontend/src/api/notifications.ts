import apiClient from './client';
import type { ApiResponse, Page } from '../types';

export interface NotificationItem {
  id: number;
  recipientId: number;
  senderId: number;
  senderUsername: string;
  senderProfileImage?: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SHARE' | 'SYSTEM';
  message: string;
  targetPostId?: number;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getNotifications: async (page = 0, size = 20): Promise<ApiResponse<Page<NotificationItem>>> => {
    const res = await apiClient.get('/api/notifications', { params: { page, size } });
    return res.data;
  },

  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    const res = await apiClient.get('/api/notifications/unread-count');
    return res.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/api/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/api/notifications/read-all');
  },

  createNotification: async (data: {
    recipientId: number;
    type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SHARE' | 'SYSTEM';
    message: string;
    postId?: number;
  }): Promise<ApiResponse<NotificationItem>> => {
    const res = await apiClient.post('/api/notifications', data);
    return res.data;
  },
};
