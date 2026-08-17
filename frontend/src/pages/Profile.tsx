import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Globe, Edit3, UserPlus, UserMinus, Grid, Heart, Bookmark as BookmarkIcon, X, Camera, Shield, Mail, Image as ImageIcon } from 'lucide-react';
import { usersApi } from '../api/users';
import { postsApi } from '../api/posts';
import { useAuthStore, useThemeStore } from '../store';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const { user: currentUser, updateUser } = useAuthStore();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark';
  const targetUserId = paramUserId ? Number(paramUserId) : currentUser?.userId;
  const isOwnProfile = !paramUserId || currentUser?.userId === targetUserId;

  const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'saved'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Cover Photo and Avatar states
  const [coverPhoto, setCoverPhoto] = useState<string>(
    localStorage.getItem(`cover_${targetUserId}`) || ''
  );
  const [avatarPhoto, setAvatarPhoto] = useState<string>(
    currentUser?.profileImageUrl || ''
  );

  // Profile data query
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      if (isOwnProfile) {
        try {
          const res = await usersApi.getMyProfile();
          return res.data;
        } catch {
          return null;
        }
      }
      try {
        const res = await usersApi.getProfile(targetUserId);
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: !!targetUserId,
  });

  // User posts query
  const { data: userPostsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ['user-posts', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      const res = await postsApi.getUserPosts(targetUserId);
      return res.data?.content ?? [];
    },
    enabled: !!targetUserId && activeTab === 'posts',
  });

  // User liked posts query
  const { data: likedPostsData, isLoading: isLikedLoading } = useQuery({
    queryKey: ['user-liked-posts', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const res = await postsApi.getUserLikedPostIds(targetUserId).catch(() => ({ data: [] }));
      return res.data ?? [];
    },
    enabled: !!targetUserId && activeTab === 'liked',
  });

  // User bookmarks query
  const { data: userBookmarksData, isLoading: isBookmarksLoading } = useQuery({
    queryKey: ['user-bookmarks', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const res = await postsApi.getUserBookmarks().catch(() => ({ data: { content: [] } }));
      return res.data?.content ?? [];
    },
    enabled: !!targetUserId && activeTab === 'saved',
  });

  // Follow / Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async (isFollowing: boolean) => {
      if (!targetUserId) return;
      if (isFollowing) {
        await usersApi.unfollowUser(targetUserId);
      } else {
        await usersApi.followUser(targetUserId);
      }
    },
    onSuccess: (_, isFollowing) => {
      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
      toast.success(isFollowing ? 'Unfollowed user' : 'Following user!');
    },
    onError: () => toast.error('Failed to update follow status'),
  });

  // Edit Profile Form state
  const [editBio, setEditBio] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const displayUsername = profileData?.username || currentUser?.username || `user_${targetUserId || 1}`;
  const displayEmail = profileData?.email || currentUser?.email || 'user@blogverse.com';
  const displayBio = profileData?.bio || currentUser?.bio || 'Passionate writer & tech enthusiast sharing stories on BlogVerse!';
  const displayWebsite = profileData?.website || currentUser?.website || '';
  const displayAvatar = avatarPhoto || profileData?.profileImageUrl || currentUser?.profileImageUrl || '';

  const openEditModal = () => {
    setEditBio(profileData?.bio || currentUser?.bio || '');
    setEditWebsite(profileData?.website || currentUser?.website || '');
    setEditUsername(displayUsername);
    setEditAvatarUrl(displayAvatar);
    setEditCoverUrl(coverPhoto);
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      if (targetUserId) {
        await usersApi.updateProfile(targetUserId, {
          bio: editBio,
          website: editWebsite,
          username: editUsername,
        }).catch(() => {});
      }

      if (editCoverUrl) {
        setCoverPhoto(editCoverUrl);
        localStorage.setItem(`cover_${targetUserId}`, editCoverUrl);
      }

      if (editAvatarUrl) {
        setAvatarPhoto(editAvatarUrl);
      }

      updateUser({
        bio: editBio,
        website: editWebsite,
        username: editUsername,
        profileImageUrl: editAvatarUrl || displayAvatar,
      });

      queryClient.invalidateQueries({ queryKey: ['profile', targetUserId] });
      toast.success('Profile updated successfully! ✨');
      setIsEditModalOpen(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  // Avatar file upload handler
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarPhoto(imageUrl);
      updateUser({ profileImageUrl: imageUrl });
      usersApi.updateAvatar(file).catch(() => {});
      toast.success('Profile image updated!');
    }
  };

  // Cover photo file upload handler
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCoverPhoto(imageUrl);
      localStorage.setItem(`cover_${targetUserId}`, imageUrl);
      toast.success('Cover photo updated!');
    }
  };

  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';

  if (isProfileLoading) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
        <div className="skeleton" style={{ height: 180, borderRadius: 20, marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
          <div className="skeleton" style={{ width: 100, height: 100, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '40%', height: 24, borderRadius: 6, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: '60%', height: 16, borderRadius: 6 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px 60px' }}>

      {/* Hidden File Inputs */}
      <input type="file" ref={avatarInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleAvatarFileChange} />
      <input type="file" ref={coverInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleCoverFileChange} />

      {/* ── Cover Banner Container ── */}
      <div style={{
        height: 200, borderRadius: '0 0 24px 24px',
        background: coverPhoto ? `url(${coverPhoto}) center/cover no-repeat` : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #06b6d4 100%)',
        position: 'relative', marginBottom: 65, overflow: 'visible',
      }}>

        {/* Change Cover Photo Button (for own profile) */}
        {isOwnProfile && (
          <button
            onClick={() => coverInputRef.current?.click()}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)', color: 'white',
              padding: '8px 14px', borderRadius: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
            }}
          >
            <Camera size={16} /> Change Cover
          </button>
        )}

        {/* Profile Avatar Overlaid */}
        <div style={{
          position: 'absolute', bottom: -50, left: 24,
          padding: 4, background: isDark ? '#0a0a0f' : '#ffffff',
          borderRadius: '50%', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>
          <div style={{ position: 'relative', width: 96, height: 96 }}>
            {displayAvatar ? (
              <img src={displayAvatar} alt="avatar" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, color: 'white', fontWeight: 800 }}>
                {displayUsername[0]?.toUpperCase()}
              </div>
            )}

            {/* Change Profile Photo Button Overlay */}
            {isOwnProfile && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                title="Upload Profile Picture"
                style={{
                  position: 'absolute', bottom: 2, right: 2,
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#8b5cf6', border: '2px solid white',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                <Camera size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Action Button: Edit or Follow */}
        <div style={{ position: 'absolute', bottom: -52, right: 24 }}>
          {isOwnProfile ? (
            <button onClick={openEditModal} className="btn btn-secondary" style={{ borderRadius: 12, padding: '10px 20px', gap: 8, fontSize: 14 }}>
              <Edit3 size={16} /> Edit Profile
            </button>
          ) : (
            <button
              onClick={() => followMutation.mutate(!!profileData?.isFollowing)}
              disabled={followMutation.isPending}
              className={`btn ${profileData?.isFollowing ? 'btn-secondary' : 'btn-primary'}`}
              style={{ borderRadius: 12, padding: '10px 20px', gap: 8, fontSize: 14 }}
            >
              {profileData?.isFollowing ? <><UserMinus size={16} /> Following</> : <><UserPlus size={16} /> Follow</>}
            </button>
          )}
        </div>
      </div>

      {/* ── User Details Section ── */}
      <div style={{ padding: '0 8px', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: textColor }}>@{displayUsername}</h1>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Shield size={12} /> {currentUser?.role || 'CREATOR'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: mutedColor, marginBottom: 14 }}>
          <Mail size={15} /> {displayEmail}
        </div>

        {/* Bio */}
        <p style={{ fontSize: 15, color: isDark ? '#cbd5e1' : '#334155', lineHeight: 1.6, marginBottom: 16, maxWidth: 620 }}>
          {displayBio}
        </p>

        {/* Metadata links */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: mutedColor, marginBottom: 20 }}>
          {displayWebsite && (
            <a href={displayWebsite.startsWith('http') ? displayWebsite : `https://${displayWebsite}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>
              <Globe size={15} /> {displayWebsite.replace(/^https?:\/\//, '')}
            </a>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={15} /> Joined {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2026'}
          </div>
        </div>

        {/* Stats Counters */}
        <div style={{ display: 'flex', gap: 24, padding: '16px 20px', borderRadius: 16, background: cardBg, border: `1px solid ${borderColor}`, maxWidth: 500 }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: textColor }}>{profileData?.postsCount ?? (userPostsData?.length || 0)}</span>
            <span style={{ fontSize: 13, color: mutedColor, marginLeft: 6 }}>Posts</span>
          </div>
          <div style={{ width: 1, background: borderColor }} />
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: textColor }}>{profileData?.followersCount ?? 0}</span>
            <span style={{ fontSize: 13, color: mutedColor, marginLeft: 6 }}>Followers</span>
          </div>
          <div style={{ width: 1, background: borderColor }} />
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: textColor }}>{profileData?.followingCount ?? 0}</span>
            <span style={{ fontSize: 13, color: mutedColor, marginLeft: 6 }}>Following</span>
          </div>
        </div>
      </div>

      {/* ── Content Tabs ── */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${borderColor}`, marginBottom: 24 }}>
        {[
          { key: 'posts', label: 'Posts & Blogs', icon: Grid },
          { key: 'liked', label: 'Liked', icon: Heart },
          { key: 'saved', label: 'Bookmarks', icon: BookmarkIcon },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700,
              color: activeTab === tab.key ? '#8b5cf6' : mutedColor,
              borderBottom: activeTab === tab.key ? '2px solid #8b5cf6' : '2px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'posts' && (
        <div>
          {isPostsLoading ? (
            <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
          ) : !userPostsData || userPostsData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 50, color: mutedColor, background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}` }}>
              <Grid size={40} style={{ marginBottom: 12, opacity: 0.4, color: '#8b5cf6' }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: textColor }}>No published posts yet</p>
              {isOwnProfile && (
                <Link to="/feed" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
                  Write First Post
                </Link>
              )}
            </div>
          ) : (
            userPostsData.map((post: any) => (
              <div key={post.id} style={{ padding: 20, borderRadius: 16, background: cardBg, border: `1px solid ${borderColor}`, marginBottom: 14 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: textColor, marginBottom: 8 }}>{post.title || 'Untitled Post'}</h3>
                <p style={{ fontSize: 15, color: isDark ? '#cbd5e1' : '#334155', lineHeight: 1.6 }}>{post.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'liked' && (
        <div>
          {isLikedLoading ? (
            <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
          ) : !likedPostsData || likedPostsData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 50, color: mutedColor, background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}` }}>
              <Heart size={40} style={{ marginBottom: 12, opacity: 0.4, color: '#ef4444' }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: textColor }}>No liked posts found yet</p>
            </div>
          ) : (
            likedPostsData.map((id: number) => (
              <div key={id} style={{ padding: 20, borderRadius: 16, background: cardBg, border: `1px solid ${borderColor}`, marginBottom: 14 }}>
                <Link to={`/post/${id}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: textColor, marginBottom: 8 }}>Liked Post #{id}</h3>
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div>
          {isBookmarksLoading ? (
            <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
          ) : !userBookmarksData || userBookmarksData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 50, color: mutedColor, background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}` }}>
              <BookmarkIcon size={40} style={{ marginBottom: 12, opacity: 0.4, color: '#8b5cf6' }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: textColor }}>No saved bookmarks yet</p>
            </div>
          ) : (
            userBookmarksData.map((b: any) => (
              <div key={b.id} style={{ padding: 20, borderRadius: 16, background: cardBg, border: `1px solid ${borderColor}`, marginBottom: 14 }}>
                <Link to={`/post/${b.postId || b.id}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: textColor, marginBottom: 8 }}>{b.title || `Bookmarked Post #${b.postId}`}</h3>
                </Link>
                <div style={{ fontSize: 12, color: mutedColor }}>Collection: {b.collectionName || 'Reading List'}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Edit Profile Modal ── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%', maxWidth: 500, background: isDark ? '#111119' : '#ffffff',
                border: `1px solid ${borderColor}`, borderRadius: 24, padding: 28,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: textColor }}>Edit Profile Details</h2>
                <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: mutedColor }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: textColor, display: 'block', marginBottom: 6 }}>Username</label>
                  <input
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    className="input"
                    placeholder="@username"
                    style={{ borderRadius: 10 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: textColor, display: 'block', marginBottom: 6 }}>Profile Image URL</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={editAvatarUrl}
                      onChange={e => setEditAvatarUrl(e.target.value)}
                      className="input"
                      placeholder="https://images.unsplash.com/photo-..."
                      style={{ borderRadius: 10, flex: 1 }}
                    />
                    <button type="button" onClick={() => avatarInputRef.current?.click()} className="btn btn-secondary" style={{ padding: '0 14px', borderRadius: 10, gap: 4, fontSize: 13 }}>
                      <ImageIcon size={16} /> Choose File
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: textColor, display: 'block', marginBottom: 6 }}>Cover Photo URL</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={editCoverUrl}
                      onChange={e => setEditCoverUrl(e.target.value)}
                      className="input"
                      placeholder="https://images.unsplash.com/photo-..."
                      style={{ borderRadius: 10, flex: 1 }}
                    />
                    <button type="button" onClick={() => coverInputRef.current?.click()} className="btn btn-secondary" style={{ padding: '0 14px', borderRadius: 10, gap: 4, fontSize: 13 }}>
                      <ImageIcon size={16} /> Choose File
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: textColor, display: 'block', marginBottom: 6 }}>Bio</label>
                  <textarea
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Tell the world about yourself..."
                    style={{ resize: 'vertical', borderRadius: 10 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: textColor, display: 'block', marginBottom: 6 }}>Website</label>
                  <input
                    value={editWebsite}
                    onChange={e => setEditWebsite(e.target.value)}
                    className="input"
                    placeholder="https://yourwebsite.com"
                    style={{ borderRadius: 10 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary" style={{ flex: 1, borderRadius: 12 }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isUpdating} className="btn btn-primary" style={{ flex: 1, borderRadius: 12 }}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
