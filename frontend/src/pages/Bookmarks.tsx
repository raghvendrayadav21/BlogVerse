import { useState } from 'react';
import { Bookmark, Folder, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../store';
import { postsApi } from '../api/posts';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const mockBookmarks = [
  { id: 1, postId: 901, title: 'Building Scalable Microservices Architecture with Spring Boot 3 & Docker', author: 'raghvendra_dev', collectionName: 'Reading List', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 2, postId: 902, title: 'React 19 Hooks and Performance Tuning Techniques', author: 'priya_codes', collectionName: 'Frontend', createdAt: new Date(Date.now() - 432000000).toISOString() },
];

export default function BookmarksPage() {
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const isDark = theme === 'dark';
  const [activeCollection, setActiveCollection] = useState('All');

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['bookmarks', activeCollection],
    queryFn: () => postsApi.getUserBookmarks(activeCollection === 'All' ? undefined : activeCollection).catch(() => null),
  });

  const rawBookmarks = apiResponse?.data?.content ?? [];
  const bookmarksList = rawBookmarks.length > 0 ? rawBookmarks : mockBookmarks;

  const removeBookmarkMutation = useMutation({
    mutationFn: (postId: number) => postsApi.removeBookmark(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success('Removed bookmark');
    },
    onError: () => toast.error('Failed to remove bookmark'),
  });

  const handleRemoveBookmark = (postId: number) => {
    removeBookmarkMutation.mutate(postId);
  };

  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';

  return (
    <div style={{ maxWidth: 740, margin: '0 auto', padding: '24px 16px 60px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: textColor, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Bookmark size={22} color="#8b5cf6" /> Bookmarks
      </h1>

      {/* Collections Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['All', 'Reading List', 'Frontend', 'Backend'].map(col => (
          <button
            key={col}
            onClick={() => setActiveCollection(col)}
            className={`btn ${activeCollection === col ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: 13, borderRadius: 10, gap: 6 }}
          >
            <Folder size={14} /> {col}
          </button>
        ))}
      </div>

      {/* Bookmarks List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="skeleton" style={{ height: 90, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 90, borderRadius: 16 }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {bookmarksList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: mutedColor }}>
              <Bookmark size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>No saved bookmarks found in this collection.</p>
            </div>
          ) : (
            bookmarksList.map(b => (
              <div key={b.id} style={{ padding: 20, borderRadius: 16, background: cardBg, border: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 11, color: '#8b5cf6', background: 'rgba(139,92,246,0.12)', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>{b.collectionName || 'Reading List'}</span>
                  <Link to={`/post/${b.postId || b.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: textColor, marginTop: 6, marginBottom: 4 }}>{b.title || `Post #${b.postId}`}</h3>
                  </Link>
                  <div style={{ fontSize: 12, color: mutedColor }}>By @{b.author || 'creator'} · Saved {formatDistanceToNow(new Date(b.createdAt), { addSuffix: true })}</div>
                </div>
                <button onClick={() => handleRemoveBookmark(b.postId || b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 8 }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
