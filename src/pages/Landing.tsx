import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Brain, GitBranch, BarChart2, CheckCircle,
  Lock, ArrowRight, Upload, Shield, Zap, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: <Upload size={20} />, title: 'PDF Ingestion', desc: 'PyMuPDF + pdfplumber for digital text. Tesseract 5 + OpenCV for scanned docs.', color: '#6c63ff' },
  { icon: <Brain size={20} />, title: 'NLP Extraction', desc: 'Fine-tuned Legal-BERT identifies case ID, parties, deadlines, responsible dept.', color: '#a78bfa' },
  { icon: <GitBranch size={20} />, title: 'Action Planner', desc: 'LLM on de-identified input decides comply vs appeal path, computes deadlines.', color: '#60a5fa' },
  { icon: <BarChart2 size={20} />, title: 'Confidence Scoring', desc: '0–100% per field. Amber flag <70%, red mandatory review <50%.', color: '#f59e0b' },
  { icon: <CheckCircle size={20} />, title: 'Verification UI', desc: 'PDF source highlight side-by-side with extracted fields. Approve / Edit / Reject.', color: '#10b981' },
  { icon: <Lock size={20} />, title: 'Audit Log', desc: 'Append-only PostgreSQL with hash chain. RTI-compliant immutable trail.', color: '#ef4444' },
];

const stats = [
  { value: '99.2%', label: 'OCR Accuracy' },
  { value: '<3s', label: 'Extraction Time' },
  { value: '100%', label: 'Human-Verified' },
  { value: 'RTI', label: 'Compliant' },
];

const pipeline = [
  { label: 'PDF Arrives', sub: 'CCMS / manual', icon: <FileText size={16} /> },
  { label: 'OCR + Ingest', sub: 'Tesseract 5', icon: <Upload size={16} /> },
  { label: 'NLP Extract', sub: 'Legal-BERT', icon: <Brain size={16} /> },
  { label: 'Action Plan', sub: 'LLM (de-id)', icon: <GitBranch size={16} /> },
  { label: 'Human Review', sub: '⬆ mandatory gate', icon: <CheckCircle size={16} />, highlight: true },
  { label: 'Dept. Dashboard', sub: 'Verified only', icon: <Shield size={16} /> },
];

export default function Landing() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(''); }
  };

  return (
    <div style={{ paddingTop: '60px' }}>
      {/* HERO */}
      <section style={{
        minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'var(--hero-bg)',
        textAlign: 'center', padding: '4rem 2rem'
      }} className="mesh-bg">
        {/* Orbs */}
        <div className="glow-orb animate-drift" style={{ width: 600, height: 600, background: 'var(--hero-orb)', top: -220, left: '50%', transform: 'translateX(-50%)' }} />
        <div className="glow-orb animate-float" style={{ width: 320, height: 320, background: 'var(--hero-orb-secondary)', bottom: -60, right: '8%' }} />

        <div style={{ position: 'relative', maxWidth: 780, margin: '0 auto' }} className="animate-fade-up">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.35rem 1rem', borderRadius: '999px',
            background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.3)',
            marginBottom: '1.75rem'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-light)', fontWeight: 600 }}>
              On-Premise · Human-in-the-Loop · RTI-Compliant
            </span>
          </div>

          <h1 className="section-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.2rem)', marginBottom: '1.5rem' }}>
            Redefining decision<br />
            reviews with <span className="gradient-text">AI</span>
          </h1>

          <p className="section-subtitle" style={{ margin: '0 auto 2.5rem', fontSize: '1.15rem' }}>
            JudgeAI automates Karnataka HC judgment processing — PDF ingestion, NLP extraction, confidence scoring — with a mandatory human verification gate before any action reaches departments.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={user ? '/upload' : '/login'} className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
              {user ? 'Upload Judgment PDF' : 'Login / Signup'} <ArrowRight size={16} />
            </Link>
            <Link to="/about" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
              Learn More
            </Link>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.7rem', flexWrap: 'wrap' }}>
            {['Secure Gov Network', 'Role-based Access', 'PDF-first Workflow'].map((chip) => (
              <span key={chip} className="badge badge-muted" style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '4rem 2rem', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          {stats.map(s => (
            <div key={s.label} className="stat-chip">
              <span className="value gradient-text">{s.value}</span>
              <span className="label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PIPELINE FLOW */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p className="section-label" style={{ textAlign: 'center' }}>End-to-End Data Flow</p>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            From PDF to<br /><span className="gradient-text">verified action</span>
          </h2>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0', flexWrap: 'wrap', rowGap: '1rem'
          }}>
            {pipeline.map((step, i) => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '1rem', borderRadius: '14px', minWidth: '110px',
                  background: step.highlight ? 'var(--accent-glow)' : 'var(--bg-card)',
                  border: `1px solid ${step.highlight ? 'rgba(108,99,255,0.4)' : 'var(--border)'}`,
                  transition: 'all 0.2s'
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: step.highlight ? 'var(--accent)' : 'var(--bg-glass)',
                    border: '1px solid var(--border-hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: step.highlight ? '#fff' : 'var(--text-secondary)',
                    marginBottom: '0.5rem'
                  }}>
                    {step.icon}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: step.highlight ? 'var(--accent-light)' : 'var(--text-primary)', textAlign: 'center' }}>{step.label}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.15rem' }}>{step.sub}</span>
                </div>
                {i < pipeline.length - 1 && (
                  <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0, margin: '0 4px' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section style={{ padding: '4rem 2rem 5rem', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p className="section-label" style={{ textAlign: 'center' }}>Core Modules</p>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
            Six building blocks.<br /><span className="gradient-text">One trusted pipeline.</span>
          </h2>
          <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 3rem' }}>
            Each module is independently testable and ready for iterative rollout.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {features.map(f => (
              <div key={f.title} className="card" style={{ cursor: 'pointer' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `${f.color}18`, border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color, marginBottom: '1rem'
                }}>
                  {f.icon}
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{f.title}</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HUMAN GATE CTA */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            padding: '2.5rem', borderRadius: '24px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div className="glow-orb" style={{ width: 300, height: 300, background: 'rgba(108,99,255,0.06)', top: -100, left: '50%', transform: 'translateX(-50%)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'var(--accent-glow)', border: '1px solid rgba(108,99,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem', color: 'var(--accent-light)'
              }}>
                <Shield size={24} />
              </div>
              <h2 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
                The mandatory<br /><span className="gradient-text">human gate</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                No AI output ever reaches a department without officer sign-off. Every approval creates a legally accountable entry in the immutable audit trail.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/dashboard" className="btn btn-primary">
                  <Zap size={15} /> Try the Reviewer Dashboard
                </Link>
                <Link to="/audit" className="btn btn-secondary">View Audit Log</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUBSCRIBE */}
      <section style={{ padding: '3rem 2rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            Stay updated on JudgeAI milestones
          </h3>
          {subscribed ? (
            <div className="badge badge-green" style={{ fontSize: '0.95rem', padding: '0.5rem 1.5rem' }}>
              ✓ You're on the list!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input
                id="subscribe-email"
                type="email" className="input" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your work email"
                style={{ maxWidth: 320 }} required
              />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
