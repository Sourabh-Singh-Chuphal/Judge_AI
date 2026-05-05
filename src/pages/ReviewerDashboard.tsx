import { useState } from 'react';
import {
  FileText, CheckCircle, XCircle, Edit3, AlertTriangle,
  Clock, User, Building, Scale, Calendar, ChevronDown, ChevronUp, Info
} from 'lucide-react';

interface Field {
  id: string;
  label: string;
  value: string;
  confidence: number;
  editable: boolean;
}

const MOCK_FIELDS: Field[] = [
  { id: 'case_id', label: 'Case ID', value: 'WP/12345/2024', confidence: 97, editable: false },
  { id: 'petitioner', label: 'Petitioner', value: 'Sri Ramesh Kumar', confidence: 91, editable: true },
  { id: 'respondent', label: 'Respondent', value: 'State of Karnataka, Revenue Dept.', confidence: 88, editable: true },
  { id: 'date_judgment', label: 'Judgment Date', value: '2024-03-15', confidence: 95, editable: true },
  { id: 'compliance_deadline', label: 'Compliance Deadline', value: '2024-06-15 (90 days)', confidence: 64, editable: true },
  { id: 'responsible_dept', label: 'Responsible Department', value: 'Revenue & Disaster Mgmt.', confidence: 72, editable: true },
  { id: 'directive', label: 'Core Directive', value: 'Issue caste certificate within 30 days of application receipt per Rule 7(2).', confidence: 43, editable: true },
  { id: 'action_path', label: 'Action Path', value: 'COMPLY', confidence: 89, editable: false },
  { id: 'appeal_deadline', label: 'Appeal Deadline (if applicable)', value: 'N/A', confidence: 55, editable: true },
  { id: 'bench', label: 'Bench', value: 'Hon\'ble Justice S.R. Krishnakumar', confidence: 82, editable: true },
];

const MOCK_ACTION_PLAN = {
  path: 'COMPLY',
  summary: 'The judgment directs the Revenue Department to issue a caste certificate within 30 days. No grounds for appeal identified. Recommend immediate compliance.',
  steps: [
    'Assign case to Revenue Dept. nodal officer',
    'Acknowledge receipt within 7 days (by 2024-03-22)',
    'Issue certificate within 30 days of application (per Rule 7(2))',
    'File compliance report with HC Registry by 2024-06-15',
  ],
  risks: ['Certificate issuance pending verification — sub-30-day risk if records are incomplete.'],
};

function confidenceClass(c: number) {
  if (c >= 70) return 'high';
  if (c >= 50) return 'amber';
  return 'low';
}

function confidenceBadgeClass(c: number) {
  if (c >= 70) return 'badge badge-green';
  if (c >= 50) return 'badge badge-amber';
  return 'badge badge-red';
}

function confidenceIcon(c: number) {
  if (c >= 70) return null;
  if (c >= 50) return <AlertTriangle size={11} />;
  return <AlertTriangle size={11} />;
}

