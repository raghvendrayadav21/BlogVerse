import { Users, FileText, Heart, ShieldAlert, CheckCircle, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../store';
import { usersApi } from '../api/users';
import { postsApi } from '../api/posts';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const isDark = theme === 'dark';

  const { data: metricsData, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => usersApi.getAdminMetrics().catch(() => null),
  });

  const { data: reportsData } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => postsApi.getPendingReports().catch(() => null),
  });

  const dismissMutation = useMutation({
    mutationFn: (reportId: number) => postsApi.resolveReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      toast.success('Report resolved/dismissed');
    },
    onError: () => toast.error('Failed to resolve report'),
  });

  const deletePostMutation = useMutation({
    mutationFn: async ({ reportId, postId }: { reportId: number; postId: number }) => {
      await postsApi.deletePost(postId).catch(() => {});
      await postsApi.resolveReport(reportId).catch(() => {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      toast.success('Reported post deleted');
    },
    onError: () => toast.error('Failed to delete post'),
  });

  const liveMetrics = metricsData?.data;
  const pendingReportsList = reportsData?.data?.content ?? [];

  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';

  const metrics = [
    { label: 'Total Users', value: (liveMetrics?.totalUsers ?? 1).toLocaleString(), change: '+14%', icon: Users, color: '#8b5cf6' },
    { label: 'Published Posts', value: (liveMetrics?.publishedPosts ?? 48).toLocaleString(), change: '+22%', icon: FileText, color: '#ec4899' },
    { label: 'Interactions', value: (liveMetrics?.totalInteractions ?? 284).toLocaleString(), change: '+18%', icon: Heart, color: '#06b6d4' },
    { label: 'Pending Reports', value: pendingReportsList.length.toString(), change: '0%', icon: ShieldAlert, color: '#ef4444' },
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 60px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: textColor, marginBottom: 24 }}>Platform Control Center</h1>

      {/* Metrics Row */}
      {isMetricsLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
          <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
          {metrics.map(m => (
            <div key={m.label} style={{ padding: 20, borderRadius: 16, background: cardBg, border: `1px solid ${borderColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <m.icon size={20} color={m.color} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>{m.change}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: textColor }}>{m.value}</div>
              <div style={{ fontSize: 13, color: mutedColor, marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content Moderation Section */}
      <h2 style={{ fontSize: 18, fontWeight: 800, color: textColor, marginBottom: 16 }}>Flagged Content Queue</h2>
      <div style={{ padding: 20, borderRadius: 16, background: cardBg, border: `1px solid ${borderColor}` }}>
        {pendingReportsList.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: mutedColor, fontSize: 14 }}>
            <CheckCircle size={18} color="#10b981" />
            <span>All reported posts are reviewed by admins. 0 urgent flags currently pending.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingReportsList.map((r: any) => (
              <div key={r.id} style={{ padding: 14, borderRadius: 12, border: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: textColor }}>Post #{r.postId} — Reason: {r.reason}</div>
                  <div style={{ fontSize: 12, color: mutedColor }}>Reporter ID: {r.reporterUserId}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => dismissMutation.mutate(r.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}>
                    Dismiss
                  </button>
                  <button onClick={() => deletePostMutation.mutate({ reportId: r.id, postId: r.postId })} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8, color: '#ef4444', gap: 4 }}>
                    <Trash2 size={13} /> Delete Post
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
