import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store';
import type { User } from '../../types';
import toast from 'react-hot-toast';

/**
 * OAuth2 Callback page.
 * Google redirects here after successful authentication.
 * Extracts tokens from query params and logs the user in.
 */
export default function OAuth2CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');

    if (accessToken && refreshToken && userId && username) {
      const user: User = {
        userId: Number(userId),
        username,
        email: '',
        role: 'USER',
      };
      login(user, accessToken, refreshToken);
      toast.success(`Welcome, @${username}! 🎉`);
      navigate('/feed', { replace: true });
    } else {
      toast.error('Google login failed. Please try again.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          margin: '0 auto 16px',
          animation: 'spin 1s linear infinite',
        }} />
        <p>Completing Google sign-in...</p>
      </div>
    </div>
  );
}
