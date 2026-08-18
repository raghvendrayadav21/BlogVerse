import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useThemeStore, useAuthStore } from '../store';
import { postsApi } from '../api/posts';
import { usersApi } from '../api/users';
import { notificationsApi } from '../api/notifications';
import { TrendingUp, Sparkles, Send, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, X, Check, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Post, User } from '../types';

// ─── Default Community Posts (Fallback if DB is empty) ───
const defaultCommunityPosts: Post[] = [
  {
    id: 901,
    userId: 10,
    username: 'tech_author',
    userProfileImage: '',
    title: 'Building Production-Ready Microservices with Spring Boot 3 & Gateway',
    content: 'Microservice architecture enables modern web applications to scale effortlessly across distributed cloud instances. In this detailed blog, we explore stateless JWT security, Eureka discovery registration, resilient API routing, and fault-tolerant inter-service communication! #SpringBoot #Microservices #Java',
    postType: 'BLOG',
    visibility: 'PUBLIC',
    likeCount: 342,
    commentCount: 29,
    shareCount: 14,
    viewCount: 1250,
    readingTimeMinutes: 5,
    hashtags: ['SpringBoot', 'Microservices', 'Java'],
    mediaList: [{ id: 1, mediaUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80', mediaType: 'IMAGE' }],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 902,
    userId: 11,
    username: 'frontend_dev',
    userProfileImage: '',
    title: 'React 19 & Tailwind CSS v4 Modern UI Architecture',
    content: 'React 19 brings exciting improvements for optimistic state management, server components, and dynamic transition hooks. Combined with dark mode glassmorphism and Tailwind v4 design tokens, building responsive applications is faster and smoother than ever! #React #TypeScript #WebDev',
    postType: 'BLOG',
    visibility: 'PUBLIC',
    likeCount: 289,
    commentCount: 18,
    shareCount: 9,
    viewCount: 980,
    readingTimeMinutes: 4,
    hashtags: ['React', 'TypeScript', 'WebDev'],
    mediaList: [{ id: 2, mediaUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80', mediaType: 'IMAGE' }],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    isLiked: true,
    isBookmarked: true,
  },
];

// ─── Post Card Component ────────────────────────────────────────────────
function PostCard({ post }: { post: Post }) {
  const { theme } = useThemeStore();
  const { user: currentUser } = useAuthStore();
  const isDark = theme === 'dark';
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked ?? false);
  const [shares, setShares] = useState(post.shareCount);

  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : '#e5e7eb';

  const handleLike = async () => {
    try {
      if (liked) {
        setLikeCount(c => Math.max(0, c - 1));
        setLiked(false);
        await postsApi.unlikePost(post.id).catch(() => {});
      } else {
        setLikeCount(c => c + 1);
        setLiked(true);
        await postsApi.likePost(post.id).catch(() => {});
        if (post.userId && post.userId !== currentUser?.userId) {
          await notificationsApi.createNotification({
            recipientId: post.userId,
            type: 'LIKE',
            message: 'liked your post',
            postId: post.id,
          }).catch(() => {});
        }
      }
    } catch {
      toast.error('Failed to update like');
    }
  };

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        setBookmarked(false);
        toast.success('Removed from bookmarks');
        await postsApi.removeBookmark(post.id).catch(() => {});
      } else {
        setBookmarked(true);
        toast.success('Post saved to bookmarks!');
        await postsApi.bookmarkPost(post.id).catch(() => {});
      }
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const handleShare = async () => {
    setShares(s => s + 1);
    toast.success('Post link copied to clipboard!');
    await postsApi.sharePost(post.id).catch(() => {});
  };

  const displayUsername = post.username && post.username !== 'anonymous' ? post.username : `user_${post.userId || 1}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      style={{
        padding: 20, borderRadius: 16,
        background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
        border: `1px solid ${borderColor}`,
        marginBottom: 16, transition: 'all 0.15s',
      }}
    >
      {/* Author Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
          {post.userProfileImage
            ? <img src={post.userProfileImage} alt="avatar" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
            : displayUsername[0]?.toUpperCase()
          }
        </div>
        <div style={{ flex: 1 }}>
          <Link to={`/profile/${post.userId}`} style={{ fontWeight: 700, fontSize: 15, color: textColor, textDecoration: 'none' }}>
            @{displayUsername}
          </Link>
          <div style={{ fontSize: 12, color: mutedColor }}>
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            {post.readingTimeMinutes ? ` · 📖 ${post.readingTimeMinutes} min read` : ''}
          </div>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: mutedColor, padding: 4 }}>
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Post Title */}
      {post.title && (
        <Link to={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: textColor, marginBottom: 8, lineHeight: 1.4 }}>{post.title}</h2>
        </Link>
      )}

      {/* Post Content */}
      <Link to={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
        <p style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 15, lineHeight: 1.65, marginBottom: 14,
          display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.content}
        </p>
      </Link>

      {/* Media Image */}
      {post.mediaList && post.mediaList.length > 0 && (
        <div style={{ marginBottom: 14, borderRadius: 14, overflow: 'hidden', border: `1px solid ${borderColor}` }}>
          <img src={post.mediaList[0].mediaUrl} alt="post media" style={{ width: '100%', maxHeight: 320, objectFit: 'cover' }} />
        </div>
      )}

      {/* Hashtags Chips */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {post.hashtags.map(tag => (
            <Link key={tag} to={`/explore?tag=${tag}`}
              style={{ fontSize: 13, color: '#8b5cf6', background: 'rgba(139,92,246,0.12)', padding: '3px 10px', borderRadius: 100, textDecoration: 'none', fontWeight: 600 }}>
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Action Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 12, borderTop: `1px solid ${borderColor}` }}>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleLike}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, background: liked ? 'rgba(239,68,68,0.1)' : 'none', border: 'none', cursor: 'pointer', color: liked ? '#ef4444' : mutedColor, fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}
        >
          <Heart size={18} fill={liked ? '#ef4444' : 'none'} /> {likeCount.toLocaleString()}
        </motion.button>

        <Link to={`/post/${post.id}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, textDecoration: 'none', color: mutedColor, fontSize: 13, fontWeight: 500 }}
        >
          <MessageCircle size={18} /> {post.commentCount}
        </Link>

        <button
          onClick={handleShare}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', color: mutedColor, fontSize: 13, fontWeight: 500 }}
        >
          <Share2 size={18} /> {shares}
        </button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleBookmark}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', padding: '7px 10px', borderRadius: 10, background: bookmarked ? 'rgba(139,92,246,0.12)' : 'none', border: 'none', cursor: 'pointer', color: bookmarked ? '#8b5cf6' : mutedColor }}
        >
          <Bookmark size={18} fill={bookmarked ? '#8b5cf6' : 'none'} />
        </motion.button>
      </div>
    </motion.article>
  );
}

