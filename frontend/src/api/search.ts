import apiClient from './client';
import type { ApiResponse, Post, User } from '../types';

export interface SearchResult {
  posts: Post[];
  users: User[];
  hashtags: { tag: string; count: number }[];
}

export const searchApi = {
  globalSearch: async (q: string): Promise<ApiResponse<SearchResult>> => {
    const res = await apiClient.get('/api/search', { params: { q } });
    return res.data;
  },
};
