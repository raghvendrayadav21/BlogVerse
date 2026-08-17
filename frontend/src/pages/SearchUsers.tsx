import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Check, ExternalLink, ShieldCheck, Sparkles, X, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore, useAuthStore } from '../store';
import { usersApi } from '../api/users';
import { notificationsApi } from '../api/notifications';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { User } from '../types';

export default function SearchUsersPage() {
  const { theme } = useThemeStore();
  const { user: currentUser } = useAuthStore();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [followingMap, setFollowingMap] = useState<Record<number, boolean>>({});

  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';

  // Fetch real registered creators from user-service
  const { data: suggestionsData, isLoading } = useQuery({
    queryKey: ['suggested-users-search'],
    queryFn: () => usersApi.getSuggestedUsers().catch(() => ({ success: true, data: [] })),
  });

  const allUsers: User[] = (suggestionsData?.data as unknown as User[]) || [];

  // Filter users based on search query and exclude current logged-in user
  const filteredUsers = allUsers.filter(u => {
    if (u.username === currentUser?.username) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.bio && u.bio.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const toggleFollow = async (targetUser: User) => {
    const targetId = (targetUser as any).id || targetUser.userId || 1;
    const isFollowing = followingMap[targetId];

    setFollowingMap(prev => ({ ...prev, [targetId]: !isFollowing }));

    try {
      if (isFollowing) {
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
      toast.success(isFollowing ? `Unfollowed @${targetUser.username}` : `Started following @${targetUser.username}! 🎉`);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 16px 60px' }}>

      {/* ── Page Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: textColor, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={28} color="#8b5cf6" /> Find & Follow Creators
        </h1>
        <p style={{ fontSize: 15, color: mutedColor, margin: 0 }}>
          Search for registered BlogVerse creators, inspect their profiles, and follow them to customize your home feed.
        </p>
      </motion.div>

      {/* ── Search Bar Input ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ position: 'relative', marginBottom: 28 }}>
        <Search size={22} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search registered creators by username, bio, or role..."
          className="input"
          style={{
            paddingLeft: 54, paddingRight: 44, paddingTop: 16, paddingBottom: 16,
            fontSize: 16, borderRadius: 18, border: `1.5px solid ${searchQuery ? '#8b5cf6' : borderColor}`,
            background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
            boxShadow: searchQuery ? '0 0 16px rgba(139,92,246,0.15)' : 'none',
            transition: 'all 0.2s',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: mutedColor, cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        )}
      </motion.div>

      {/* ── Results Header Count ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: mutedColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {searchQuery ? `Search Results (${filteredUsers.length})` : `All Registered Creators (${filteredUsers.length})`}
        </span>
        <span style={{ fontSize: 13, color: '#8b5cf6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={14} /> Live Sync
        </span>
      </div>

      {/* ── Loading Skeleton ── */}
      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 180, borderRadius: 18, background: cardBg, border: `1px solid ${borderColor}`, opacity: 0.5, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!isLoading && filteredUsers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '48px 24px', textAlign: 'center', borderRadius: 20,
            background: cardBg, border: `1px solid ${borderColor}`,
          }}
        >
          <UserPlus size={44} style={{ color: '#8b5cf6', opacity: 0.4, marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: textColor, marginBottom: 6 }}>
            {searchQuery ? `No creators matching "${searchQuery}"` : 'No other registered creators found'}
          </h3>
          <p style={{ fontSize: 14, color: mutedColor, maxWidth: 400, margin: '0 auto 16px' }}>
            {searchQuery
              ? 'Try searching with a different term or clear the search query to see all registered members.'
              : 'As new members register on BlogVerse, they will automatically appear here!'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="btn btn-secondary"
              style={{ padding: '8px 18px', borderRadius: 12, fontSize: 14 }}
            >
              Clear Search Query
            </button>
          )}
        </motion.div>
      )}

      {/* ── Registered Creators Cards Grid ── */}
      {!isLoading && filteredUsers.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
          <AnimatePresence>
            {filteredUsers.map(u => {
              const userId = (u as any).id || u.userId || 1;
              const isFollowing = followingMap[userId];

              return (
                <motion.div
                  key={u.username}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' }}
                  style={{
                    padding: 20, borderRadius: 20, background: cardBg,
                    border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column',
                    justifyContent: 'space-between', transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                  }}
                >
                  {/* Top Header Card */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 800, fontSize: 18, flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
                      }}>
                        {u.profileImageUrl ? (
                          <img src={u.profileImageUrl} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          u.username?.[0]?.toUpperCase()
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link to={`/profile/${userId}`} style={{ textDecoration: 'none' }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: textColor, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            @{u.username}
                          </div>
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: mutedColor, marginTop: 2 }}>
                          <ShieldCheck size={13} color="#8b5cf6" />
                          <span style={{ fontWeight: 600 }}>{u.role || 'Creator'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    <p style={{
                      fontSize: 13, color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.5,
                      marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 38,
                    }}>
                      {u.bio || 'Registered BlogVerse Creator. Sharing insightful articles and code.'}
                    </p>
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: `1px solid ${borderColor}` }}>
                    <button
                      onClick={() => toggleFollow(u)}
                      className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ flex: 1, padding: '9px 12px', fontSize: 13, borderRadius: 12, fontWeight: 700, gap: 6 }}
                    >
                      {isFollowing ? <Check size={15} /> : <UserPlus size={15} />}
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>

                    <Link
                      to={`/profile/${userId}`}
                      title="View Profile"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '9px 12px', borderRadius: 12, border: `1px solid ${borderColor}`,
                        color: textColor, textDecoration: 'none', background: 'none', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
