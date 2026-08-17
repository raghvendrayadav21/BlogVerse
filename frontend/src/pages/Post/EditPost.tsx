import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pen, Globe, Lock, Users, Sparkles, X, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '../../api/posts';
import { useThemeStore } from '../../store';
import toast from 'react-hot-toast';
import type { PostVisibility } from '../../types';

export default function EditPostPage() {
  const { postId } = useParams<{ postId: string }>();
  const id = Number(postId);
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<PostVisibility>('PUBLIC');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: postData, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.getPost(id).then(res => res.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (postData) {
      setTitle(postData.title || '');
      setContent(postData.content || '');
      setVisibility(postData.visibility || 'PUBLIC');
      setHashtags(postData.hashtags || []);
    }
  }, [postData]);

  const handleAddHashtag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = hashtagInput.trim().replace(/^#/, '').toLowerCase();
      if (tag && !hashtags.includes(tag)) {
        setHashtags([...hashtags, tag]);
        setHashtagInput('');
      }
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      await postsApi.updatePost(id, {
        title: title.trim() || undefined,
        content: content.trim(),
        visibility,
        hashtags,
      });

      toast.success('Article updated successfully! ✨');
      navigate(`/post/${id}`);
    } catch {
      toast.error('Failed to update article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';

  if (isLoading) {
    return (
      <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px' }}>
        <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 14 }}>
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        style={{ padding: 28, borderRadius: 24, background: cardBg, border: `1px solid ${borderColor}` }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 800, color: textColor, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pen size={22} color="#8b5cf6" /> Edit Article
        </h1>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Post Title..."
            className="input"
            style={{ fontSize: 18, fontWeight: 700, padding: '14px 18px', borderRadius: 14 }}
          />
        </div>

        {/* Content Body */}
        <div style={{ marginBottom: 20 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your story..."
            className="input"
            rows={10}
            style={{ fontSize: 15, lineHeight: 1.7, padding: '16px 18px', borderRadius: 16, resize: 'vertical' }}
          />
        </div>

        {/* Hashtags Input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: textColor, display: 'block', marginBottom: 8 }}>Hashtags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
            {hashtags.map(tag => (
              <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', padding: '4px 10px', borderRadius: 100, fontSize: 13, fontWeight: 600 }}>
                #{tag}
                <button type="button" onClick={() => removeHashtag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b5cf6', padding: 0 }}>
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <input
            value={hashtagInput}
            onChange={e => setHashtagInput(e.target.value)}
            onKeyDown={handleAddHashtag}
            placeholder="Type hashtag and press Enter..."
            className="input"
            style={{ fontSize: 13 }}
          />
        </div>

        {/* Visibility selector & Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${borderColor}`, paddingTop: 20, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: mutedColor }}>Visibility:</span>
            {[
              { val: 'PUBLIC', label: 'Public', icon: Globe },
              { val: 'FOLLOWERS_ONLY', label: 'Followers', icon: Users },
              { val: 'PRIVATE', label: 'Private', icon: Lock },
            ].map(v => (
              <button
                key={v.val}
                type="button"
                onClick={() => setVisibility(v.val as PostVisibility)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8,
                  border: `1px solid ${visibility === v.val ? '#8b5cf6' : 'transparent'}`,
                  background: visibility === v.val ? 'rgba(139,92,246,0.12)' : 'transparent',
                  color: visibility === v.val ? '#8b5cf6' : mutedColor,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <v.icon size={13} /> {v.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate(`/post/${id}`)}
              className="btn btn-secondary"
              style={{ padding: '10px 20px', borderRadius: 12 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="btn btn-primary"
              style={{ padding: '10px 24px', borderRadius: 12, opacity: isSubmitting || !content.trim() ? 0.6 : 1 }}
            >
              {isSubmitting ? 'Saving...' : <><Sparkles size={16} /> Update Article</>}
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
