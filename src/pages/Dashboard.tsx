import { Link } from 'react-router-dom';
import { FileText, CheckCircle, Clock, AlertTriangle, Upload, Lock, BarChart2, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function statusBadge(s: string) {
  if (s === 'approved') return <span className="badge badge-green"><CheckCircle size={11} /> Approved</span>;
  if (s === 'rejected') return <span className="badge badge-red">Rejected</span>;
  if (s === 'flagged') return <span className="badge badge-red"><AlertTriangle size={11} /> Flagged</span>;
  return <span className="badge badge-amber"><Clock size={11} /> Pending</span>;
}

const METRICS = [
  { icon: <FileText size={18} />, label: 'Cases Processed', value: '1', delta: 'Current workspace', color: '#6c63ff' },
  { icon: <CheckCircle size={18} />, label: 'Approved', value: '0', delta: 'Awaiting reviewer action', color: '#10b981' },
  { icon: <AlertTriangle size={18} />, label: 'Flagged for Review', value: '0', delta: 'Based on confidence flags', color: '#f59e0b' },
  { icon: <TrendingUp size={18} />, label: 'Avg. Confidence', value: 'Live', delta: 'From uploaded PDF', color: '#60a5fa' },
];

export default function Dashboard() {
  const { currentResult, isPdfReady } = useAuth();
  const activeCase = currentResult?.extraction ? {
    id: currentResult.extraction.case_id.value,
    petitioner: currentResult.extraction.petitioner.value,
    dept: currentResult.extraction.responsible_department.value,
    confidence: Math.round(currentResult.extraction.core_directive.confidence * 100),
    status: currentResult.status?.toLowerCase() || 'pending',
    age: 'now',
  } : null;
  const cases = activeCase ? [activeCase] : [];
  const reviewTarget = isPdfReady && currentResult ? '/dashboard/review' : '/upload';

  return (
    <div style={{ paddingTop: '60px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>Karnataka HC Judgment Processing System</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/audit" className="btn btn-ghost"><Lock size={14} /> Audit Log</Link>
            <Link to="/upload" className="btn btn-primary"><Upload size={14} /> Upload PDF</Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {METRICS.map(m => (
            <div key={m.label} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: `${m.color}15`, border: `1px solid ${m.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color
              }}>{m.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>{activeCase ? m.value : '0'}</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.label}</p>
                <p style={{ margin: '0.1rem 0 0', fontSize: '0.72rem', color: m.color }}>{m.delta}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Current Case</span>
              <Link to={reviewTarget} style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}>
                {activeCase ? 'Open case ->' : 'Upload first ->'}
              </Link>
            </div>

            {cases.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Petitioner</th>
                    <th>Department</th>
                    <th>Confidence</th>
                    <th>Status</th>
                    <th>Age</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map(c => (
                    <tr key={c.id}>
                      <td><code style={{ fontSize: '0.78rem', color: 'var(--accent-light)' }}>{c.id}</code></td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.petitioner}</td>
                      <td>{c.dept}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 80 }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600,
                            color: c.confidence >= 70 ? 'var(--green)' : c.confidence >= 50 ? 'var(--amber)' : 'var(--red)'
                          }}>{c.confidence}%</span>
                          <div className="confidence-bar" style={{ height: 4 }}>
                            <div className={`confidence-fill ${c.confidence >= 70 ? 'high' : c.confidence >= 50 ? 'amber' : 'low'}`}
                              style={{ width: `${c.confidence}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>{statusBadge(c.status)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{c.age}</td>
                      <td>
                        <Link to="/dashboard/review" className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          Review <ArrowRight size={11} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <FileText size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.45 }} />
                <p style={{ margin: '0 0 0.5rem', fontWeight: 700 }}>No uploaded judgment yet</p>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Upload a PDF to create a real review case.
                </p>
                <Link to="/upload" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                  <Upload size={14} /> Upload PDF
                </Link>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card">
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700 }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <Link to="/upload" className="btn btn-primary" style={{ justifyContent: 'center' }}><Upload size={14} /> Upload New PDF</Link>
                <Link to={reviewTarget} className="btn btn-secondary" style={{ justifyContent: 'center' }}><FileText size={14} /> {activeCase ? 'Open Pending Case' : 'Upload First'}</Link>
                <Link to="/audit" className="btn btn-ghost" style={{ justifyContent: 'center' }}><Lock size={14} /> View Audit Log</Link>
              </div>
            </div>

            <div className="card">
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>System Health</h3>
              {[
                { label: 'PDF Extraction', ok: true },
                { label: 'Field Extraction', ok: true },
                { label: 'Judgment Chat', ok: true },
                { label: 'PDF Preview', ok: true },
                { label: 'CCMS API', ok: false, note: 'Sandbox only' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                  <span className={`status-dot ${s.ok ? 'green' : 'amber'}`} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', flex: 1 }}>{s.label}</span>
                  {s.note && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.note}</span>}
                </div>
              ))}
            </div>

            <div className="card" style={{ background: 'var(--accent-glow)', borderColor: 'rgba(108,99,255,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <BarChart2 size={14} color="var(--accent-light)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-light)' }}>Review status</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>
                {activeCase ? '1 uploaded judgment is ready for review.' : 'No judgment has been uploaded in this browser session.'}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Chat answers are grounded in the uploaded PDF text.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
