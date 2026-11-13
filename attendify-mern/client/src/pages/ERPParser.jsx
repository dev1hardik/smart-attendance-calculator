import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { parseERPClipboard, codeRabbitAudit, calculateERPStats } from '../utils/erpEngine';
import toast from 'react-hot-toast';
import {
  Feather,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileText,
  Trash2,
  BookOpen,
  FlaskConical,
  Layers,
  Sparkles
} from 'lucide-react';

const RAW_SAMPLE_ERP = `SNo\tSubject Code\tSubject Name\tType\tPresent\tOD\tMakeup\tAbsent\tConducted\t%
1\tCRT\tCRT Practical Lab\tLab\t60\t0\t6\t22\t82\t80.49
2\tCS501\tSoftware Engineering\tLecture\t27\t0\t0\t14\t41\t65.85
3\tCS502\tComputer Networks\tLecture\t33\t0\t0\t9\t42\t78.57
4\tCS503\tOperating Systems\tLecture\t26\t0\t0\t14\t40\t65.00
5\tCS504\tTheory of Computation\tLecture\t25\t0\t0\t2\t27\t92.59
6\tCS511\tData Analytics & ML\tLecture\t35\t0\t0\t5\t40\t87.50
7\tCS520\tSE Research Lab\tLab\t20\t0\t0\t8\t28\t71.43
8\tCS521\tNetwork Protocol Lab\tLab\t12\t0\t0\t16\t28\t42.86
9\tCS522\tOS Kernel Lab\tLab\t20\t0\t0\t6\t26\t76.92
10\tCS523\tComputation Theory Lab\tLab\t22\t0\t0\t6\t28\t78.57
11\tCS530\tAcademic Seminar\tLab\t12\t0\t0\t2\t14\t85.71
12\tHU560\tUniversal Human Values\tLecture\t25\t0\t0\t15\t40\t62.50`;

