import apiClient from './client';
import type { User, Page, ApiResponse } from '../types';

export const usersApi = {
  getProfile: async (userId: number): Promise<ApiResponse<User>> => {
    const res = await apiClient.get(`/api/users/${userId}`);
    return res.data;
  },

  getMyProfile: async (): Promise<ApiResponse<User>> => {
    const res = await apiClient.get('/api/users/me');
    return res.data;
  },

  updateProfile: async (userId: number, data: {
    bio?: string;
    website?: string;
    username?: string;
  }): Promise<ApiResponse<User>> => {
    const res = await apiClient.put(`/api/users/${userId}`, data);
    return res.data;
  },

  updateAvatar: async (file: File): Promise<ApiResponse<{ profileImageUrl: string }>> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.put('/api/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  followUser: async (userId: number): Promise<void> => {
    await apiClient.post(`/api/users/${userId}/follow`);
  },

  unfollowUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/api/users/${userId}/follow`);
  },

  getFollowers: async (userId: number, page = 0): Promise<ApiResponse<Page<User>>> => {
    const res = await apiClient.get(`/api/users/${userId}/followers`, { params: { page, size: 20 } });
    return res.data;
  },

  getFollowing: async (userId: number, page = 0): Promise<ApiResponse<Page<User>>> => {
    const res = await apiClient.get(`/api/users/${userId}/following`, { params: { page, size: 20 } });
    return res.data;
  },

  getSuggestedUsers: async (): Promise<ApiResponse<User[]>> => {
    const res = await apiClient.get('/api/users/suggestions');
    return res.data;
  },

  getAdminMetrics: async (): Promise<ApiResponse<{ totalUsers: number; publishedPosts: number; totalInteractions: number; pendingReports: number }>> => {
    const res = await apiClient.get('/api/users/admin/metrics');
    return res.data;
  },
};
