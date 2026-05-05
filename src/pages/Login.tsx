import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';

const ROLES: { id: UserRole; label: string; desc: string }[] = [
  { id: 'officer', label: 'Reviewing Officer', desc: 'Approve / Edit / Reject extracted fields' },
  { id: 'head', label: 'Dept. Head', desc: 'View verified records & deadline calendar' },
  { id: 'admin', label: 'System Admin', desc: 'Configuration, model management, audit' },
];

export default function Login() {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('officer@karnataka.gov.in');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<UserRole>('officer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (tab === 'login') {
        const res = login(email, password, role);
        if (!res.ok) {
          setError(res.message ?? 'Login failed.');
          setLoading(false);
          return;
        }
      } else {
        const created = signup({ name, email, password, role });
        if (!created.ok) {
          setError(created.message ?? 'Signup failed.');
          setLoading(false);
          return;
        }

        const signedIn = login(email, password, role);
        if (!signedIn.ok) {
          setError('Account created but auto-login failed. Please sign in.');
          setLoading(false);
          setTab('login');
          return;
        }
      }

      setLoading(false);
      navigate('/upload');
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--hero-bg)',
      padding: '2rem', position: 'relative', overflow: 'hidden'
    }}>
      <div className="glow-orb animate-drift" style={{ width: 500, height: 500, background: 'var(--hero-orb)', top: -150, left: '50%', transform: 'translateX(-50%)' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Scale size={20} color="#fff" /></div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Judge<span style={{ color: 'var(--accent)' }}>AI</span>
            </span>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Karnataka HC · Secured Government Portal
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button type="button" className={`btn ${tab === 'login' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setTab('login')}>
              Login
            </button>
            <button type="button" className={`btn ${tab === 'signup' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setTab('signup')}>
              Signup
            </button>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem', textAlign: 'center' }}>
            {tab === 'login' ? 'Login to JudgeAI' : 'Create account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', margin: '0 0 1.75rem' }}>
            Access is limited to approved government roles only.
          </p>

          {/* Role picker */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Role</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {ROLES.map(r => (
                <label key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.65rem 0.85rem', borderRadius: 10, cursor: 'pointer',
                  border: `1px solid ${role === r.id ? 'rgba(108,99,255,0.5)' : 'var(--border)'}`,
                  background: role === r.id ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                  transition: 'all 0.15s'
                }}>
                  <input type="radio" name="role" value={r.id} checked={role === r.id} onChange={() => setRole(r.id)} style={{ accentColor: 'var(--accent)' }} />
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: role === r.id ? 'var(--accent-light)' : 'var(--text-primary)', display: 'block' }}>{r.label}</span>
                    <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{r.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tab === 'signup' && (
              <div>
                <label htmlFor="name" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Full Name</label>
                <input id="name" type="text" className="input" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label htmlFor="email" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email</label>
              <input id="email" type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ position: 'relative' }}>
              <label htmlFor="password" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Password</label>
              <input id="password" type={showPw ? 'text' : 'password'} className="input" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPw(p => !p)} style={{
                position: 'absolute', right: 10, bottom: 10,
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
              }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {error && (
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--red)' }}>{error}</p>
            )}
            <button id="login-submit" type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '0.75rem', marginTop: '0.25rem' }} disabled={loading}>
              {loading ? (tab === 'login' ? 'Logging in…' : 'Creating account…') : <><ArrowRight size={15} /> {tab === 'login' ? 'Login securely' : 'Create account'}</>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.25rem' }}>
          Powered by Keycloak OAuth2 · TLS 1.3 · Zero PII exposure
        </p>
      </div>
    </div>
  );
}
