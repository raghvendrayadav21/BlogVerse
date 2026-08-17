import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Pen, Users, TrendingUp, BookOpen, Image, Hash, Bell, Shield, Star, ArrowRight, ExternalLink } from 'lucide-react';
import { useThemeStore } from '../store';

// ─── Animation variants ─────────────────────────────────────────────
const fadeUp: any = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer: any = {
  animate: { transition: { staggerChildren: 0.1 } },
};

// ─── Feature Cards ────────────────────────────────────────────────────
const features = [
  { icon: Pen, title: 'Write & Blog', desc: 'Create short posts or long-form articles with our rich text editor.', color: '#8b5cf6' },
  { icon: Users, title: 'Follow & Connect', desc: 'Build your network by following creators you love.', color: '#ec4899' },
  { icon: TrendingUp, title: 'Trending Feed', desc: 'Discover content ranked by engagement and recency score.', color: '#06b6d4' },
  { icon: BookOpen, title: 'Smart Reading', desc: 'Auto-calculated reading time on every article.', color: '#10b981' },
  { icon: Image, title: 'Rich Media', desc: 'Upload images and videos alongside your posts.', color: '#f59e0b' },
  { icon: Hash, title: 'Hashtags', desc: 'Discover and follow topics with #hashtag support.', color: '#8b5cf6' },
  { icon: Bell, title: 'Notifications', desc: 'Stay updated with likes, comments, follows, and mentions.', color: '#ef4444' },
  { icon: Shield, title: 'Secure by Design', desc: 'JWT auth, Google OAuth2, BCrypt passwords — no compromises.', color: '#06b6d4' },
];

// ─── Trending Post Preview ────────────────────────────────────────────
const trendingPreviews = [
  { username: 'raghvendra_dev', avatar: '👨‍💻', title: 'Building Microservices with Spring Boot 3', likes: 2847, comments: 183, tag: '#SpringBoot' },
  { username: 'priya_codes', avatar: '👩‍💻', title: 'React 19 Concurrent Mode: A Deep Dive', likes: 1923, comments: 97, tag: '#React' },
  { username: 'aman_cloud', avatar: '☁️', title: 'AWS Architecture for 10M Users', likes: 3104, comments: 241, tag: '#AWS' },
];

// ─── Landing Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div style={{ background: theme === 'dark' ? '#0a0a0f' : '#f9fafb', minHeight: '100vh' }}>
      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        background: theme === 'dark' ? 'rgba(10,10,15,0.8)' : 'rgba(255,255,255,0.8)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pen size={18} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BlogVerse
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 18 }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: 14 }}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section style={{ padding: '100px 24px 80px', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <motion.div variants={staggerContainer} initial="initial" animate="animate">

          {/* Eyebrow badge */}
          <motion.div variants={fadeUp}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#a78bfa', padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600,
              marginBottom: 32
            }}>
              <Star size={14} /> Now with Google OAuth2 & Rich Media Support
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>
            Write. Connect.{' '}
            <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Share.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{ fontSize: 20, color: theme === 'dark' ? '#94a3b8' : '#64748b', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
            BlogVerse combines the best of Medium, Twitter, and Instagram into one platform. 
            Share your thoughts, connect with creators, and discover content that matters.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16, borderRadius: 14 }}>
              Start Writing for Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: 16, borderRadius: 14 }}>
              <img src="https://www.google.com/favicon.ico" alt="Google" width={18} height={18} style={{ borderRadius: 2 }} />
              Continue with Google
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 48, justifyContent: 'center', marginTop: 64, flexWrap: 'wrap' }}>
            {[['10K+', 'Active Writers'], ['50K+', 'Published Posts'], ['2M+', 'Monthly Reads']].map(([num, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {num}
                </div>
                <div style={{ fontSize: 14, color: theme === 'dark' ? '#94a3b8' : '#64748b', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Trending Preview ── */}
      <section style={{ padding: '40px 24px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 48, color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>
            🔥 Trending Right Now
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {trendingPreviews.map((post, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                style={{
                  padding: 24, borderRadius: 16,
                  background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {post.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>@{post.username}</div>
                    <span style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', padding: '1px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600 }}>{post.tag}</span>
                  </div>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: theme === 'dark' ? '#f8fafc' : '#0f172a', lineHeight: 1.4 }}>{post.title}</h3>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: theme === 'dark' ? '#64748b' : '#94a3b8' }}>
                  <span>❤️ {post.likes.toLocaleString()}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Features Grid ── */}
      <section style={{ padding: '40px 24px 100px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 16, color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>
            Everything You Need to Create
          </h2>
          <p style={{ textAlign: 'center', color: theme === 'dark' ? '#64748b' : '#94a3b8', marginBottom: 60, fontSize: 16 }}>
            A full-featured platform built for creators, developers, and storytellers.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                style={{
                  padding: 24, borderRadius: 16,
                  background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.07)' : '#f1f5f9'}`,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <f.icon size={22} color={f.color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: theme === 'dark' ? '#64748b' : '#94a3b8', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CTA Section ── */}
      <section style={{ padding: '80px 24px 100px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <div style={{
            maxWidth: 700, margin: '0 auto', padding: '60px 40px', borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1))',
            border: '1px solid rgba(139,92,246,0.25)',
          }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16, color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>
              Ready to share your story?
            </h2>
            <p style={{ fontSize: 18, color: theme === 'dark' ? '#94a3b8' : '#64748b', marginBottom: 36 }}>
              Join thousands of creators on BlogVerse today. It's free.
            </p>
            <Link to="/register" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: 18, borderRadius: 16 }}>
              Create Your Account <ArrowRight size={20} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#e5e7eb'}`, padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pen size={14} color="white" />
            </div>
            <span style={{ fontWeight: 700, color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>BlogVerse</span>
            <span style={{ color: theme === 'dark' ? '#475569' : '#94a3b8', fontSize: 13 }}>— Write. Connect. Share.</span>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <a href="#" style={{ color: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 13 }}>Terms</a>
            <a href="#" style={{ color: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 13 }}>Privacy</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ color: theme === 'dark' ? '#64748b' : '#94a3b8' }}>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
