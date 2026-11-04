import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { parseERPClipboard, codeRabbitAudit, calculateERPStats } from '../utils/erpEngine';
import toast from 'react-hot-toast';
import {
  ClipboardPaste,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileText,
  Trash2,
  BookOpen,
  FlaskConical,
  Layers
} from 'lucide-react';

const RAW_SAMPLE_ERP = `SNo\tSubject Code\tSubject Name\tType\tPresent\tOD\tMakeup\tAbsent\tConducted\t%
1\tCRT\tCRT Lab\tLab\t60\t0\t6\t22\t82\t80.49
2\tITUL501\tSoftware Engineering\tLecture\t27\t0\t0\t14\t41\t65.85
3\tITUL502\tComputer Networks\tLecture\t33\t0\t0\t9\t42\t78.57
4\tITUL503\tOperating Systems\tLecture\t26\t0\t0\t14\t40\t65.00
5\tITUL504\tTheory of Computation\tLecture\t25\t0\t0\t2\t27\t92.59
6\tITUL511\tData Analytics\tLecture\t35\t0\t0\t5\t40\t87.50
7\tITUP520\tSE Lab\tLab\t20\t0\t0\t8\t28\t71.43
8\tITUP521\tCN Lab\tLab\t12\t0\t0\t16\t28\t42.86
9\tITUP522\tOS Lab\tLab\t20\t0\t0\t6\t26\t76.92
10\tITUP523\tTOC Lab\tLab\t22\t0\t0\t6\t28\t78.57
11\tITUT530\tTutorial\tLab\t12\t0\t0\t2\t14\t85.71
12\tMEUL560.2\tUniversal Human Values\tLecture\t25\t0\t0\t15\t40\t62.50`;

