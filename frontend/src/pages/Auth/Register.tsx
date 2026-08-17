import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Pen, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import { useAuthStore, useThemeStore } from '../../store';
import type { User as UserType } from '../../types';
import { GoogleAuthModal } from '../../components/auth/GoogleAuthModal';

const schema = z.object({
  username: z.string().min(3, 'At least 3 characters').max(50).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Need uppercase, lowercase, and a number'),
  confirmPassword: z.string(),
  bio: z.string().max(500).optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
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
      const res = await authApi.register(data);
      if (res.success) {
        const { accessToken, refreshToken, ...userInfo } = res.data;
        login(userInfo as UserType, accessToken, refreshToken);
        toast.success(`Welcome to BlogVerse, @${res.data.username}! 🎉`);
        navigate('/feed');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleGoogleRegister = () => {
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
        style={{ width: '100%', maxWidth: 480, background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 24, padding: 40 }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Pen size={18} color="white" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BlogVerse
          </span>
        </Link>

        <h2 style={{ fontSize: 24, fontWeight: 700, color: textColor, marginBottom: 8 }}>Create an account</h2>
        <p style={{ color: mutedColor, fontSize: 14, marginBottom: 28 }}>Join thousands of content creators sharing stories daily</p>

        <button
          onClick={handleGoogleRegister}
          disabled={isLoading}
          className="btn btn-secondary"
          style={{ width: '100%', marginBottom: 20, padding: '12px', fontSize: 15, borderRadius: 12, gap: 12 }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={20} height={20} />
          Sign up with Google
        </button>

        <div className="divider-text" style={{ marginBottom: 20, color: mutedColor, fontSize: 13 }}>or sign up with email</div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Username */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: textColor, display: 'block', marginBottom: 6 }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: mutedColor }} />
              <input {...register('username')} placeholder="@username" className={`input ${errors.username ? 'error' : ''}`} style={{ paddingLeft: 42 }} />
            </div>
            {errors.username && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.username.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: textColor, display: 'block', marginBottom: 6 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: mutedColor }} />
              <input {...register('email')} type="email" placeholder="you@example.com" className={`input ${errors.email ? 'error' : ''}`} style={{ paddingLeft: 42 }} />
            </div>
            {errors.email && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: textColor, display: 'block', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: mutedColor }} />
              <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min. 8 chars" className={`input ${errors.password ? 'error' : ''}`} style={{ paddingLeft: 42, paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: mutedColor }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: textColor, display: 'block', marginBottom: 6 }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: mutedColor }} />
              <input {...register('confirmPassword')} type="password" placeholder="Repeat password" className={`input ${errors.confirmPassword ? 'error' : ''}`} style={{ paddingLeft: 42 }} />
            </div>
            {errors.confirmPassword && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.confirmPassword.message}</p>}
          </div>

          {/* Bio (optional) */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: textColor, display: 'block', marginBottom: 6 }}>Bio <span style={{ color: mutedColor, fontWeight: 400 }}>(optional)</span></label>
            <textarea {...register('bio')} placeholder="Tell the world about yourself..." className="input" style={{ resize: 'vertical', minHeight: 80, paddingTop: 12 }} />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.97 }}
            className="btn btn-primary"
            style={{ marginTop: 8, padding: '13px', fontSize: 15, borderRadius: 12, opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Creating account...' : (<>Create Account <ArrowRight size={18} /></>)}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: mutedColor }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#8b5cf6', fontWeight: 600 }}>Sign in</Link>
        </p>
      </motion.div>

      <GoogleAuthModal isOpen={isGoogleModalOpen} onClose={() => setIsGoogleModalOpen(false)} />
    </div>
  );
}
