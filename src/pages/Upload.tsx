import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Loader, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Stage = 'idle' | 'uploading' | 'ocr' | 'nlp' | 'done' | 'error';

const STAGES: { key: Stage; label: string; sub: string }[] = [
  { key: 'uploading', label: 'Uploading & storing', sub: 'MinIO encrypted storage' },
  { key: 'ocr', label: 'OCR + preprocessing', sub: 'Tesseract 5 + OpenCV deskew' },
  { key: 'nlp', label: 'NLP extraction', sub: 'Legal-BERT field tagging' },
  { key: 'done', label: 'Action plan ready', sub: 'Human review required' },
];

export default function UploadPage() {
  const { markPdfReady, setResult } = useAuth();
  const [stage, setStage] = useState<Stage>('idle');
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const processFile = async (file: File) => {
    setFileName(file.name);
    setStage('uploading');
    markPdfReady(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step 1: Upload & Process
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      setStage('ocr');
      await new Promise(r => setTimeout(r, 800)); // Visual pause for UX
      
      setStage('nlp');
      const data = await response.json();
      
      // Step 2: Save result
      setResult({
        ...data,
        pdfUrl: `/judgments/${data.id}/pdf`,
        textUrl: `/judgments/${data.id}/text`,
        previewText: data.preview_text,
      });
      
      setStage('done');
      markPdfReady(true);
    } catch (err) {
      console.error(err);
      setStage('error');
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf') { setStage('error'); return; }
    processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const stageIndex = STAGES.findIndex(s => s.key === stage);

  return (
    <div style={{ paddingTop: '60px', minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem' }}>
          Upload Judgment PDF
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2.5rem' }}>
          Digital or scanned — JudgeAI handles both. Max 50MB.
        </p>

        {stage === 'idle' && (
          <div
            className={`upload-zone ${dragging ? 'dragging' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'var(--accent-glow)', border: '1px solid rgba(108,99,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', color: 'var(--accent-light)',
              animation: 'float 3s ease-in-out infinite'
            }}>
              <Upload size={26} />
            </div>
            <p style={{ fontWeight: 700, fontSize: '1.05rem', margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
              Drop your judgment PDF here
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
              or click to browse · PDF only · max 50 MB
            </p>
          </div>
        )}

        {(stage !== 'idle' && stage !== 'error') && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <FileText size={16} color="var(--accent)" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fileName}</span>
              {stage === 'done' && <span className="badge badge-green" style={{ marginLeft: 'auto' }}><CheckCircle size={11} /> Complete</span>}
            </div>

            {STAGES.map((s, i) => {
              const done = stageIndex > i || stage === 'done';
              const active = STAGES[stageIndex]?.key === s.key && stage !== 'done';
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: done ? 'var(--green-bg)' : active ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                    border: `1px solid ${done ? 'rgba(16,185,129,0.4)' : active ? 'rgba(108,99,255,0.4)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: done ? 'var(--green)' : active ? 'var(--accent-light)' : 'var(--text-muted)'
                  }}>
                    {done ? <CheckCircle size={14} /> : active
                      ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      : <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{i + 1}</span>
                    }
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: done ? 'var(--green)' : active ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.sub}</p>
                  </div>
                </div>
              );
            })}

            {stage === 'done' && (
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                <Link to="/dashboard" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Review Extracted Fields <ArrowRight size={15} />
                </Link>
                <button className="btn btn-ghost" onClick={() => { setStage('idle'); setFileName(''); markPdfReady(false); }}>
                  Upload Another
                </button>
              </div>
            )}
          </div>
        )}

        {stage === 'error' && (
          <div style={{
            background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 14, padding: '1.5rem', textAlign: 'center'
          }}>
            <AlertTriangle size={28} color="var(--red)" style={{ marginBottom: '0.75rem' }} />
            <p style={{ color: 'var(--red)', fontWeight: 700, margin: '0 0 0.5rem' }}>Invalid file type</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 1rem' }}>Only PDF files are accepted.</p>
            <button className="btn btn-ghost" onClick={() => { setStage('idle'); navigate('/upload'); }}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}
