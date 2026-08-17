import { useQuery } from '@tanstack/react-query';
import { FileText, ArrowLeft, Send } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { postsApi } from '../../api/posts';
import { useThemeStore } from '../../store';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import type { Post } from '../../types';

export default function DraftsPage() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const { data: draftsResponse, isLoading, refetch } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => postsApi.getDrafts().catch(() => ({ success: true, data: [] })),
  });

  const drafts: Post[] = draftsResponse?.data ?? [];

  const handlePublishDraft = async (draft: Post) => {
    try {
      await postsApi.createPost({
        title: draft.title,
        content: draft.content,
        postType: draft.postType || 'BLOG',
        visibility: draft.visibility || 'PUBLIC',
        hashtags: draft.hashtags,
      });
      toast.success('Draft published to feed! 🚀');
      refetch();
      navigate('/feed');
    } catch {
      toast.error('Failed to publish draft');
    }
  };

  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';

  return (
    <div style={{ maxWidth: 740, margin: '0 auto', padding: '24px 16px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 14 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: textColor, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText size={22} color="#8b5cf6" /> My Saved Drafts
        </h1>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
        </div>
      ) : drafts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: mutedColor, background: cardBg, borderRadius: 20, border: `1px solid ${borderColor}` }}>
          <FileText size={40} style={{ opacity: 0.3, marginBottom: 12, color: '#8b5cf6' }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: textColor }}>No saved drafts found</p>
          <Link to="/create" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
            Create New Article
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {drafts.map(d => (
            <div key={d.id} style={{ padding: 20, borderRadius: 16, background: cardBg, border: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, color: '#8b5cf6', background: 'rgba(139,92,246,0.12)', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>DRAFT</span>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: textColor, marginTop: 6, marginBottom: 4 }}>{d.title || 'Untitled Draft'}</h3>
                <p style={{ fontSize: 14, color: mutedColor, marginBottom: 6 }}>{d.content.substring(0, 100)}...</p>
                <div style={{ fontSize: 12, color: mutedColor }}>
                  Last edited {d.updatedAt ? formatDistanceToNow(new Date(d.updatedAt), { addSuffix: true }) : 'recently'}
                </div>
              </div>
              <button onClick={() => handlePublishDraft(d)} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, gap: 6 }}>
                <Send size={14} /> Publish
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
