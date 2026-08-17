import { motion } from 'framer-motion';
import { Bell, Heart, MessageCircle, UserPlus, Share2, CheckCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore, useUIStore } from '../store';
import { notificationsApi, type NotificationItem } from '../api/notifications';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { theme } = useThemeStore();
  const { markAllNotificationsRead } = useUIStore();
  const queryClient = useQueryClient();
  const isDark = theme === 'dark';

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications().catch(() => null),
  });

  const notificationsList = apiResponse?.data?.content ?? [];

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead().catch(() => {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      markAllNotificationsRead();
      toast.success('All notifications marked as read! ✨');
    },
  });

  const markSingleMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id).catch(() => {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleMarkAllRead = () => {
    markAllMutation.mutate();
  };

  const toggleSingleRead = (n: NotificationItem) => {
    if (!n.isRead) {
      markSingleMutation.mutate(n.id);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIKE': return <Heart size={16} color="#ef4444" fill="#ef4444" />;
      case 'COMMENT': return <MessageCircle size={16} color="#8b5cf6" />;
      case 'FOLLOW': return <UserPlus size={16} color="#ec4899" />;
      case 'SHARE': return <Share2 size={16} color="#06b6d4" />;
      default: return <Bell size={16} color="#8b5cf6" />;
    }
  };

  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: textColor, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell size={22} color="#8b5cf6" /> Notifications
        </h1>
        {notificationsList.length > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-ghost" style={{ fontSize: 13, gap: 6, cursor: 'pointer' }}>
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="skeleton" style={{ height: 60, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 60, borderRadius: 16 }} />
        </div>
      ) : notificationsList.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center', padding: '60px 24px', background: cardBg,
            borderRadius: 20, border: `1px solid ${borderColor}`,
          }}
        >
          <Bell size={44} style={{ color: '#8b5cf6', opacity: 0.4, marginBottom: 14 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: textColor, marginBottom: 6 }}>No notifications yet</h3>
          <p style={{ fontSize: 14, color: mutedColor, maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
            When another registered creator follows you or interacts with your posts, your real activity notifications will appear here!
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notificationsList.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => toggleSingleRead(n)}
              style={{
                padding: '16px 20px', borderRadius: 16, background: cardBg,
                border: `1px solid ${n.isRead ? borderColor : 'rgba(139,92,246,0.3)'}`,
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ padding: 10, borderRadius: 12, background: 'rgba(139,92,246,0.1)' }}>
                {getIcon(n.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: textColor }}>
                  <span style={{ fontWeight: 700 }}>@{n.senderUsername || 'user'}</span> {n.message}
                </div>
                <div style={{ fontSize: 12, color: mutedColor, marginTop: 2 }}>
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </div>
              </div>

              {!n.isRead && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
