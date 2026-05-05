import { useState } from 'react';
import { Lock, Hash, CheckCircle, Clock, Search } from 'lucide-react';

const AUDIT_ENTRIES = [
  { id: 'AUD-001', action: 'JUDGMENT_UPLOADED', actor: 'sys.ingest', caseId: 'WP/12345/2024', ts: '2024-03-16 09:02:14', hash: 'a1b2c3d4', status: 'system' },
  { id: 'AUD-002', action: 'OCR_COMPLETED', actor: 'sys.ocr', caseId: 'WP/12345/2024', ts: '2024-03-16 09:02:31', hash: 'e5f6a7b8', status: 'system' },
  { id: 'AUD-003', action: 'NLP_EXTRACTION', actor: 'sys.nlp', caseId: 'WP/12345/2024', ts: '2024-03-16 09:02:45', hash: 'c9d0e1f2', status: 'system' },
  { id: 'AUD-004', action: 'ASSIGNED_TO_OFFICER', actor: 'admin@karnataka.gov.in', caseId: 'WP/12345/2024', ts: '2024-03-16 09:15:00', hash: '3a4b5c6d', status: 'officer' },
  { id: 'AUD-005', action: 'FIELD_EDITED', actor: 'officer.ramesh@rev.kgov.in', caseId: 'WP/12345/2024', ts: '2024-03-16 10:34:22', hash: '7e8f9a0b', status: 'officer', detail: 'compliance_deadline updated' },
  { id: 'AUD-006', action: 'APPROVED', actor: 'officer.ramesh@rev.kgov.in', caseId: 'WP/12345/2024', ts: '2024-03-16 10:41:05', hash: '1c2d3e4f', status: 'approved' },
  { id: 'AUD-007', action: 'SENT_TO_DEPARTMENT', actor: 'sys.dispatch', caseId: 'WP/12345/2024', ts: '2024-03-16 10:41:06', hash: '5a6b7c8d', status: 'system' },
  { id: 'AUD-008', action: 'JUDGMENT_UPLOADED', actor: 'sys.ingest', caseId: 'WP/11980/2024', ts: '2024-03-15 14:10:00', hash: '9e0f1a2b', status: 'system' },
  { id: 'AUD-009', action: 'NLP_EXTRACTION', actor: 'sys.nlp', caseId: 'WP/11980/2024', ts: '2024-03-15 14:10:28', hash: '3c4d5e6f', status: 'system' },
  { id: 'AUD-010', action: 'REJECTED', actor: 'officer.priya@rev.kgov.in', caseId: 'WP/11980/2024', ts: '2024-03-15 16:22:11', hash: '7a8b9c0d', status: 'rejected', detail: 'Incorrect respondent identified' },
];

function statusColor(s: string) {
  if (s === 'approved') return 'badge-green';
  if (s === 'rejected') return 'badge-red';
  if (s === 'officer') return 'badge-amber';
  return 'badge-muted';
}

function actionIcon(a: string) {
  if (a.includes('APPROVED')) return <CheckCircle size={13} color="var(--green)" />;
  if (a.includes('REJECTED')) return <span style={{ color: 'var(--red)', fontSize: 13 }}>✕</span>;
  if (a.includes('EDITED')) return <span style={{ color: 'var(--amber)', fontSize: 13 }}>✎</span>;
  return <Clock size={13} color="var(--text-muted)" />;
}

export default function AuditLog() {
  const [search, setSearch] = useState('');
  const filtered = AUDIT_ENTRIES.filter(e =>
    e.action.toLowerCase().includes(search.toLowerCase()) ||
    e.caseId.toLowerCase().includes(search.toLowerCase()) ||
    e.actor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingTop: '60px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--accent-glow)', border: '1px solid rgba(108,99,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-light)'
            }}><Lock size={16} /></div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Audit Log</h1>
            <span className="badge badge-green"><CheckCircle size={11} /> Tamper-evident</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Append-only PostgreSQL with hash chain. RTI-compliant immutable record of every action.
          </p>
        </div>

        {/* Hash chain info */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Hash size={14} color="var(--accent)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chain head:</span>
            <code style={{ fontSize: '0.8rem', color: 'var(--accent-light)', background: 'var(--accent-glow)', padding: '0.1rem 0.4rem', borderRadius: 4 }}>7a8b9c0d…</code>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>10</span> events · <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>2</span> cases
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
            <span className="status-dot green" />
            <span style={{ fontSize: '0.8rem', color: 'var(--green)' }}>Chain integrity verified</span>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.25rem', maxWidth: 400 }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input id="audit-search" className="input" placeholder="Search by action, case ID, or actor…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }} />
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Case ID</th>
                <th>Timestamp</th>
                <th>Hash</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td><code style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{e.id}</code></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {actionIcon(e.action)}
                      <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>{e.action}</span>
                    </div>
                    {e.detail && <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{e.detail}</div>}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{e.actor}</td>
                  <td><span className="badge badge-accent" style={{ fontSize: '0.73rem' }}>{e.caseId}</span></td>
                  <td style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{e.ts}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Hash size={11} color="var(--text-muted)" />
                      <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.hash}…</code>
                    </div>
                  </td>
                  <td><span className={`badge ${statusColor(e.status)}`}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No matching audit events.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
