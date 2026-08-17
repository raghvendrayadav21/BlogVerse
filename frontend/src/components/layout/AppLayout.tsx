import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Compass, Bookmark, Bell, User, Settings, LogOut, Plus, Menu, X, Pen, Moon, Sun, FileText } from 'lucide-react';
import { useAuthStore, useThemeStore, useUIStore } from '../../store';
import { authApi } from '../../api/auth';
import { getRefreshToken } from '../../api/client';
import toast from 'react-hot-toast';

const navItems = [
  { icon: Home, label: 'Home', path: '/feed' },
  { icon: Search, label: 'Search Users', path: '/search' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: FileText, label: 'My Drafts', path: '/drafts' },
  { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { isSidebarOpen, toggleSidebar, closeSidebar, unreadNotificationsCount } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isDark = theme === 'dark';
  const bgPrimary = isDark ? '#0a0a0f' : '#f9fafb';
  const sidebarBg = isDark ? '#0d0d14' : '#ffffff';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : '#e5e7eb';
  const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6';
  const activeBg = isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)';

  const handleLogout = async () => {
    try {
      const rt = getRefreshToken();
      if (rt) await authApi.logout(rt);
    } catch {}
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const profilePath = `/profile/${user?.userId}`;

  return (
    <div style={{ minHeight: '100vh', background: bgPrimary, display: 'flex', flexDirection: 'column' }}>

      {/* ── Mobile Top Header Bar ── */}
      <header style={{
        display: 'none', height: 60, background: sidebarBg, borderBottom: `1px solid ${borderColor}`,
        alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', position: 'sticky', top: 0, zIndex: 40,
      }} className="mobile-header">
        <Link to="/feed" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pen size={16} color="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BlogVerse
          </span>
        </Link>
        <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textColor }}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* ── Left Sidebar (Sticky Desktop Navigation) ── */}
        <aside style={{
          width: 260, flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
          background: sidebarBg, borderRight: `1px solid ${borderColor}`,
          display: 'flex', flexDirection: 'column', padding: '16px 12px',
          overflowY: 'auto', zIndex: 50,
        }}>
          {/* Logo */}
          <Link to="/feed" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px', marginBottom: 8, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Pen size={18} color="white" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BlogVerse
            </span>
          </Link>

          {/* Navigation Links */}
          <nav style={{ flex: 1 }}>
            {navItems.map((item) => {
              const path = item.path === '/profile' ? profilePath : item.path;
              const isActive = location.pathname.startsWith(item.path === '/profile' ? '/profile' : item.path);
              return (
                <Link
                  key={item.label}
                  to={path}
                  onClick={closeSidebar}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 12, marginBottom: 4,
                    textDecoration: 'none', transition: 'all 0.15s',
                    background: isActive ? activeBg : 'transparent',
                    color: isActive ? '#8b5cf6' : mutedColor,
                    fontWeight: isActive ? 600 : 400, fontSize: 15,
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = hoverBg; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <item.icon size={20} />
                  {item.label}
                  {item.label === 'Notifications' && unreadNotificationsCount > 0 && (
                    <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 100, minWidth: 20, textAlign: 'center' }}>
                      {unreadNotificationsCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Create Post Button */}
          <button
            onClick={() => { closeSidebar(); navigate('/create'); }}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: 15, borderRadius: 14, marginBottom: 16, marginTop: 8 }}
          >
            <Plus size={18} /> New Post
          </button>

          {/* User Profile Card & Theme Toggle */}
          <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12 }}>
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="avatar" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'white', fontWeight: 700 }}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{user?.username}</div>
                <div style={{ fontSize: 12, color: mutedColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.role}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4, padding: '4px 4px 0' }}>
              <button onClick={toggleTheme} title="Toggle theme"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', color: mutedColor, fontSize: 13, transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button onClick={handleLogout} title="Log out"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13, transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Router View Outlet ── */}
        <main style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