export default function ERPParser() {
  const [rawText, setRawText] = useState('');
  const [parsedSubjects, setParsedSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState('all'); // 'all' | 'lectures' | 'labs'
  const navigate = useNavigate();

  const handleParse = (textToParse = rawText) => {
    if (!textToParse.trim()) {
      toast.error('Please paste your portal attendance records first');
      return;
    }
    const subjects = parseERPClipboard(textToParse);
    if (subjects.length === 0) {
      toast.error('Could not identify valid tabular records in clipboard text.');
      return;
    }
    setParsedSubjects(subjects);
    toast.success(`Parsed & structured ${subjects.length} course specimens!`);
  };

  const handleSample = () => {
    setRawText(RAW_SAMPLE_ERP);
    handleParse(RAW_SAMPLE_ERP);
  };

  const handleSync = async () => {
    if (parsedSubjects.length === 0) {
      toast.error('No courses parsed to sync');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/subjects/bulk-import', { subjects: parsedSubjects });
      localStorage.setItem('attendify_subjects', JSON.stringify(parsedSubjects));
      toast.success(
        `Synced to Atelier! (${res.data.upsertedCount || parsedSubjects.length} courses active)`
      );
      navigate('/');
    } catch {
      localStorage.setItem('attendify_subjects', JSON.stringify(parsedSubjects));
      toast.success(`Synced ${parsedSubjects.length} courses (Local Atelier Mode)`);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Wipe all course records from your atelier?')) return;
    try {
      await api.delete('/subjects/all');
    } catch {
      // offline clear
    }
    localStorage.removeItem('attendify_subjects');
    setParsedSubjects([]);
    setRawText('');
    toast.success('Atelier storage wiped clean');
  };

  const audit = parsedSubjects.length > 0 ? codeRabbitAudit(parsedSubjects) : null;

  // Separate Theory Lectures and Practical Labs
  const lectures = useMemo(() => parsedSubjects.filter((s) => s.type === 'Lecture'), [parsedSubjects]);
  const labs = useMemo(() => parsedSubjects.filter((s) => s.type === 'Lab'), [parsedSubjects]);

  const displayedList = useMemo(() => {
    if (previewTab === 'lectures') return lectures;
    if (previewTab === 'labs') return labs;
    return parsedSubjects;
  }, [previewTab, lectures, labs, parsedSubjects]);

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      {/* Editorial Header */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <div className="atelier-badge">
          <Feather size={13} color="var(--accent-blue)" />
          Botanical Ingestion Chamber
        </div>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '8px' }}>
          ERP Clipboard <em>Ingestion</em>
        </h1>
        <p style={{ maxWidth: '640px', margin: '0 auto', fontSize: '0.95rem' }}>
          Copy the raw attendance table directly from any student portal (<code>Ctrl+A</code>, <code>Ctrl+C</code>).
          The engine automatically structures records and separates <strong>Theory Lectures (1h)</strong> from <strong>Practical Labs (2h)</strong>.
        </p>
      </div>

      {/* Parser Ingestion Card */}
      <div className="parser-box">
        <textarea
          className="parser-textarea"
          rows={6}
          placeholder="Paste raw attendance text from your ERP portal (Ctrl+V) or click 'Curate Sample Dataset' below..."
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => handleParse()} className="btn btn-primary">
            <Feather size={15} /> Parse & Structure Courses
          </button>
          <button onClick={handleSample} className="btn btn-blush">
            <Sparkles size={15} /> Curate Sample Dataset (12 Courses)
          </button>
          <button onClick={() => { setRawText(''); setParsedSubjects([]); }} className="btn btn-secondary">
            Clear Input
          </button>
          <button onClick={handleClearAll} className="btn btn-danger" style={{ marginLeft: 'auto' }}>
            <Trash2 size={15} /> Wipe Atelier Records
          </button>
        </div>
      </div>

      {/* Audit Banner */}
      {audit && (
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              padding: '12px 20px',
              borderRadius: 'var(--radius-pill)',
              background: audit.verified ? 'var(--accent-sage-light)' : 'var(--accent-rose-light)',
              color: audit.verified ? 'var(--accent-sage)' : 'var(--accent-rose)',
              border: `1px solid ${audit.verified ? 'rgba(63, 123, 93, 0.3)' : 'rgba(200, 77, 91, 0.3)'}`,
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShieldCheck size={16} />
            <span>Integrity Check: {audit.badge} ({audit.passCount}/{audit.totalChecks} checks passed)</span>
          </div>
        </div>
      )}

      {/* Parsed Results Section */}
      {parsedSubjects.length > 0 && (
        <div className="glass-panel" style={{ padding: '30px', marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setPreviewTab('all')}
                className={`target-pill ${previewTab === 'all' ? 'active' : ''}`}
              >
                <Layers size={13} style={{ marginRight: '4px' }} /> All ({parsedSubjects.length})
              </button>
              <button
                onClick={() => setPreviewTab('lectures')}
                className={`target-pill ${previewTab === 'lectures' ? 'active' : ''}`}
              >
                <BookOpen size={13} style={{ marginRight: '4px' }} /> Theory ({lectures.length})
              </button>
              <button
                onClick={() => setPreviewTab('labs')}
                className={`target-pill ${previewTab === 'labs' ? 'active' : ''}`}
              >
                <FlaskConical size={13} style={{ marginRight: '4px' }} /> Labs ({labs.length})
              </button>
            </div>

            <button
              onClick={handleSync}
              disabled={loading}
              className="btn btn-primary"
            >
              <UploadCloud size={16} />
              {loading ? 'Committing...' : 'Commit to Active Atelier'}
            </button>
          </div>

          {/* Structured Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(162, 187, 207, 0.35)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 10px' }}>Category</th>
                  <th style={{ padding: '12px 10px' }}>Code</th>
                  <th style={{ padding: '12px 10px' }}>Course Title</th>
                  <th style={{ padding: '12px 10px' }}>Slot Weight</th>
                  <th style={{ padding: '12px 10px' }}>Present</th>
                  <th style={{ padding: '12px 10px' }}>OD</th>
                  <th style={{ padding: '12px 10px' }}>Makeup</th>
                  <th style={{ padding: '12px 10px' }}>Absent</th>
                  <th style={{ padding: '12px 10px' }}>Attended (A)</th>
                  <th style={{ padding: '12px 10px' }}>Total (T)</th>
                  <th style={{ padding: '12px 10px' }}>Percentage</th>
                  <th style={{ padding: '12px 10px' }}>Standing</th>
                </tr>
              </thead>
              <tbody>
                {displayedList.map((s, idx) => {
                  const stats = calculateERPStats(s);
                  const isSafe = stats.percentage >= 75;
                  const isLab = s.type === 'Lab';
                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(162, 187, 207, 0.2)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.45)',
                      }}
                    >
                      <td style={{ padding: '12px 10px' }}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: isLab ? 'var(--accent-blush-light)' : 'var(--accent-blue-light)',
                            color: isLab ? 'var(--accent-blush)' : 'var(--accent-blue)',
                          }}
                        >
                          {isLab ? 'LAB (2h)' : 'THEORY (1h)'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 700 }}>{s.code}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{s.name}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{s.stepWeight}h</td>
                      <td style={{ padding: '12px 10px' }}>{s.present}</td>
                      <td style={{ padding: '12px 10px' }}>{s.od || 0}</td>
                      <td style={{ padding: '12px 10px' }}>{s.makeup || 0}</td>
                      <td style={{ padding: '12px 10px' }}>{s.absent}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--accent-blue)' }}>
                        {stats.attended}
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 700 }}>{stats.totalConducted}</td>
                      <td
                        style={{
                          padding: '12px 10px',
                          fontWeight: 700,
                          color: isSafe ? 'var(--accent-sage)' : 'var(--accent-rose)',
                        }}
                      >
                        {stats.percentage}%
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background: isSafe ? 'var(--accent-sage-light)' : 'var(--accent-rose-light)',
                            color: isSafe ? 'var(--accent-sage)' : 'var(--accent-rose)',
                          }}
                        >
                          {isSafe ? 'Target Met' : 'Shortage'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
