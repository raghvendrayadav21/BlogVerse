import apiClient from './client';
import type { Post, Page, CreatePostRequest, ApiResponse } from '../types';

export const postsApi = {
  getFeed: async (page = 0, size = 20): Promise<ApiResponse<Page<Post>>> => {
    const res = await apiClient.get('/api/posts/feed', { params: { page, size } });
    return res.data;
  },

  getTrending: async (page = 0, size = 10): Promise<ApiResponse<Page<Post>>> => {
    const res = await apiClient.get('/api/posts/trending', { params: { page, size } });
    return res.data;
  },

  getPost: async (id: number): Promise<ApiResponse<Post>> => {
    const res = await apiClient.get(`/api/posts/${id}`);
    return res.data;
  },

  getUserPosts: async (userId: number, page = 0): Promise<ApiResponse<Page<Post>>> => {
    const res = await apiClient.get(`/api/posts/user/${userId}`, { params: { page, size: 20 } });
    return res.data;
  },

  getHashtagPosts: async (tag: string, page = 0): Promise<ApiResponse<Page<Post>>> => {
    const res = await apiClient.get(`/api/posts/hashtag/${tag}`, { params: { page, size: 20 } });
    return res.data;
  },

  getTrendingTags: async (): Promise<ApiResponse<{ id: number; name: string; postCount: number }[]>> => {
    const res = await apiClient.get('/api/posts/tags/trending');
    return res.data;
  },

  createPost: async (data: CreatePostRequest): Promise<ApiResponse<Post>> => {
    const res = await apiClient.post('/api/posts', data);
    return res.data;
  },

  updatePost: async (id: number, data: Partial<CreatePostRequest>): Promise<ApiResponse<Post>> => {
    const res = await apiClient.put(`/api/posts/${id}`, data);
    return res.data;
  },

  deletePost: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/posts/${id}`);
  },

  saveDraft: async (data: CreatePostRequest): Promise<ApiResponse<Post>> => {
    const res = await apiClient.post('/api/posts/drafts', data);
    return res.data;
  },

  getDrafts: async (): Promise<ApiResponse<Post[]>> => {
    const res = await apiClient.get('/api/posts/drafts');
    return res.data;
  },

  likePost: async (id: number): Promise<void> => {
    await apiClient.post(`/api/posts/${id}/like`);
  },

  unlikePost: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/posts/${id}/like`);
  },

  bookmarkPost: async (id: number, collectionName?: string): Promise<void> => {
    await apiClient.post(`/api/posts/${id}/bookmark`, { collectionName });
  },

  removeBookmark: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/posts/${id}/bookmark`);
  },

  sharePost: async (id: number): Promise<void> => {
    await apiClient.post(`/api/posts/${id}/share`);
  },

  reportPost: async (id: number, reason: string, description?: string): Promise<void> => {
    await apiClient.post(`/api/posts/${id}/report`, { reason, description });
  },

  getComments: async (postId: number, page = 0, size = 20): Promise<ApiResponse<Page<any>>> => {
    const res = await apiClient.get(`/api/posts/${postId}/comments`, { params: { page, size } });
    return res.data;
  },

  addComment: async (postId: number, content: string, parentCommentId?: number): Promise<ApiResponse<any>> => {
    const res = await apiClient.post(`/api/posts/${postId}/comments`, { content, parentCommentId });
    return res.data;
  },

  getUserBookmarks: async (collectionName?: string, page = 0): Promise<ApiResponse<Page<any>>> => {
    const res = await apiClient.get('/api/posts/bookmarks/user', { params: { collectionName, page, size: 20 } });
    return res.data;
  },

  getUserLikedPostIds: async (userId: number): Promise<ApiResponse<number[]>> => {
    const res = await apiClient.get(`/api/posts/user/${userId}/liked`);
    return res.data;
  },

  getPendingReports: async (page = 0): Promise<ApiResponse<Page<any>>> => {
    const res = await apiClient.get('/api/posts/reports', { params: { page, size: 20 } });
    return res.data;
  },

  resolveReport: async (reportId: number): Promise<void> => {
    await apiClient.put(`/api/posts/reports/${reportId}/resolve`);
  },

  uploadMediaFile: async (file: File, postId?: number): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (postId) formData.append('postId', postId.toString());
    const res = await apiClient.post('/api/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