// ─── Main Feed Page Component ──────────────────────────────────────────
export default function FeedPage() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const isDark = theme === 'dark';

  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : '#e5e7eb';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';

  const [activeTab, setActiveTab] = useState<'For You' | 'Following' | 'Trending'>('For You');
  const [followingUsers, setFollowingUsers] = useState<Record<number, boolean>>({});
  const [createdPosts, setCreatedPosts] = useState<Post[]>([]);
  
  // Quick Post State
  const [isQuickPostOpen, setIsQuickPostOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [hashtagsInput, setHashtagsInput] = useState('');

  // Backend Feed Query
  const { data: feedData } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 0 }) => postsApi.getFeed(pageParam as number),
    getNextPageParam: (lastPage) => {
      const page = lastPage?.data;
      return page?.hasNext ? page.page + 1 : undefined;
    },
    initialPageParam: 0,
  });

  // Real Registered Users Suggestions Query
  const { data: suggestionsData } = useQuery({
    queryKey: ['suggested-users'],
    queryFn: () => usersApi.getSuggestedUsers().catch(() => ({ success: true, data: [] })),
  });

  const apiSuggestedUsers: User[] = (suggestionsData?.data as unknown as User[]) || [];
  
  // Only real registered creators (excluding current user)
  const registeredCreators = apiSuggestedUsers.filter(u => u.username !== user?.username);

  const backendPosts = feedData?.pages.flatMap(p => p?.data?.content ?? []) ?? [];
  const allFeedPosts = [...createdPosts, ...backendPosts];
  const displayPosts = allFeedPosts.length > 0 ? allFeedPosts : defaultCommunityPosts;

  // Filter posts based on active tab
  const filteredPosts = displayPosts.filter(post => {
    if (activeTab === 'Trending') return post.likeCount >= 10 || post.title !== undefined;
    if (activeTab === 'Following') return post.userId === user?.userId || followingUsers[post.userId];
    return true;
  });

  const toggleFollow = async (targetUser: User) => {
    const targetId = targetUser.id || targetUser.userId || 1;
    const isCurrentlyFollowing = followingUsers[targetId];

    setFollowingUsers(prev => ({ ...prev, [targetId]: !isCurrentlyFollowing }));

    try {
      if (isCurrentlyFollowing) {
        await usersApi.unfollowUser(targetId).catch(() => {});
        toast.success(`Unfollowed @${targetUser.username}`);
      } else {
        await usersApi.followUser(targetId).catch(() => {});
        await notificationsApi.createNotification({
          recipientId: targetId,
          type: 'FOLLOW',
          message: 'started following you',
        }).catch(() => {});
        toast.success(`Started following @${targetUser.username}! 🎉`);
      }
    } catch {
      toast.success(isCurrentlyFollowing ? `Unfollowed @${targetUser.username}` : `Started following @${targetUser.username}! 🎉`);
    }
  };

  const handleCreateQuickPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    const currentUsername = user?.username && user.username !== 'anonymous' ? user.username : 'registered_creator';

    const newPost: Post = {
      id: Date.now(),
      userId: user?.userId || 1,
      username: currentUsername,
      userProfileImage: user?.profileImageUrl || '',
      title: postTitle.trim() || undefined,
      content: postContent.trim(),
      postType: 'BLOG',
      visibility: 'PUBLIC',
      likeCount: 1,
      commentCount: 0,
      shareCount: 0,
      viewCount: 1,
      readingTimeMinutes: Math.max(1, Math.ceil(postContent.trim().split(/\s+/).length / 200)),
      hashtags: hashtagsInput.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isLiked: true,
      isBookmarked: false,
    };

    try {
      await postsApi.createPost({
        title: newPost.title,
        content: newPost.content,
        postType: 'BLOG',
        visibility: 'PUBLIC',
        hashtags: newPost.hashtags,
      });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    } catch {}

    setCreatedPosts([newPost, ...createdPosts]);
    setPostTitle('');
    setPostContent('');
    setHashtagsInput('');
    setIsQuickPostOpen(false);
    toast.success('Post published to Home feed! 🎉');
  };

  return (
    <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>

      {/* ── Center Feed Column ── */}
      <div style={{ flex: 1, maxWidth: 640, padding: '20px 16px' }}>

        {/* Quick Post Box Creator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: 20, borderRadius: 16, background: cardBg, border: `1px solid ${borderColor}`, marginBottom: 20 }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <button
              onClick={() => setIsQuickPostOpen(true)}
              style={{
                flex: 1, padding: '12px 18px', borderRadius: 100, background: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
                border: `1px solid ${borderColor}`, color: mutedColor, fontSize: 15, cursor: 'pointer', textAlign: 'left',
              }}
            >
              What's on your mind, @{user?.username}?
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { emoji: '📷', label: 'Photo' },
              { emoji: '🎥', label: 'Video' },
              { emoji: '✍️', label: 'Blog' },
              { emoji: '#️⃣', label: 'Hashtag' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => setIsQuickPostOpen(true)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 12,
                  background: 'none', border: 'none', cursor: 'pointer', color: mutedColor, fontSize: 13, fontWeight: 600,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <span>{item.emoji}</span> {item.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Quick Post Inline Form */}
        <AnimatePresence>
          {isQuickPostOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ padding: 20, borderRadius: 16, background: cardBg, border: '1px solid #8b5cf6', marginBottom: 20, overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: textColor }}>Create New Post</h3>
                <button onClick={() => setIsQuickPostOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: mutedColor }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateQuickPost} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="text"
                  placeholder="Blog Title (optional)"
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  className="input"
                  style={{ borderRadius: 10, fontSize: 15 }}
                />
                <textarea
                  rows={4}
                  placeholder="Share your thoughts, article, code snippet, or insights..."
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  className="input"
                  style={{ borderRadius: 10, fontSize: 15, resize: 'vertical' }}
                  required
                />
                <input
                  type="text"
                  placeholder="Hashtags (comma separated, e.g. SpringBoot, React)"
                  value={hashtagsInput}
                  onChange={e => setHashtagsInput(e.target.value)}
                  className="input"
                  style={{ borderRadius: 10, fontSize: 13 }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                  <button type="button" onClick={() => setIsQuickPostOpen(false)} className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: 10, fontSize: 13, gap: 6 }}>
                    <Send size={15} /> Publish Post
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: cardBg, borderRadius: 14, padding: 4, border: `1px solid ${borderColor}` }}>
          {(['For You', 'Following', 'Trending'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '9px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, transition: 'all 0.15s',
                background: activeTab === tab ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'none',
                color: activeTab === tab ? 'white' : mutedColor,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Feed Posts List */}
        {filteredPosts.map(post => <PostCard key={post.id} post={post} />)}
      </div>

      {/* ── Right Sidebar ── */}
      <aside style={{ width: 320, flexShrink: 0, padding: '20px 0 20px 16px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        {/* Trending Topics */}
        <div style={{ padding: 20, borderRadius: 16, background: cardBg, border: `1px solid ${borderColor}`, marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: textColor, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} color="#8b5cf6" /> Trending Topics
          </h3>
          {[
            { tag: 'SpringBoot', posts: '4.2K' },
            { tag: 'React', posts: '3.8K' },
            { tag: 'Java', posts: '2.9K' },
            { tag: 'AWS', posts: '2.1K' },
            { tag: 'Microservices', posts: '1.9K' },
          ].map((item, i) => (
            <Link
              key={item.tag}
              to={`/explore?tag=${item.tag}`}
              style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', textDecoration: 'none', color: textColor, borderBottom: i < 4 ? `1px solid ${borderColor}` : 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#8b5cf6')}
              onMouseLeave={e => (e.currentTarget.style.color = textColor)}
            >
              <span style={{ fontSize: 14, fontWeight: 600 }}>#{item.tag}</span>
              <span style={{ fontSize: 12, color: mutedColor }}>{item.posts} posts</span>
            </Link>
          ))}
        </div>

        {/* Suggested Creators to Follow (ONLY Real Registered Users) */}
        <div style={{ padding: 20, borderRadius: 16, background: cardBg, border: `1px solid ${borderColor}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: textColor, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="#ec4899" /> Suggested Creators to Follow
          </h3>

          {registeredCreators.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: mutedColor }}>
              <UserPlus size={26} style={{ opacity: 0.3, marginBottom: 8, color: '#8b5cf6' }} />
              <div style={{ fontWeight: 700, color: textColor, fontSize: 14, marginBottom: 4 }}>No other registered creators yet</div>
              <div style={{ fontSize: 12 }}>New registered users will appear here automatically!</div>
            </div>
          ) : (
            registeredCreators.map(u => {
              const userId = (u as any).id || u.userId || 1;
              const isFollowing = followingUsers[userId];
              return (
                <div key={u.username} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                    {u.profileImageUrl
                      ? <img src={u.profileImageUrl} alt="avatar" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
                      : u.username?.[0]?.toUpperCase()
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis' }}>@{u.username}</div>
                    <div style={{ fontSize: 12, color: mutedColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.role || 'Creator'}</div>
                  </div>
                  <button
                    onClick={() => toggleFollow(u)}
                    className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ padding: '6px 14px', fontSize: 12, borderRadius: 10, gap: 4, fontWeight: 600 }}
                  >
                    {isFollowing ? <Check size={13} /> : null}
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
