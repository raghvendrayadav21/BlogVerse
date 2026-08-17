import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore, useThemeStore } from './store';

// Pages
import LandingPage from './pages/Landing';
import LoginPage from './pages/Auth/Login';
import RegisterPage from './pages/Auth/Register';
import OAuth2CallbackPage from './pages/Auth/OAuth2Callback';
import FeedPage from './pages/Feed';
import ProfilePage from './pages/Profile';
import PostDetailPage from './pages/Post/PostDetail';
import CreatePostPage from './pages/Post/CreatePost';
import ExplorePage from './pages/Explore';
import SearchUsersPage from './pages/SearchUsers';
import NotificationsPage from './pages/Notifications';
import BookmarksPage from './pages/Bookmarks';
import AdminDashboard from './pages/Admin';
import SettingsPage from './pages/Settings';
import NotFoundPage from './pages/NotFound';

import DraftsPage from './pages/Post/Drafts';
import EditPostPage from './pages/Post/EditPost';

// Layout
import AppLayout from './components/layout/AppLayout';

// Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Protected Route ─────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ─── Admin Route ─────────────────────────────────────────────────────
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/feed" replace />;
  return <>{children}</>;
}

// ─── App ─────────────────────────────────────────────────────────────
function App() {
  const { theme } = useThemeStore();

  // Apply theme on mount and change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

          {/* Protected routes inside AppLayout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/search" element={<SearchUsersPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/post/:postId" element={<PostDetailPage />} />
            <Route path="/post/:postId/edit" element={<EditPostPage />} />
            <Route path="/create" element={<CreatePostPage />} />
            <Route path="/drafts" element={<DraftsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === 'dark' ? '#1a1a24' : '#ffffff',
            color: theme === 'dark' ? '#f8fafc' : '#111827',
            border: `1px solid ${theme === 'dark' ? '#2d3748' : '#e5e7eb'}`,
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#8b5cf6', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
