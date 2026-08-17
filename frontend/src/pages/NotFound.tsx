import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>404</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>Page Not Found</h1>
        <p style={{ color: '#64748b', marginBottom: 32 }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15, borderRadius: 12 }}>Go Home</Link>
      </motion.div>
    </div>
  );
}
