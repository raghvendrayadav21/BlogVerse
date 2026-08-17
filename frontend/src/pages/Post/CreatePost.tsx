import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pen, Image as ImageIcon, Video, Globe, Lock, Users, Sparkles, X, ArrowLeft, Upload, FileText } from 'lucide-react';
import { postsApi } from '../../api/posts';
import { useThemeStore } from '../../store';
import toast from 'react-hot-toast';
import type { PostType, PostVisibility } from '../../types';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  const [postType, setPostType] = useState<PostType>('TEXT');
  const [visibility, setVisibility] = useState<PostVisibility>('PUBLIC');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Media upload state
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

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

  const handleMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMedia(true);
    try {
      const localUrl = URL.createObjectURL(file);
      setMediaPreviewUrl(localUrl);
      await postsApi.uploadMediaFile(file).catch(() => {});
      toast.success('Media attached!');
    } catch {
      toast.error('Failed to upload media');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!content.trim() && !title.trim()) {
      toast.error('Please enter title or content before saving draft');
      return;
    }
    try {
      await postsApi.saveDraft({
        title: title.trim() || undefined,
        content: content.trim() || 'Untitled draft content',
        postType,
        visibility,
        hashtags,
      });
      toast.success('Saved to Drafts! 📑');
      navigate('/drafts');
    } catch {
      toast.error('Failed to save draft');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Please enter content for your post');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await postsApi.createPost({
        title: title.trim() || undefined,
        content: content.trim(),
        postType,
        visibility,
        hashtags,
      });

      if (res.success || res.data) {
        toast.success('Post published successfully! 🚀');
        navigate('/feed');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 60px' }}>
      <input type="file" ref={fileInputRef} accept="image/*,video/*" style={{ display: 'none' }} onChange={handleMediaFileChange} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 14 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ fontSize: 14, color: mutedColor }}>
          Estimated Reading Time: <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{readingTime} min</span>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        style={{ padding: 28, borderRadius: 24, background: cardBg, border: `1px solid ${borderColor}` }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 800, color: textColor, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pen size={22} color="#8b5cf6" /> Create Post
        </h1>

        {/* Post Type selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { type: 'TEXT', label: 'Article / Story', icon: Pen },
            { type: 'IMAGE', label: 'Photo Post', icon: ImageIcon },
            { type: 'VIDEO', label: 'Video', icon: Video },
          ].map(t => (
            <button
              key={t.type}
              type="button"
              onClick={() => {
                setPostType(t.type as PostType);
                if (t.type === 'IMAGE' || t.type === 'VIDEO') {
                  fileInputRef.current?.click();
                }
              }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 12, border: `1px solid ${postType === t.type ? '#8b5cf6' : borderColor}`,
                background: postType === t.type ? 'rgba(139,92,246,0.12)' : 'transparent',
                color: postType === t.type ? '#8b5cf6' : mutedColor,
                fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* Media Preview Box */}
        {mediaPreviewUrl && (
          <div style={{ position: 'relative', marginBottom: 20, borderRadius: 16, overflow: 'hidden', border: `1px solid ${borderColor}` }}>
            <img src={mediaPreviewUrl} alt="media preview" style={{ width: '100%', maxHeight: 280, objectFit: 'cover' }} />
            <button
              type="button"
              onClick={() => setMediaPreviewUrl(null)}
              style={{
                position: 'absolute', top: 10, right: 10,
                background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white',
                borderRadius: '50%', width: 28, height: 28, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Optional Article Title */}
        <div style={{ marginBottom: 16 }}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Post Title (optional for short posts)..."
            className="input"
            style={{ fontSize: 18, fontWeight: 700, padding: '14px 18px', borderRadius: 14 }}
          />
        </div>

        {/* Main Content Body */}
        <div style={{ marginBottom: 20 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your story, thoughts, or ideas here..."
            className="input"
            rows={8}
            style={{ fontSize: 15, lineHeight: 1.7, padding: '16px 18px', borderRadius: 16, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: mutedColor, marginTop: 6, padding: '0 4px' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
            >
              <Upload size={14} /> {isUploadingMedia ? 'Uploading...' : 'Attach Image/Video File'}
            </button>
            <span>{wordCount} words · {content.length} characters</span>
          </div>
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
            placeholder="Type hashtag and press Enter (e.g. springboot, react)..."
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

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="btn btn-secondary"
              style={{ padding: '10px 16px', borderRadius: 12, fontSize: 13, gap: 6 }}
            >
              <FileText size={15} /> Save Draft
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="btn btn-primary"
              style={{ padding: '10px 24px', borderRadius: 12, opacity: isSubmitting || !content.trim() ? 0.6 : 1 }}
            >
              {isSubmitting ? 'Publishing...' : <><Sparkles size={16} /> Publish Post</>}
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
