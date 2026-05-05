import { Shield, Users, Zap, Globe } from 'lucide-react';

const values = [
  { icon: <Shield size={22} />, title: 'Human-First', desc: 'AI is decision-support only. Officers retain full legal accountability. No AI output reaches departments without explicit approval.', color: '#6c63ff' },
  { icon: <Users size={22} />, title: 'Open Source Core', desc: 'Built on Legal-BERT, Tesseract, spaCy, and FastAPI. No vendor lock-in. Fully auditable by the court\'s technical team.', color: '#10b981' },
  { icon: <Zap size={22} />, title: 'RTI-Ready', desc: 'Append-only PostgreSQL with hash-chain audit trail. Every action is immutably logged for Right to Information compliance.', color: '#f59e0b' },
  { icon: <Globe size={22} />, title: 'On-Premise', desc: 'No PII leaves the secured government network. Works fully air-gapped with Mistral 7B as the local LLM fallback.', color: '#60a5fa' },
];

export default function About() {
  return (
    <div style={{ paddingTop: '60px' }}>
      {/* Hero */}
      <section style={{
        padding: '5rem 2rem 4rem',
        background: 'var(--hero-bg)',
        position: 'relative', overflow: 'hidden', textAlign: 'center'
      }} className="mesh-bg">
        <div className="glow-orb animate-drift" style={{ width: 500, height: 500, background: 'var(--hero-orb)', top: -150, left: '50%', transform: 'translateX(-50%)' }} />
        <div style={{ position: 'relative' }}>
          <p className="section-label">About</p>
          <h1 className="section-title">
            Redefining decision<br />reviews with <span className="gradient-text">AI</span>
          </h1>
          <p className="section-subtitle" style={{ margin: '1.25rem auto 0', textAlign: 'center' }}>
            JudgeAI is a prototype legal-judgment automation system built for Karnataka HC — processing PDFs, extracting obligations, and routing to departments with a mandatory human-in-the-loop verification gate.
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '5rem 2rem', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="section-label" style={{ textAlign: 'center' }}>Our Principles</p>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            Built on <span className="gradient-text">trust</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {values.map(v => (
              <div key={v.title} className="card">
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${v.color}15`, border: `1px solid ${v.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: v.color, marginBottom: '1rem'
                }}>{v.icon}</div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700 }}>{v.title}</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
