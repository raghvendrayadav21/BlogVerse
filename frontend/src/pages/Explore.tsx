import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Users, FileText, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '../store';
import { searchApi } from '../api/search';
import { postsApi } from '../api/posts';
import { Link, useSearchParams } from 'react-router-dom';
import type { Post } from '../types';

const defaultTrendingTags = [
  { tag: 'SpringBoot', count: '4.2K' },
  { tag: 'React', count: '3.8K' },
  { tag: 'Java', count: '2.9K' },
  { tag: 'AWS', count: '2.1K' },
  { tag: 'Microservices', count: '1.9K' },
  { tag: 'TypeScript', count: '1.5K' },
];

const fallbackPosts = [
  { id: 901, title: 'Architecting Resilient Spring Boot 3 Microservices', username: 'raghvendra_dev', hashtags: ['SpringBoot'], likeCount: 1420 },
  { id: 902, title: 'React 19 Server Components and Suspense Deep Dive', username: 'priya_codes', hashtags: ['React'], likeCount: 980 },
  { id: 903, title: 'AWS Cloud Architecture for High Throughput Applications', username: 'aman_cloud', hashtags: ['AWS'], likeCount: 2150 },
];

export default function ExplorePage() {
  const { theme } = useThemeStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTag = searchParams.get('tag');

  const isDark = theme === 'dark';
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);

  useEffect(() => {
    if (initialTag) {
      setSelectedTag(initialTag);
    }
  }, [initialTag]);

  // Global search query
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi.globalSearch(query).catch(() => null),
    enabled: query.trim().length > 1,
  });

  // Hashtag posts query
  const { data: tagPostsResponse, isLoading: isTagLoading } = useQuery({
    queryKey: ['tag-posts', selectedTag],
    queryFn: () => (selectedTag ? postsApi.getHashtagPosts(selectedTag).catch(() => null) : null),
    enabled: !!selectedTag && !query.trim(),
  });

  // Real Trending Tags query
  const { data: realTrendingTagsRes } = useQuery({
    queryKey: ['trending-tags'],
    queryFn: () => postsApi.getTrendingTags().catch(() => null),
  });

  const realTags = realTrendingTagsRes?.data ?? [];
  const activeTrendingTags = realTags.length > 0
    ? realTags.map(t => ({ tag: t.name, count: `${t.postCount || 1}` }))
    : defaultTrendingTags;

  const searchPosts = searchResults?.data?.posts ?? [];
  const searchUsers = searchResults?.data?.users ?? [];
  const tagPosts = tagPostsResponse?.data?.content ?? [];

  const displayPosts: Post[] = query.trim()
    ? searchPosts
    : selectedTag
    ? tagPosts.length > 0 ? tagPosts : fallbackPosts.filter(p => p.hashtags?.includes(selectedTag)) as any
    : fallbackPosts as any;

  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px 60px' }}>
      {/* Search Header */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <Search size={20} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: mutedColor }} />
        <input
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            if (selectedTag) setSelectedTag(null);
          }}
          placeholder="Search creators, posts, or #hashtags..."
          className="input"
          style={{ paddingLeft: 52, paddingRight: 40, paddingTop: 14, paddingBottom: 14, fontSize: 16, borderRadius: 16 }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: mutedColor, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Users Search Results */}
      {query.trim().length > 1 && searchUsers.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: textColor, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} color="#ec4899" /> Matching Creators
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {searchUsers.map(u => (
              <Link key={u.username} to={`/profile/${u.id || u.userId || 1}`} style={{ textDecoration: 'none', color: textColor }}>
                <div style={{ padding: 14, borderRadius: 14, background: cardBg, border: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                    {u.username[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>@{u.username}</div>
                    <div style={{ fontSize: 11, color: mutedColor }}>Creator</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending Hashtags Grid */}
      {!query && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: textColor, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} color="#8b5cf6" /> Trending Topics
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 32 }}>
            {activeTrendingTags.map((item) => (
              <motion.div
                key={item.tag}
                whileHover={{ y: -2 }}
                onClick={() => {
                  if (selectedTag === item.tag) {
                    setSelectedTag(null);
                    setSearchParams({});
                  } else {
                    setSelectedTag(item.tag);
                    setSearchParams({ tag: item.tag });
                  }
                }}
                style={{
                  padding: '16px 20px', borderRadius: 16, background: cardBg,
                  border: `1px solid ${selectedTag === item.tag ? '#8b5cf6' : borderColor}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700, color: textColor, marginBottom: 4 }}>#{item.tag}</div>
                <div style={{ fontSize: 12, color: mutedColor }}>{item.count} posts</div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Search / Filter Results Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: textColor, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={18} color="#8b5cf6" />
          {query ? `Search results for "${query}"` : selectedTag ? `Posts tagged #${selectedTag}` : 'Popular Content'}
        </h2>
        {selectedTag && !query && (
          <button onClick={() => { setSelectedTag(null); setSearchParams({}); }} style={{ background: 'none', border: 'none', color: '#8b5cf6', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
            Clear Filter
          </button>
        )}
      </div>

      {/* Posts List */}
      {isSearchLoading || isTagLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {displayPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 50, color: mutedColor, background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}` }}>
              <p>No matching posts found.</p>
            </div>
          ) : (
            displayPosts.map((post: any) => (
              <div key={post.id} style={{ padding: 20, borderRadius: 16, background: cardBg, border: `1px solid ${borderColor}` }}>
                {post.hashtags && post.hashtags.length > 0 && (
                  <span style={{ fontSize: 12, color: '#8b5cf6', background: 'rgba(139,92,246,0.12)', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                    #{post.hashtags[0]}
                  </span>
                )}
                <Link to={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: textColor, marginTop: 8, marginBottom: 6 }}>{post.title || post.content?.substring(0, 80)}</h3>
                </Link>
                <div style={{ fontSize: 13, color: mutedColor }}>By @{post.username || 'creator'} · ❤️ {post.likeCount || 0} likes</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
