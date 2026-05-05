import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Scale, Menu, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('judgeai_theme');
    const nextTheme = stored === 'dark' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('judgeai_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const navItems = [
    { to: '/features', label: 'Features' },
    { to: '/about', label: 'About' },
    { to: '/resources', label: 'Resources' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Logo */}
        <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Scale size={14} color="#fff" />
          </div>
          Judge<span>AI</span>
        </Link>

        {/* Desktop nav */}
        <ul className="nav-links" style={{ display: 'flex' }}>
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          {user ? (
            <>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {user.name}
              </span>
              <button type="button" onClick={logout} className="nav-cta">Logout</button>
              <Link to="/upload" className="nav-cta primary">Upload PDF</Link>
            </>
          ) : (
            <Link to="/login" className="nav-cta primary">Login / Signup</Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
          aria-label="Toggle menu"
          id="mobile-menu-btn"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '60px', left: 0, right: 0,
          background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
          padding: '1rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'
        }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
              {item.label}
            </NavLink>
          ))}
          <Link to={user ? '/upload' : '/login'} onClick={() => setMenuOpen(false)} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            {user ? 'Upload PDF' : 'Login / Signup'}
          </Link>
        </div>
      )}
    </nav>
  );
}
