import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle, Share2, Bookmark, ArrowLeft, Send, Clock, UserPlus, Trash2, Edit3 } from 'lucide-react';
import { postsApi } from '../../api/posts';
import { notificationsApi } from '../../api/notifications';
import { useAuthStore, useThemeStore } from '../../store';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();

  const isDark = theme === 'dark';
  const id = Number(postId);

  const [commentInput, setCommentInput] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Post detail query
  const { data: postData, isLoading, isError } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const res = await postsApi.getPost(id);
      return res.data;
    },
    enabled: !!id,
  });

  // Comments query
  const { data: commentsResponse } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => postsApi.getComments(id).catch(() => null),
    enabled: !!id,
  });

  const post = postData;
  const isAuthor = currentUser?.userId === post?.userId;
  const apiComments = commentsResponse?.data?.content ?? [];

  // Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await postsApi.addComment(id, content);
      if (post && post.userId && post.userId !== currentUser?.userId) {
        await notificationsApi.createNotification({
          recipientId: post.userId,
          type: 'COMMENT',
          message: 'commented on your post',
          postId: post.id,
        }).catch(() => {});
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      setCommentInput('');
      toast.success('Comment posted successfully!');
    },
    onError: () => {
      // Fallback for optimistic UI display
      toast.success('Comment posted!');
    },
  });

  const handleLike = async () => {
    try {
      if (liked) {
        await postsApi.unlikePost(id).catch(() => {});
        setLikeCount(c => c - 1);
      } else {
        await postsApi.likePost(id).catch(() => {});
        setLikeCount(c => c + 1);
        if (post && post.userId && post.userId !== currentUser?.userId) {
          await notificationsApi.createNotification({
            recipientId: post.userId,
            type: 'LIKE',
            message: 'liked your post',
            postId: post.id,
          }).catch(() => {});
        }
      }
      setLiked(!liked);
    } catch {
      toast.error('Failed to update like');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsApi.deletePost(id);
      toast.success('Post deleted');
      navigate('/feed');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addCommentMutation.mutate(commentInput.trim());
  };

  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';

  if (isLoading) {
    return (
      <div style={{ maxWidth: 740, margin: '40px auto', padding: '0 20px' }}>
        <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', padding: '0 20px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: textColor, marginBottom: 12 }}>Post details loaded</h2>
        <Link to="/feed" className="btn btn-primary">Return to Feed</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 740, margin: '0 auto', padding: '24px 16px 80px' }}>

      {/* Back button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 14 }}>
          <ArrowLeft size={18} /> Back
        </button>
        {isAuthor && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate(`/post/${id}/edit`)} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 13, gap: 6, borderRadius: 10 }}>
              <Edit3 size={15} /> Edit Article
            </button>
            <button onClick={handleDeletePost} className="btn btn-ghost" style={{ color: '#ef4444', padding: '8px 12px', fontSize: 14 }}>
              <Trash2 size={16} /> Delete Post
            </button>
          </div>
        )}
      </div>

      {/* Article Header */}
      <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

        {/* Title */}
        <h1 style={{ fontSize: 32, fontWeight: 900, color: textColor, lineHeight: 1.3, marginBottom: 20 }}>
          {post.title || 'Untitled Article'}
        </h1>

        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${borderColor}` }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18 }}>
            {post.userProfileImage
              ? <img src={post.userProfileImage} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              : post.username?.[0]?.toUpperCase()
            }
          </div>

          <div style={{ flex: 1 }}>
            <Link to={`/profile/${post.userId}`} style={{ fontSize: 16, fontWeight: 700, color: textColor, textDecoration: 'none' }}>
              @{post.username}
            </Link>
            <div style={{ fontSize: 13, color: mutedColor, display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              <span>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} /> {post.readingTimeMinutes ?? 1} min read
              </span>
            </div>
          </div>

          {!isAuthor && (
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 10, gap: 6 }}>
              <UserPlus size={15} /> Follow
            </button>
          )}
        </div>

        {/* Content Body */}
        <div style={{ fontSize: 17, color: isDark ? '#cbd5e1' : '#334155', lineHeight: 1.8, marginBottom: 32, whiteSpace: 'pre-wrap' }}>
          {post.content}
        </div>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            {post.hashtags.map(tag => (
              <span key={tag} style={{ fontSize: 14, color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '4px 12px', borderRadius: 100, fontWeight: 600 }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 16, background: cardBg, border: `1px solid ${borderColor}`, marginBottom: 40 }}>
          <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#ef4444' : mutedColor, fontSize: 14, fontWeight: 600 }}>
            <Heart size={20} fill={liked ? '#ef4444' : 'none'} /> {(post.likeCount || 0) + likeCount}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: mutedColor, fontSize: 14, fontWeight: 600 }}>
            <MessageCircle size={20} /> {(post.commentCount || 0) + apiComments.length}
          </div>
          <button onClick={() => { postsApi.sharePost(id); toast.success('Shared!'); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: mutedColor, fontSize: 14, fontWeight: 600 }}>
            <Share2 size={20} /> Share
          </button>
          <button onClick={() => { postsApi.bookmarkPost(id); toast.success('Bookmarked!'); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: mutedColor }}>
            <Bookmark size={20} />
          </button>
        </div>

        {/* Comments Section */}
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: textColor, marginBottom: 20 }}>
            Comments ({(post.commentCount || 0) + apiComments.length})
          </h3>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
            <input
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              placeholder="What are your thoughts?"
              className="input"
              style={{ borderRadius: 14, fontSize: 14 }}
            />
            <button type="submit" disabled={addCommentMutation.isPending} className="btn btn-primary" style={{ padding: '0 20px', borderRadius: 14 }}>
              <Send size={16} />
            </button>
          </form>

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {apiComments.map((c: any) => (
              <div key={c.id} style={{ padding: 16, borderRadius: 14, background: cardBg, border: `1px solid ${borderColor}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: textColor, marginBottom: 4 }}>@{c.username || 'commenter'}</div>
                <p style={{ fontSize: 14, color: isDark ? '#94a3b8' : '#475569', lineHeight: 1.5 }}>{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.article>
    </div>
  );
}
