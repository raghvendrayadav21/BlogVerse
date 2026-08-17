import { useState } from 'react';
import { Settings, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully! 🔒');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 60px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: textColor, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Settings size={22} color="#8b5cf6" /> Account Settings
      </h1>

      {/* Preferences Section */}
      <div style={{ padding: 24, borderRadius: 20, background: cardBg, border: `1px solid ${borderColor}`, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: textColor, marginBottom: 16 }}>Appearance</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: textColor }}>Theme Preference</div>
            <div style={{ fontSize: 13, color: mutedColor }}>Switch between dark and light mode</div>
          </div>
          <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: 10, gap: 8 }}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />} {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div style={{ padding: 24, borderRadius: 20, background: cardBg, border: `1px solid ${borderColor}` }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: textColor, marginBottom: 16 }}>Change Password</h2>
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: textColor, display: 'block', marginBottom: 6 }}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: textColor, display: 'block', marginBottom: 6 }}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="input"
              placeholder="Min. 8 characters"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 12, marginTop: 4, opacity: isSubmitting ? 0.6 : 1 }}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
