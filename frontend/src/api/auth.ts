import apiClient from './client';
import type { AuthResponse, ApiResponse } from '../types';

export const authApi = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    bio?: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post('/api/auth/register', data);
    return res.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post('/api/auth/login', data);
    return res.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/api/auth/logout', { refreshToken });
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post('/api/auth/refresh', { refreshToken });
    return res.data;
  },

  googleLogin: async (data?: {
    email?: string;
    name?: string;
    username?: string;
    googleId?: string;
    picture?: string | null;
  }): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post('/api/auth/google', data || {});
    return res.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> => {
    const res = await apiClient.post('/api/auth/change-password', data);
    return res.data;
  },
};
