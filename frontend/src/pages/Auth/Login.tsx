import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Pen, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import { useAuthStore, useThemeStore } from '../../store';
import type { User } from '../../types';
import { GoogleAuthModal } from '../../components/auth/GoogleAuthModal';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { theme } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(data);
      if (res.success) {
        const { accessToken, refreshToken, ...userInfo } = res.data;
        login(userInfo as User, accessToken, refreshToken);
        toast.success(`Welcome back, @${res.data.username}! 👋`);
        navigate('/feed');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleGoogleLogin = () => {
    setIsGoogleModalOpen(true);
  };

  const bgColor = theme === 'dark' ? '#0a0a0f' : '#f9fafb';
  const cardBg = theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#ffffff';
  const textColor = theme === 'dark' ? '#f8fafc' : '#0f172a';
  const mutedColor = theme === 'dark' ? '#64748b' : '#94a3b8';
  const borderColor = theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e7eb';

  return (
    <div style={{ minHeight: '100vh', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%', maxWidth: 440, background: cardBg,
          border: `1px solid ${borderColor}`, borderRadius: 24, padding: 40,
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pen size={18} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BlogVerse
          </span>
        </Link>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: textColor, marginBottom: 8 }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: mutedColor, marginBottom: 32 }}>Sign in to continue your journey</p>

        {/* Google OAuth button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="btn btn-secondary"
          style={{ width: '100%', marginBottom: 24, padding: '12px', fontSize: 15, borderRadius: 12, gap: 12 }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={20} height={20} />
          Continue with Google
        </button>

        <div className="divider-text" style={{ marginBottom: 24, color: mutedColor, fontSize: 13 }}>
          or sign in with email
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: textColor, display: 'block', marginBottom: 6 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: mutedColor }} />
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className={`input ${errors.email ? 'error' : ''}`}
                style={{ paddingLeft: 42 }}
              />
            </div>
            {errors.email && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: textColor }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: '#8b5cf6' }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: mutedColor }} />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                className={`input ${errors.password ? 'error' : ''}`}
                style={{ paddingLeft: 42, paddingRight: 42 }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: mutedColor }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.password.message}</p>}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.97 }}
            className="btn btn-primary"
            style={{ marginTop: 8, padding: '13px', fontSize: 15, borderRadius: 12, opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Signing in...' : (<>Sign In <ArrowRight size={18} /></>)}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: mutedColor }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#8b5cf6', fontWeight: 600 }}>Create one</Link>
        </p>
      </motion.div>

      <GoogleAuthModal isOpen={isGoogleModalOpen} onClose={() => setIsGoogleModalOpen(false)} />
    </div>
  );
}
