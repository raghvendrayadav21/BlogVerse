// ─── User Types ────────────────────────────────────────────────────
export interface User {
  id?: number;
  userId: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  profileImageUrl?: string;
  bio?: string;
  website?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface AuthResponse {
  userId: number;
  username: string;
  email: string;
  role: string;
  profileImageUrl?: string;
  bio?: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresIn: number;
  issuedAt: string;
}

// ─── Post Types ─────────────────────────────────────────────────────
export type PostType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'MIXED' | 'BLOG';
export type PostVisibility = 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE';

export interface Post {
  id: number;
  userId: number;
  username: string;
  userProfileImage?: string;
  title?: string;
  content: string;
  postType: PostType;
  visibility: PostVisibility;
  readingTimeMinutes?: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  trendingScore?: number;
  hashtags?: string[];
  mentions?: string[];
  mediaList?: Media[];
  coverImageUrl?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isFollowingAuthor?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Media {
  id: number;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  s3Key?: string;
  fileSize?: number;
}

export interface CreatePostRequest {
  title?: string;
  content: string;
  postType: PostType;
  visibility: PostVisibility;
  hashtags?: string[];
  mentions?: string[];
  mediaIds?: number[];
  coverImageUrl?: string;
}

// ─── Comment Types ──────────────────────────────────────────────────
export interface Comment {
  id: number;
  postId: number;
  userId: number;
  username: string;
  userProfileImage?: string;
  content: string;
  parentCommentId?: number;
  replies?: Comment[];
  likeCount?: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Notification Types ─────────────────────────────────────────────
export type NotificationType = 'LIKE' | 'COMMENT' | 'REPLY' | 'FOLLOW' | 'SHARE' | 'MENTION';

export interface Notification {
  id: number;
  recipientId: number;
  senderId: number;
  senderUsername: string;
  senderProfileImage?: string;
  type: NotificationType;
  postId?: number;
  commentId?: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Pagination Types ───────────────────────────────────────────────
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ─── API Response Types ─────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

// ─── Bookmark Types ─────────────────────────────────────────────────
export interface Bookmark {
  id: number;
  postId: number;
  post: Post;
  collectionName?: string;
  createdAt: string;
}

// ─── Search Types ───────────────────────────────────────────────────
export interface SearchResult {
  posts: Post[];
  users: User[];
  hashtags: string[];
}

// ─── Theme ──────────────────────────────────────────────────────────
export type Theme = 'dark' | 'light';