export default function ERPParser() {
  const [rawText, setRawText] = useState('');
  const [parsedSubjects, setParsedSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState('all'); // 'all' | 'lectures' | 'labs'
  const navigate = useNavigate();

  const handleParse = (textToParse = rawText) => {
    if (!textToParse.trim()) {
      toast.error('Please paste your ERP attendance data first');
      return;
    }
    const subjects = parseERPClipboard(textToParse);
    if (subjects.length === 0) {
      toast.error('Could not find valid subject rows in clipboard. Check format.');
      return;
    }
    setParsedSubjects(subjects);
    toast.success(`Successfully parsed & separated ${subjects.length} courses!`);
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
        `Synced! Upserted: ${res.data.upsertedCount || 0}, Updated: ${res.data.modifiedCount || 0}`
      );
      navigate('/');
    } catch {
      localStorage.setItem('attendify_subjects', JSON.stringify(parsedSubjects));
      toast.success(`Synced ${parsedSubjects.length} courses (Local Mode)`);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all saved subjects?')) return;
    try {
      await api.delete('/subjects/all');
    } catch {
      // offline clear
    }
    localStorage.removeItem('attendify_subjects');
    setParsedSubjects([]);
    setRawText('');
    toast.success('All records cleared');
  };

  const audit = parsedSubjects.length > 0 ? codeRabbitAudit(parsedSubjects) : null;

  // Separate Lectures and Labs from the parsed data
  const lectures = useMemo(() => parsedSubjects.filter(s => s.type === 'Lecture'), [parsedSubjects]);
  const labs = useMemo(() => parsedSubjects.filter(s => s.type === 'Lab'), [parsedSubjects]);

  const displayedList = useMemo(() => {
    if (previewTab === 'lectures') return lectures;
    if (previewTab === 'labs') return labs;
    return parsedSubjects;
  }, [previewTab, lectures, labs, parsedSubjects]);

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ClipboardPaste color="var(--accent-secondary)" /> ERP Clipboard Parser
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Copy the attendance table directly from your SKIT student portal. The system automatically categorizes
          and separates <strong>Theory Lectures</strong> (1h) from <strong>Practical Labs</strong> (2h).
        </p>
      </div>

      <div className="erp-paste-section">
        <textarea
          rows={6}
          placeholder="Paste raw attendance text from ERP portal (Ctrl+V) or click 'Load SKIT Sample' below..."
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
        />

        <div className="erp-paste-actions" style={{ flexWrap: 'wrap' }}>
          <button onClick={() => handleParse()} className="btn btn-primary">
            <ClipboardPaste size={15} style={{ marginRight: '6px' }} /> Parse & Separate Courses
          </button>
          <button onClick={handleSample} className="btn btn-secondary">
            <FileText size={15} style={{ marginRight: '6px' }} /> Load SKIT Sample (12 Courses)
          </button>
          <button onClick={() => { setRawText(''); setParsedSubjects([]); }} className="btn btn-secondary">
            Clear Input
          </button>
          <button onClick={handleClearAll} className="btn btn-danger" style={{ marginLeft: 'auto' }}>
            <Trash2 size={15} style={{ marginRight: '6px' }} /> Wipe Records
          </button>
        </div>
      </div>

      {audit && (
        <div style={{ marginBottom: '24px' }}>
          <div
            className={`audit-badge ${audit.verified ? 'verified' : 'error'}`}
            style={{ marginBottom: '16px' }}
          >
            <ShieldCheck size={16} />
            <span>Data Verification: {audit.badge} ({audit.passCount}/{audit.totalChecks} checks passed)</span>
          </div>
        </div>
      )}

      {parsedSubjects.length > 0 && (
        <div className="card fade-in" style={{ marginBottom: '32px', borderRadius: '40px', padding: '28px' }}>
          {/* Header & Tab Controls for Lecture / Lab Separation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setPreviewTab('all')}
                className={`btn btn-sm ${previewTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Layers size={13} style={{ marginRight: '4px' }} /> All ({parsedSubjects.length})
              </button>
              <button
                onClick={() => setPreviewTab('lectures')}
                className={`btn btn-sm ${previewTab === 'lectures' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: previewTab === 'lectures' ? 'none' : '1px solid rgba(21, 88, 201, 0.4)' }}
              >
                <BookOpen size={13} style={{ marginRight: '4px' }} /> Theory Lectures ({lectures.length})
              </button>
              <button
                onClick={() => setPreviewTab('labs')}
                className={`btn btn-sm ${previewTab === 'labs' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: previewTab === 'labs' ? 'none' : '1px solid rgba(212, 255, 36, 0.4)' }}
              >
                <FlaskConical size={13} style={{ marginRight: '4px' }} /> Practical Labs ({labs.length})
              </button>
            </div>

            <button
              onClick={handleSync}
              disabled={loading}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <UploadCloud size={16} />
              {loading ? 'Syncing...' : 'Sync to Calculator'}
            </button>
          </div>

          {/* Separated Preview Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 10px' }}>Category</th>
                  <th style={{ padding: '12px 10px' }}>Course Code</th>
                  <th style={{ padding: '12px 10px' }}>Course Name</th>
                  <th style={{ padding: '12px 10px' }}>Weight</th>
                  <th style={{ padding: '12px 10px' }}>Present</th>
                  <th style={{ padding: '12px 10px' }}>OD</th>
                  <th style={{ padding: '12px 10px' }}>Makeup</th>
                  <th style={{ padding: '12px 10px' }}>Absent</th>
                  <th style={{ padding: '12px 10px' }}>Attended (A)</th>
                  <th style={{ padding: '12px 10px' }}>Total (T)</th>
                  <th style={{ padding: '12px 10px' }}>Percentage</th>
                  <th style={{ padding: '12px 10px' }}>Status</th>
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
                        borderBottom: '1px solid rgba(21, 88, 201, 0.15)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(21, 88, 201, 0.04)',
                      }}
                    >
                      <td style={{ padding: '12px 10px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            background: isLab ? 'rgba(212, 255, 36, 0.12)' : 'rgba(21, 88, 201, 0.2)',
                            color: isLab ? 'var(--accent-secondary)' : '#6da2ff',
                            border: `1px solid ${isLab ? 'rgba(212, 255, 36, 0.3)' : 'rgba(21, 88, 201, 0.3)'}`,
                          }}
                        >
                          {isLab ? 'LAB' : 'THEORY'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 800 }}>{s.code}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{s.name}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{s.stepWeight}h</td>
                      <td style={{ padding: '12px 10px' }}>{s.present}</td>
                      <td style={{ padding: '12px 10px' }}>{s.od || 0}</td>
                      <td style={{ padding: '12px 10px' }}>{s.makeup || 0}</td>
                      <td style={{ padding: '12px 10px' }}>{s.absent}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                        {stats.attended}
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 700 }}>{stats.totalConducted}</td>
                      <td
                        style={{
                          padding: '12px 10px',
                          fontWeight: 800,
                          color: isSafe ? 'var(--safe-zone)' : 'var(--shortage)',
                        }}
                      >
                        {stats.percentage}%
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {isSafe ? (
                          <span style={{ color: 'var(--accent-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            <CheckCircle2 size={14} /> Safe
                          </span>
                        ) : (
                          <span style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            <AlertTriangle size={14} /> Shortage
                          </span>
                        )}
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
