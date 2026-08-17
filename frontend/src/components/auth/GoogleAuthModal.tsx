import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, AtSign, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import { useAuthStore, useThemeStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import type { User as UserType } from '../../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter a valid username');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.googleLogin({
        email: email.trim(),
        name: fullName.trim(),
        username: username.trim().toLowerCase(),
        googleId: `google_${email.trim().replace(/[^a-zA-Z0-9]/g, '_')}`,
        picture: null // explicitly null as requested (no dummy image)
      });

      if (res.success) {
        const { accessToken, refreshToken, ...userInfo } = res.data;
        login(userInfo as UserType, accessToken, refreshToken);
        toast.success(`Welcome @${res.data.username}! Signed in with Google 🎉`);
        onClose();
        navigate('/feed');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = theme === 'dark';
  const overlayBg = 'rgba(0, 0, 0, 0.7)';
  const modalBg = isDark ? '#12131c' : '#ffffff';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc';

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: overlayBg,
          backdropFilter: 'blur(8px)',
          padding: 16
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          style={{
            width: '100%',
            maxWidth: 440,
            backgroundColor: modalBg,
            borderRadius: 24,
            border: `1px solid ${borderColor}`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '24px 28px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${borderColor}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={22} height={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: textColor }}>Sign in with Google</h3>
                <p style={{ margin: 0, fontSize: 12, color: mutedColor }}>Confirm details & choose username</p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: mutedColor,
                cursor: 'pointer',
                padding: 6,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Full Name */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: textColor, display: 'block', marginBottom: 6 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: mutedColor }} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: 12,
                    border: `1px solid ${borderColor}`,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: textColor, display: 'block', marginBottom: 6 }}>
                Google Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: mutedColor }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Gmail address"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: 12,
                    border: `1px solid ${borderColor}`,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Choose Username */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: textColor, display: 'block', marginBottom: 6 }}>
                Choose Username (@handle)
              </label>
              <div style={{ position: 'relative' }}>
                <AtSign size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="Enter custom username handle"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: 12,
                    border: `1px solid #8b5cf6`,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: 14,
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: mutedColor }}>
                Your unique handle: <span style={{ color: '#8b5cf6', fontWeight: 600 }}>@{username || 'username'}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: 'transparent',
                  color: textColor,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  flex: 1.5,
                  padding: '12px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                <CheckCircle2 size={16} />
                {isLoading ? 'Signing in...' : 'Continue'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