export default function ReviewerDashboard() {
  const [fields, setFields] = useState<Field[]>(MOCK_FIELDS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'editing'>('pending');
  const [showPlan, setShowPlan] = useState(true);

  const startEdit = (f: Field) => {
    setEditingId(f.id);
    setEditValue(f.value);
  };

  const saveEdit = (id: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, value: editValue } : f));
    setEditingId(null);
  };

  const handleApprove = () => setStatus('approved');
  const handleReject = () => setStatus('rejected');

  const lowConf = fields.filter(f => f.confidence < 50).length;
  const amberConf = fields.filter(f => f.confidence >= 50 && f.confidence < 70).length;

  return (
    <div style={{ paddingTop: '60px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
              Reviewer Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
              Case WP/12345/2024 · Assigned to you · Received 2024-03-16
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {status === 'pending' && (
              <>
                {lowConf > 0 && <span className="badge badge-red"><AlertTriangle size={11} /> {lowConf} mandatory review</span>}
                {amberConf > 0 && <span className="badge badge-amber"><AlertTriangle size={11} /> {amberConf} amber flags</span>}
              </>
            )}
            {status === 'approved' && <span className="badge badge-green" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}><CheckCircle size={13} /> Approved & Sent</span>}
            {status === 'rejected' && <span className="badge badge-red" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}><XCircle size={13} /> Rejected</span>}
          </div>
        </div>

        {/* Approval banner */}
        {status === 'pending' && lowConf > 0 && (
          <div style={{
            background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '0.85rem 1.25rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <AlertTriangle size={16} color="var(--red)" />
            <span style={{ color: 'var(--red)', fontSize: '0.875rem', fontWeight: 600 }}>
              {lowConf} field(s) below 50% confidence — mandatory officer review required before approval.
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>

          {/* LEFT — Fields table */}
          <div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={16} color="var(--accent)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Extracted Fields</span>
                <span className="badge badge-muted" style={{ marginLeft: 'auto' }}>AI Suggests — Officer Decides</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Extracted Value</th>
                    <th>Confidence</th>
                    <th style={{ width: 60 }}>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map(f => (
                    <tr key={f.id}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {f.id === 'case_id' && <Scale size={13} />}
                          {f.id === 'petitioner' && <User size={13} />}
                          {f.id === 'respondent' && <User size={13} />}
                          {f.id === 'compliance_deadline' && <Calendar size={13} />}
                          {f.id === 'responsible_dept' && <Building size={13} />}
                          {f.id === 'date_judgment' && <Clock size={13} />}
                          {f.label}
                        </div>
                      </td>
                      <td>
                        {editingId === f.id ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              className="input" style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                              value={editValue} onChange={e => setEditValue(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && saveEdit(f.id)}
                              autoFocus
                            />
                            <button className="btn btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => saveEdit(f.id)}>✓</button>
                            <button className="btn btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setEditingId(null)}>✕</button>
                          </div>
                        ) : (
                          <span style={{
                            color: f.confidence < 50 ? 'var(--red)' : f.confidence < 70 ? 'var(--amber)' : 'var(--text-primary)',
                            fontWeight: f.confidence < 70 ? 600 : 400, fontSize: '0.875rem'
                          }}>{f.value}</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 100 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span className={confidenceBadgeClass(f.confidence)}>
                              {confidenceIcon(f.confidence)} {f.confidence}%
                            </span>
                          </div>
                          <div className="confidence-bar">
                            <div className={`confidence-fill ${confidenceClass(f.confidence)}`} style={{ width: `${f.confidence}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        {f.editable && editingId !== f.id && (
                          <button className="btn btn-ghost" style={{ padding: '0.3rem 0.5rem' }} onClick={() => startEdit(f)}>
                            <Edit3 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Approve / Reject */}
            {status === 'pending' && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                <button className="btn btn-success" style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }} onClick={handleApprove}>
                  <CheckCircle size={16} /> Approve & Send to Department
                </button>
                <button className="btn btn-danger" style={{ justifyContent: 'center', padding: '0.85rem 1.5rem' }} onClick={handleReject}>
                  <XCircle size={16} /> Reject
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — PDF viewer + action plan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Mock PDF Viewer */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={14} color="var(--accent)" />
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Judgment PDF</span>
                <span className="badge badge-muted" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>WP_12345_2024.pdf</span>
              </div>
              <div style={{
                height: 320, background: '#f5f5f0',
                display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '1.5rem',
                fontFamily: 'Georgia, serif', color: '#1a1a1a', fontSize: '0.78rem', lineHeight: 1.8,
                position: 'relative'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <p style={{ fontWeight: 700, margin: '0 0 0.25rem', fontSize: '0.85rem' }}>IN THE HIGH COURT OF KARNATAKA AT BENGALURU</p>
                  <p style={{ margin: '0 0 0.25rem' }}>DATED THIS THE 15TH DAY OF MARCH, 2024</p>
                  <p style={{ margin: 0 }}>BEFORE THE HON'BLE JUSTICE S.R. KRISHNAKUMAR</p>
                </div>
                <p style={{ margin: '0.75rem 0' }}><strong>WRIT PETITION No. 12345/2024</strong></p>
                <p style={{ margin: '0.5rem 0' }}>
                  <strong>BETWEEN:</strong><br />
                  Sri Ramesh Kumar, S/o Late Govinda Kumar,<br />
                  R/o No. 14, 3rd Cross, Yelahanka, Bengaluru — 560064
                  <br /><span style={{ fontStyle: 'italic' }}>... Petitioner</span>
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                  <strong>AND:</strong><br />
                  State of Karnataka, Rep. by its Secretary,<br />
                  Dept. of Revenue & Disaster Management, Bengaluru
                  <br /><span style={{ fontStyle: 'italic' }}>... Respondent</span>
                </p>
                <div style={{
                  background: 'rgba(108,99,255,0.12)', border: '2px solid rgba(108,99,255,0.4)',
                  borderRadius: 6, padding: '0.5rem 0.75rem', margin: '0.75rem 0'
                }}>
                  <p style={{ margin: 0, color: '#3a3090' }}><strong>ORDER</strong><br />
                  The respondent is directed to issue the caste certificate to the petitioner within <strong>30 days</strong> of receipt of application, in accordance with Rule 7(2) of the Karnataka Scheduled Castes and Scheduled Tribes (Regulation of Issue of Caste Certificate) Rules, 2002.</p>
                </div>
                <p style={{ margin: '0.5rem 0', color: '#555' }}>The petition is accordingly disposed of. No costs.</p>
                <p style={{ margin: '0.5rem 0', textAlign: 'right', fontWeight: 700 }}>Sd/-<br />JUDGE</p>
              </div>
            </div>

            {/* Action Plan */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <button
                onClick={() => setShowPlan(p => !p)}
                style={{
                  width: '100%', padding: '1rem 1.25rem',
                  borderBottom: showPlan ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)'
                }}
              >
                <Scale size={14} color="var(--accent)" />
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>AI Action Plan</span>
                <span className="badge badge-green" style={{ marginLeft: 'auto' }}>{MOCK_ACTION_PLAN.path}</span>
                {showPlan ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
              </button>
              {showPlan && (
                <div style={{ padding: '1.25rem' }}>
                  <div style={{
                    background: 'var(--bg-secondary)', borderRadius: 10, padding: '0.85rem',
                    marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start'
                  }}>
                    <Info size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <em>AI suggests</em>: {MOCK_ACTION_PLAN.summary}
                    </p>
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>Steps</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {MOCK_ACTION_PLAN.steps.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                        <span style={{
                          width: 18, height: 18, borderRadius: 6,
                          background: 'var(--accent-glow)', border: '1px solid rgba(108,99,255,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-light)', flexShrink: 0
                        }}>{i + 1}</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                  {MOCK_ACTION_PLAN.risks.map((r, i) => (
                    <div key={i} style={{
                      background: 'var(--amber-bg)', border: '1px solid rgba(245,158,11,0.25)',
                      borderRadius: 8, padding: '0.65rem 0.85rem',
                      display: 'flex', gap: '0.5rem', alignItems: 'flex-start'
                    }}>
                      <AlertTriangle size={13} color="var(--amber)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--amber)', lineHeight: 1.5 }}>{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
