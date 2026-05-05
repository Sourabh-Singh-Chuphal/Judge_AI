import { FileText, Brain, GitBranch, Server, Database, Shield, Zap, Globe, Code } from 'lucide-react';

const STACK = [
  { layer: 'Ingestion', tech: 'PyMuPDF + pdfplumber', why: 'Layout-aware for multi-column legal PDFs. MIT-licensed, on-premise.', icon: <FileText size={18} />, color: '#6c63ff' },
  { layer: 'OCR', tech: 'Tesseract 5 + OpenCV', why: 'Zero cloud dependency. Deskew, denoise, contrast preprocessing. >99% accuracy on clean scans.', icon: <Zap size={18} />, color: '#a78bfa' },
  { layer: 'NLP', tech: 'spaCy + Legal-BERT', why: 'Pre-trained on Indian legal corpus. Fine-tuned on Karnataka HC judgments.', icon: <Brain size={18} />, color: '#60a5fa' },
  { layer: 'Action AI', tech: 'Claude Sonnet / Mistral 7B', why: 'De-identified input only. Local LLM fallback for air-gapped deployment.', icon: <GitBranch size={18} />, color: '#34d399' },
  { layer: 'Backend', tech: 'FastAPI + PostgreSQL', why: 'Async workers + auto OpenAPI docs. ACID-compliant append-only audit trail.', icon: <Server size={18} />, color: '#f59e0b' },
  { layer: 'Frontend', tech: 'React + TailwindCSS', why: 'PDF.js in-browser viewer. React Query for async state. Static SPA behind nginx.', icon: <Code size={18} />, color: '#fb923c' },
  { layer: 'Storage', tech: 'MinIO (S3-compatible)', why: 'Encrypted on-premise object storage. Trivial migration to AWS S3 if approved.', icon: <Database size={18} />, color: '#e879f9' },
  { layer: 'Auth', tech: 'Keycloak (OAuth2/OIDC)', why: 'Role-based: Officer, Dept. Head, Admin. Short-lived tokens, refresh rotation.', icon: <Shield size={18} />, color: '#38bdf8' },
  { layer: 'Infra', tech: 'Docker Compose → Kubernetes', why: 'Single compose for dev/demo. Helm chart for NIC infrastructure production.', icon: <Globe size={18} />, color: '#4ade80' },
];

export default function Features() {
  return (
    <div style={{ paddingTop: '60px' }}>
      {/* Hero */}
      <section style={{
        padding: '5rem 2rem 4rem', textAlign: 'center',
        background: 'var(--hero-bg)',
        position: 'relative', overflow: 'hidden'
      }} className="mesh-bg">
        <div className="glow-orb animate-drift" style={{ width: 500, height: 500, background: 'var(--hero-orb)', top: -150, left: '50%', transform: 'translateX(-50%)' }} />
        <div style={{ position: 'relative' }}>
          <p className="section-label">Features</p>
          <h1 className="section-title">
            Every layer built for<br /><span className="gradient-text">legal trust</span>
          </h1>
          <p className="section-subtitle" style={{ margin: '1.25rem auto 0', textAlign: 'center' }}>
            Open-source, on-premise, with no PII exposure to external APIs.
          </p>
        </div>
      </section>

      {/* Tech stack */}
      <section style={{ padding: '5rem 2rem', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p className="section-label" style={{ textAlign: 'center' }}>Technology Stack</p>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            On-premise. <span className="gradient-text">Open-source.</span> Auditable.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {STACK.map(s => (
              <div key={s.layer} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                  background: `${s.color}15`, border: `1px solid ${s.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color
                }}>{s.icon}</div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.15rem' }}>{s.layer}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>{s.tech}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55, display: 'block' }}>{s.why}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
