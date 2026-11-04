import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import SubjectCard from '../components/SubjectCard';
import { calculateAggregate, codeRabbitAudit } from '../utils/erpEngine';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
  Sparkles,
  RefreshCw,
  Layers,
  BookOpen,
  FlaskConical,
  ArrowUpDown,
  Filter,
  ArrowRight,
  Sliders,
  Check
} from 'lucide-react';

const SAMPLE_SKIT_DATA = [
  { code: 'CRT', name: 'CRT Lab', type: 'Lab', stepWeight: 2, present: 60, od: 0, makeup: 6, absent: 22 },
  { code: 'ITUL501', name: 'Software Engineering', type: 'Lecture', stepWeight: 1, present: 27, od: 0, makeup: 0, absent: 14 },
  { code: 'ITUL502', name: 'Computer Networks', type: 'Lecture', stepWeight: 1, present: 33, od: 0, makeup: 0, absent: 9 },
  { code: 'ITUL503', name: 'Operating Systems', type: 'Lecture', stepWeight: 1, present: 26, od: 0, makeup: 0, absent: 14 },
  { code: 'ITUL504', name: 'Theory of Computation', type: 'Lecture', stepWeight: 1, present: 25, od: 0, makeup: 0, absent: 2 },
  { code: 'ITUL511', name: 'Data Analytics', type: 'Lecture', stepWeight: 1, present: 35, od: 0, makeup: 0, absent: 5 },
  { code: 'ITUP520', name: 'SE Lab', type: 'Lab', stepWeight: 2, present: 20, od: 0, makeup: 0, absent: 8 },
  { code: 'ITUP521', name: 'CN Lab', type: 'Lab', stepWeight: 2, present: 12, od: 0, makeup: 0, absent: 16 },
  { code: 'ITUP522', name: 'OS Lab', type: 'Lab', stepWeight: 2, present: 20, od: 0, makeup: 0, absent: 6 },
  { code: 'ITUP523', name: 'TOC Lab', type: 'Lab', stepWeight: 2, present: 22, od: 0, makeup: 0, absent: 6 },
  { code: 'ITUT530', name: 'Tutorial', type: 'Lab', stepWeight: 2, present: 12, od: 0, makeup: 0, absent: 2 },
  { code: 'MEUL560.2', name: 'Universal Human Values', type: 'Lecture', stepWeight: 1, present: 25, od: 0, makeup: 0, absent: 15 }
];

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Evaluation Mode: 'aggregate' or 'subject_wise'
  const [criteriaMode, setCriteriaMode] = useState('aggregate');
  const [targetPercent, setTargetPercent] = useState(75);
  
  // Filter: 'all' | 'lectures' | 'labs' | 'shortage' | 'safe'
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('shortage_first');
  const [showAudit, setShowAudit] = useState(false);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subjects');
      // Normalize subject types
      const normalized = res.data.map(s => ({
        ...s,
        type: s.type || (/lab|practical|tutorial|CRT|UP\d/i.test(s.name || s.code) ? 'Lab' : 'Lecture'),
        stepWeight: s.stepWeight || (/lab|practical|tutorial|CRT|UP\d/i.test(s.name || s.code) ? 2 : 1)
      }));
      setSubjects(normalized);
      localStorage.setItem('attendify_subjects', JSON.stringify(normalized));
    } catch {
      const stored = localStorage.getItem('attendify_subjects');
      if (stored) {
        setSubjects(JSON.parse(stored));
      } else {
        setSubjects(SAMPLE_SKIT_DATA);
        localStorage.setItem('attendify_subjects', JSON.stringify(SAMPLE_SKIT_DATA));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleMark = async (id, field) => {
    try {
      const res = await api.put(`/subjects/${id}/mark`, { field });
      setSubjects((prev) => {
        const next = prev.map((s) => (s._id === id ? res.data : s));
        localStorage.setItem('attendify_subjects', JSON.stringify(next));
        return next;
      });
      toast.success(`Marked ${field} (+${res.data.stepWeight}h)`);
    } catch {
      setSubjects((prev) => {
        const next = prev.map((s) => {
          if ((s._id && s._id === id) || s.code === id) {
            const sw = s.stepWeight || (s.type === 'Lab' ? 2 : 1);
            return { ...s, [field]: (s[field] || 0) + sw };
          }
          return s;
        });
        localStorage.setItem('attendify_subjects', JSON.stringify(next));
        return next;
      });
      toast.success(`Marked ${field}`);
    }
  };

  const handleUnmark = async (id, field) => {
    try {
      const res = await api.put(`/subjects/${id}/unmark`, { field });
      setSubjects((prev) => {
        const next = prev.map((s) => (s._id === id ? res.data : s));
        localStorage.setItem('attendify_subjects', JSON.stringify(next));
        return next;
      });
      toast.success(`Undone ${field} (-${res.data.stepWeight}h)`);
    } catch {
      setSubjects((prev) => {
        const next = prev.map((s) => {
          if ((s._id && s._id === id) || s.code === id) {
            const sw = s.stepWeight || (s.type === 'Lab' ? 2 : 1);
            return { ...s, [field]: Math.max(0, (s[field] || 0) - sw) };
          }
          return s;
        });
        localStorage.setItem('attendify_subjects', JSON.stringify(next));
        return next;
      });
      toast.success(`Undone ${field}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await api.delete(`/subjects/${id}`);
    } catch {
      // offline delete
    }
    setSubjects((prev) => {
      const next = prev.filter((s) => (s._id ? s._id !== id : s.code !== id));
      localStorage.setItem('attendify_subjects', JSON.stringify(next));
      return next;
    });
    toast.success('Course deleted');
  };

  const loadSampleData = async () => {
    try {
      setLoading(true);
      await api.post('/subjects/bulk-import', { subjects: SAMPLE_SKIT_DATA });
      toast.success('Loaded 12 SKIT Subjects!');
      await fetchSubjects();
    } catch {
      setSubjects(SAMPLE_SKIT_DATA);
      localStorage.setItem('attendify_subjects', JSON.stringify(SAMPLE_SKIT_DATA));
      toast.success('Loaded 12 SKIT Subjects (Local Storage)');
      setLoading(false);
    }
  };

  const aggregate = calculateAggregate(subjects, targetPercent);
  const audit = codeRabbitAudit(subjects);

  // Distinct Theory and Lab Separation
  const lectureSubjects = useMemo(
    () => aggregate.subjects.filter((s) => s.type === 'Lecture'),
    [aggregate.subjects]
  );
  const labSubjects = useMemo(
    () => aggregate.subjects.filter((s) => s.type === 'Lab'),
    [aggregate.subjects]
  );

  const lectureAggregate = useMemo(() => calculateAggregate(lectureSubjects, targetPercent), [lectureSubjects, targetPercent]);
  const labAggregate = useMemo(() => calculateAggregate(labSubjects, targetPercent), [labSubjects, targetPercent]);

  // Processed Filter & Sort
  const processedSubjects = useMemo(() => {
    let result = aggregate.subjects.filter((s) => {
      if (filter === 'shortage') return s.percentage < targetPercent;
      if (filter === 'safe') return s.percentage >= targetPercent;
      if (filter === 'lectures') return s.type === 'Lecture';
      if (filter === 'labs') return s.type === 'Lab';
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'shortage_first':
          return a.percentage - b.percentage;
        case 'pct_asc':
          return a.percentage - b.percentage;
        case 'pct_desc':
          return b.percentage - a.percentage;
        case 'code_asc':
          return a.code.localeCompare(b.code);
        case 'conducted_desc':
          return b.totalConducted - a.totalConducted;
        case 'hours_needed_desc':
          return (b.hoursNeeded || 0) - (a.hoursNeeded || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [aggregate.subjects, filter, sortBy, targetPercent]);

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent-secondary)' }}>Attendance Intelligence</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Smart Multi-Criteria Attendance Engine • Real-Time Institutional Formulas
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {subjects.length > 0 && (
            <div
              className={`audit-badge ${audit.verified ? 'verified' : 'error'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setShowAudit(!showAudit)}
              title="Click to view data integrity verification"
            >
              <ShieldCheck size={15} />
              <span>{audit.badge}</span>
              {showAudit ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          )}

          <button onClick={fetchSubjects} className="btn-icon" title="Refresh records">
            <RefreshCw size={15} />
          </button>

          <Link to="/parser" className="btn btn-primary btn-sm">
            <ClipboardPaste size={14} style={{ marginRight: '6px' }} /> Sync ERP
          </Link>
        </div>
      </div>

      {/* Code Integrity Audit Drawer */}
      {showAudit && subjects.length > 0 && (
        <div className="audit-drawer fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--accent-secondary)" /> Mathematical Formula & Data Integrity Audit
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Passed {audit.passCount}/{audit.totalChecks} checks ({audit.failCount} fails, {audit.warnCount} warnings)
            </span>
          </div>

          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {audit.checks.map((c, i) => (
              <div key={i} className="audit-row">
                <span style={{ fontWeight: 700 }}>{c.code}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{c.check}</span>
                <span className={`audit-status ${c.status}`}>
                  {c.status === 'pass' && <CheckCircle2 size={14} />}
                  {c.status === 'warn' && <AlertTriangle size={14} />}
                  {c.status === 'fail' && <AlertTriangle size={14} />}
                  {c.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dual Criteria Selection Bar (Aggregate vs Subject-Wise) */}
      <div
        className="card"
        style={{
          padding: '18px 24px',
          marginBottom: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'rgba(13, 19, 34, 0.85)',
          borderRadius: '40px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={16} color="var(--accent-secondary)" /> Attendance Evaluation Mode:
          </span>

          <div className="criteria-switcher">
            <button
              onClick={() => setCriteriaMode('aggregate')}
              className={`criteria-pill ${criteriaMode === 'aggregate' ? 'active' : ''}`}
            >
              <Layers size={14} /> Aggregate Attendance
            </button>
            <button
              onClick={() => setCriteriaMode('subject_wise')}
              className={`criteria-pill ${criteriaMode === 'subject_wise' ? 'active' : ''}`}
            >
              <BookOpen size={14} /> Subject-Wise Attendance
            </button>
          </div>
        </div>

        {/* Desired Criteria Threshold Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Target:</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[75, 80, 85].map((pct) => (
              <button
                key={pct}
                onClick={() => setTargetPercent(pct)}
                className={`btn btn-sm ${targetPercent === pct ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px' }}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Circular Overview KPI Pods (Overall, Theory Lectures, Practical Labs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        {/* Card 1: Overall Aggregate */}
        <div
          className="card"
          style={{
            padding: '22px 24px',
            borderRadius: '40px',
            border: `2px solid ${aggregate.overallPercentage >= targetPercent ? 'rgba(212, 255, 36, 0.35)' : 'rgba(255, 71, 102, 0.35)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ALL COURSES AGGREGATE
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: aggregate.overallPercentage >= targetPercent ? 'var(--accent-secondary)' : 'var(--danger)', marginTop: '4px' }}>
              {aggregate.overallPercentage}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {aggregate.totalAttended} / {aggregate.totalConducted} hrs • {aggregate.totalSubjects} Subjects
            </div>
          </div>

          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--bg-input)',
              border: `3px solid ${aggregate.overallPercentage >= targetPercent ? 'var(--accent-secondary)' : 'var(--danger)'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: aggregate.overallPercentage >= targetPercent ? 'var(--shadow-lime)' : '0 0 15px rgba(255, 71, 102, 0.3)'
            }}
          >
            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: aggregate.overallPercentage >= targetPercent ? 'var(--accent-secondary)' : 'var(--danger)' }}>
              {aggregate.overallPercentage >= targetPercent ? 'SAFE' : 'RISK'}
            </span>
          </div>
        </div>

        {/* Card 2: Theory Lectures Breakdown */}
        <div
          className="card"
          style={{
            padding: '22px 24px',
            borderRadius: '40px',
            border: `2px solid ${lectureAggregate.overallPercentage >= targetPercent ? 'rgba(212, 255, 36, 0.35)' : 'rgba(255, 71, 102, 0.35)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6da2ff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={13} /> THEORY LECTURES ({lectureSubjects.length})
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: lectureAggregate.overallPercentage >= targetPercent ? 'var(--accent-secondary)' : 'var(--danger)', marginTop: '4px' }}>
              {lectureAggregate.overallPercentage}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {lectureAggregate.totalAttended} / {lectureAggregate.totalConducted} hrs • {lectureAggregate.shortageCount} Shortages
            </div>
          </div>

          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--bg-input)',
              border: '3px solid #1558C9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-blue)'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6da2ff' }}>THEORY</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>1h slots</span>
          </div>
        </div>

        {/* Card 3: Practical Labs Breakdown */}
        <div
          className="card"
          style={{
            padding: '22px 24px',
            borderRadius: '40px',
            border: `2px solid ${labAggregate.overallPercentage >= targetPercent ? 'rgba(212, 255, 36, 0.35)' : 'rgba(255, 71, 102, 0.35)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FlaskConical size={13} /> PRACTICAL LABS ({labSubjects.length})
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: labAggregate.overallPercentage >= targetPercent ? 'var(--accent-secondary)' : 'var(--danger)', marginTop: '4px' }}>
              {labAggregate.overallPercentage}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {labAggregate.totalAttended} / {labAggregate.totalConducted} hrs • {labAggregate.shortageCount} Shortages
            </div>
          </div>

          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--bg-input)',
              border: '3px solid var(--accent-secondary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-lime)'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>LABS</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>2h slots</span>
          </div>
        </div>
      </div>

      {/* Sort & Separation Filter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '26px',
          flexWrap: 'wrap',
          gap: '14px',
          background: 'var(--bg-card)',
          padding: '14px 22px',
          borderRadius: '40px',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Courses ({aggregate.totalSubjects})
          </button>
          <button
            onClick={() => setFilter('lectures')}
            className={`btn btn-sm ${filter === 'lectures' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: filter === 'lectures' ? 'none' : '1px solid rgba(21, 88, 201, 0.4)' }}
          >
            <BookOpen size={13} style={{ marginRight: '4px' }} /> Theory Lectures ({lectureSubjects.length})
          </button>
          <button
            onClick={() => setFilter('labs')}
            className={`btn btn-sm ${filter === 'labs' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: filter === 'labs' ? 'none' : '1px solid rgba(212, 255, 36, 0.4)' }}
          >
            <FlaskConical size={13} style={{ marginRight: '4px' }} /> Practical Labs ({labSubjects.length})
          </button>
          <button
            onClick={() => setFilter('shortage')}
            className={`btn btn-sm ${filter === 'shortage' ? 'btn-danger' : 'btn-secondary'}`}
          >
            Shortages ({aggregate.shortageCount})
          </button>
          <button
            onClick={() => setFilter('safe')}
            className={`btn btn-sm ${filter === 'safe' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Safe ({aggregate.safeCount})
          </button>
        </div>

        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpDown size={14} /> Sort By:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="shortage_first">Critical Shortages First</option>
            <option value="pct_desc">Highest Percentage First</option>
            <option value="code_asc">Course Code (A-Z)</option>
            <option value="conducted_desc">Most Conducted Hours</option>
            <option value="hours_needed_desc">Most Hours Needed</option>
          </select>
        </div>
      </div>

      {/* Loading or Empty State */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div className="loading-pulse">Calculating attendance criteria...</div>
        </div>
      ) : subjects.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '56px 24px',
            border: '2px dashed var(--border-color)',
            background: 'transparent',
            borderRadius: '40px'
          }}
        >
          <Sparkles size={48} color="var(--accent-secondary)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: '8px' }}>No Attendance Records Found</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 28px' }}>
            Sync your institutional ERP clipboard directly or populate with 12 verified subjects to test the calculation engine.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={loadSampleData} className="btn btn-primary">
              <Sparkles size={16} style={{ marginRight: '8px' }} /> Load Verified SKIT ERP Data (12 Subjects)
            </button>
            <Link to="/parser" className="btn btn-secondary">
              <ClipboardPaste size={16} style={{ marginRight: '8px' }} /> Paste Raw ERP Clipboard
            </Link>
          </div>
        </div>
      ) : (
        /* Pure Circular Subject Cards Grid */
        <div className="subject-grid">
          {processedSubjects.map((subject) => (
            <SubjectCard
              key={subject._id || subject.code}
              subject={subject}
              targetPercent={targetPercent}
              onMark={handleMark}
              onUnmark={handleUnmark}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
