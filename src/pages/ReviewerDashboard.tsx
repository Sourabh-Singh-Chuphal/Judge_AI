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

const MOCK_FIELDS: Field[] = []; // Empty by default

const MOCK_ACTION_PLAN = null;

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

import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

// ... (keep existing interface and helper functions)

export default function ReviewerDashboard() {
  const { currentResult } = useAuth();
  const [fields, setFields] = useState<Field[]>(MOCK_FIELDS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'editing'>('pending');
  const [showPlan, setShowPlan] = useState(true);

  useEffect(() => {
    if (currentResult && currentResult.extraction) {
      const ext = currentResult.extraction;
      const dynamicFields: Field[] = [
        { id: 'case_id', label: 'Case ID', value: ext.case_id.value, confidence: Math.round(ext.case_id.confidence * 100), editable: false },
        { id: 'petitioner', label: 'Petitioner', value: ext.petitioner.value, confidence: Math.round(ext.petitioner.confidence * 100), editable: true },
        { id: 'respondent', label: 'Respondent', value: ext.respondent.value, confidence: Math.round(ext.respondent.confidence * 100), editable: true },
        { id: 'date_judgment', label: 'Judgment Date', value: ext.judgment_date.value, confidence: Math.round(ext.judgment_date.confidence * 100), editable: true },
        { id: 'compliance_deadline', label: 'Compliance Deadline', value: ext.compliance_deadline.value, confidence: Math.round(ext.compliance_deadline.confidence * 100), editable: true },
        { id: 'responsible_dept', label: 'Responsible Department', value: ext.responsible_department.value, confidence: Math.round(ext.responsible_department.confidence * 100), editable: true },
        { id: 'directive', label: 'Core Directive', value: ext.core_directive.value, confidence: Math.round(ext.core_directive.confidence * 100), editable: true },
      ];
      setFields(dynamicFields);
    }
  }, [currentResult]);

  const plan = currentResult?.action_plan || MOCK_ACTION_PLAN;

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

        {/* No Data State */}
        {!currentResult && (
          <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Extraction Data Available</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Please upload a judgment PDF to begin the AI audit process.</p>
            <Link to="/upload" className="btn btn-primary" style={{ display: 'inline-flex' }}>Upload PDF Now</Link>
          </div>
        )}

        {currentResult && (
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

            {/* PDF Viewer */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={14} color="var(--accent)" />
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Judgment PDF</span>
                <span className="badge badge-muted" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>{currentResult?.filename || 'WP_12345_2024.pdf'}</span>
              </div>
              <div style={{ height: 500, background: '#f5f5f0' }}>
                {currentResult?.fileUrl ? (
                  <iframe 
                    src={currentResult.fileUrl} 
                    title="PDF Preview" 
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                ) : (
                  <div style={{
                    height: '100%', display: 'flex', flexDirection: 'column', 
                    overflow: 'auto', padding: '1.5rem', fontFamily: 'Georgia, serif', 
                    color: '#1a1a1a', fontSize: '0.78rem', lineHeight: 1.8
                  }}>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Mock preview shown (Upload a file for real preview)</p>
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                      <p style={{ fontWeight: 700, margin: '0 0 0.25rem' }}>IN THE HIGH COURT OF KARNATAKA AT BENGALURU</p>
                      <p>DATED THIS THE 15TH DAY OF MARCH, 2024</p>
                    </div>
                  </div>
                )}
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
                      <em>AI suggests</em>: {plan.summary}
                    </p>
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>Steps</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {plan.steps.map((s: any, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                        <span style={{
                          width: 18, height: 18, borderRadius: 6,
                          background: 'var(--accent-glow)', border: '1px solid rgba(108,99,255,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-light)', flexShrink: 0
                        }}>{i + 1}</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {typeof s === 'string' ? s : s.description}
                        </span>
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
        )}
      </div>
    </div>
  );
}
