import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import SubjectCard from '../components/SubjectCard';
import { calculateAggregate, codeRabbitAudit } from '../utils/erpEngine';
import toast from 'react-hot-toast';
import {
  Sparkles,
  ClipboardPaste,
  BookOpen,
  FlaskConical,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Compass,
  Wind,
  CheckCircle2,
  AlertTriangle,
  Feather
} from 'lucide-react';

const SAMPLE_DATA = [
  { code: 'CRT', name: 'CRT Practical Lab', type: 'Lab', stepWeight: 2, present: 60, od: 0, makeup: 6, absent: 22 },
  { code: 'CS501', name: 'Software Engineering', type: 'Lecture', stepWeight: 1, present: 27, od: 0, makeup: 0, absent: 14 },
  { code: 'CS502', name: 'Computer Networks', type: 'Lecture', stepWeight: 1, present: 33, od: 0, makeup: 0, absent: 9 },
  { code: 'CS503', name: 'Operating Systems', type: 'Lecture', stepWeight: 1, present: 26, od: 0, makeup: 0, absent: 14 },
  { code: 'CS504', name: 'Theory of Computation', type: 'Lecture', stepWeight: 1, present: 25, od: 0, makeup: 0, absent: 2 },
  { code: 'CS511', name: 'Data Analytics & ML', type: 'Lecture', stepWeight: 1, present: 35, od: 0, makeup: 0, absent: 5 },
  { code: 'CS520', name: 'SE Research Lab', type: 'Lab', stepWeight: 2, present: 20, od: 0, makeup: 0, absent: 8 },
  { code: 'CS521', name: 'Network Protocol Lab', type: 'Lab', stepWeight: 2, present: 12, od: 0, makeup: 0, absent: 16 },
  { code: 'CS522', name: 'OS Kernel Lab', type: 'Lab', stepWeight: 2, present: 20, od: 0, makeup: 0, absent: 6 },
  { code: 'CS523', name: 'Computation Theory Lab', type: 'Lab', stepWeight: 2, present: 22, od: 0, makeup: 0, absent: 6 },
  { code: 'CS530', name: 'Academic Seminar', type: 'Lab', stepWeight: 2, present: 12, od: 0, makeup: 0, absent: 2 },
  { code: 'HU560', name: 'Universal Human Values', type: 'Lecture', stepWeight: 1, present: 25, od: 0, makeup: 0, absent: 15 }
];

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Criteria mode: 'aggregate' | 'subject_wise'
  const [criteriaMode, setCriteriaMode] = useState('aggregate');
  const [targetPercent, setTargetPercent] = useState(75);

  // Filter: 'all' | 'lectures' | 'labs' | 'shortage' | 'safe'
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('shortage_first');

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subjects');
      const normalized = res.data.map((s) => ({
        ...s,
        type: s.type || (/lab|practical|tutorial|CRT|UP\d/i.test(s.name || s.code) ? 'Lab' : 'Lecture'),
        stepWeight: s.stepWeight || (/lab|practical|tutorial|CRT|UP\d/i.test(s.name || s.code) ? 2 : 1),
      }));
      setSubjects(normalized);
      localStorage.setItem('attendify_subjects', JSON.stringify(normalized));
    } catch {
      const stored = localStorage.getItem('attendify_subjects');
      if (stored) {
        setSubjects(JSON.parse(stored));
      } else {
        setSubjects(SAMPLE_DATA);
        localStorage.setItem('attendify_subjects', JSON.stringify(SAMPLE_DATA));
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
      toast.success(`Logged ${field}`);
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
      toast.success(`Logged ${field}`);
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
      toast.success(`Undone ${field}`);
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
    if (!window.confirm('Remove this course from your atelier?')) return;
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
    toast.success('Course removed');
  };

  const loadSampleData = async () => {
    try {
      setLoading(true);
      await api.post('/subjects/bulk-import', { subjects: SAMPLE_DATA });
      toast.success('Curated portfolio loaded!');
      await fetchSubjects();
    } catch {
      setSubjects(SAMPLE_DATA);
      localStorage.setItem('attendify_subjects', JSON.stringify(SAMPLE_DATA));
      toast.success('Curated portfolio loaded (Local Atelier)');
      setLoading(false);
    }
  };

  const aggregate = calculateAggregate(subjects, targetPercent);
  const audit = codeRabbitAudit(subjects);

  // Separate Theory Lectures and Practical Labs
  const lectureSubjects = useMemo(
    () => aggregate.subjects.filter((s) => s.type === 'Lecture'),
    [aggregate.subjects]
  );
  const labSubjects = useMemo(
    () => aggregate.subjects.filter((s) => s.type === 'Lab'),
    [aggregate.subjects]
  );

  const lectureAgg = useMemo(() => {
    const att = lectureSubjects.reduce((acc, s) => acc + s.attended, 0);
    const cond = lectureSubjects.reduce((acc, s) => acc + s.totalConducted, 0);
    const pct = cond === 0 ? 0 : parseFloat(((att / cond) * 100).toFixed(2));
    const shortages = lectureSubjects.filter((s) => s.percentage < targetPercent).length;
    return { att, cond, pct, count: lectureSubjects.length, shortages };
  }, [lectureSubjects, targetPercent]);

  const labAgg = useMemo(() => {
    const att = labSubjects.reduce((acc, s) => acc + s.attended, 0);
    const cond = labSubjects.reduce((acc, s) => acc + s.totalConducted, 0);
    const pct = cond === 0 ? 0 : parseFloat(((att / cond) * 100).toFixed(2));
    const shortages = labSubjects.filter((s) => s.percentage < targetPercent).length;
    return { att, cond, pct, count: labSubjects.length, shortages };
  }, [labSubjects, targetPercent]);

  // Filtering & Sorting
  const filteredSubjects = useMemo(() => {
    let list = [...aggregate.subjects];

    if (filter === 'lectures') list = list.filter((s) => s.type === 'Lecture');
    if (filter === 'labs') list = list.filter((s) => s.type === 'Lab');
    if (filter === 'shortage') list = list.filter((s) => s.percentage < targetPercent);
    if (filter === 'safe') list = list.filter((s) => s.percentage >= targetPercent);

    if (sortBy === 'shortage_first') {
      list.sort((a, b) => a.percentage - b.percentage);
    } else if (sortBy === 'alphabetical') {
      list.sort((a, b) => a.code.localeCompare(b.code));
    } else if (sortBy === 'highest_pct') {
      list.sort((a, b) => b.percentage - a.percentage);
    }

    return list;
  }, [aggregate.subjects, filter, sortBy, targetPercent]);

  const isMasterSafe =
    criteriaMode === 'aggregate'
      ? aggregate.overallPercentage >= targetPercent
      : aggregate.shortageCount === 0;

  // Master Dial SVG calculations
  const masterRadius = 58;
  const masterCircumference = 2 * Math.PI * masterRadius; // ~364.42
  const masterOffset =
    masterCircumference -
    (Math.min(100, Math.max(0, aggregate.overallPercentage)) / 100) * masterCircumference;

  return (
    <div className="container">
      {/* Atelier Hero Section */}
      <section className="atelier-hero">
        <div className="atelier-badge">
          <Sparkles size={13} color="var(--accent-blush)" />
          Stillflora Edition &bull; Academic Intelligence Atelier
        </div>
        <h1 className="atelier-title">
          The Poetics of Attendance & <em>Academic Certainty</em>
        </h1>
        <p className="atelier-subtitle">
          A bespoke computational sanctuary for decoding institutional ERP records, forecasting exam eligibility,
          and restoring mathematical equilibrium across your semester.
        </p>

        {/* Action Controls */}
        <div className="atelier-action-bar">
          <Link to="/parser" className="btn btn-primary">
            <Feather size={15} /> Ingest ERP Clipboard
          </Link>
          <button onClick={loadSampleData} className="btn btn-blush">
            <Sparkles size={15} /> Curate Portfolio (12 Courses)
          </button>
          <Link to="/recovery" className="btn btn-secondary">
            <Compass size={15} /> Recovery Sanctuary
          </Link>
          <Link to="/what-if" className="btn btn-secondary">
            <Wind size={15} /> What-If Solarium
          </Link>
        </div>
      </section>

      {/* Master Aggregate Glass Vessel */}
      <div className="master-vessel">
        {/* Left: Large Radial Bloom Gauge */}
        <div className="master-dial-wrapper">
          <div className="radial-bloom-meter">
            <svg className="radial-bloom-svg" viewBox="0 0 140 140">
              <defs>
                <linearGradient id="bloomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3d6a87" />
                  <stop offset="100%" stopColor={isMasterSafe ? '#4a7c59' : '#de8e80'} />
                </linearGradient>
              </defs>
              <circle
                className="radial-bloom-track"
                cx="70"
                cy="70"
                r={masterRadius}
              />
              <circle
                className="radial-bloom-progress"
                cx="70"
                cy="70"
                r={masterRadius}
                stroke="url(#bloomGrad)"
                strokeDasharray={masterCircumference}
                strokeDashoffset={masterOffset}
                style={{
                  filter: isMasterSafe
                    ? 'drop-shadow(0 4px 10px rgba(63, 123, 93, 0.35))'
                    : 'drop-shadow(0 4px 10px rgba(222, 142, 128, 0.45))',
                }}
              />
            </svg>
            <div className="radial-bloom-center">
              <span className="radial-bloom-pct">{aggregate.overallPercentage}%</span>
              <span className="radial-bloom-label">
                {isMasterSafe ? 'Equilibrium' : 'Intervention'}
              </span>
            </div>
          </div>

          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: isMasterSafe ? 'var(--accent-sage-light)' : 'var(--accent-blush-light)',
                  color: isMasterSafe ? 'var(--accent-sage)' : '#9c483a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                {isMasterSafe ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                {isMasterSafe ? 'Standard Fulfilled' : 'Criteria Shortage'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.75rem', margin: '4px 0' }}>Curriculum Equilibrium</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {aggregate.totalAttended} attended of {aggregate.totalConducted} conducted hours across {aggregate.subjectCount} subjects.
            </p>
          </div>
        </div>

        {/* Right: Target Thresholds & Evaluation Mode */}
        <div className="master-metrics-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
                Evaluation Mode
              </span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={() => setCriteriaMode('aggregate')}
                  className={`target-pill ${criteriaMode === 'aggregate' ? 'active' : ''}`}
                >
                  Aggregate Mode
                </button>
                <button
                  onClick={() => setCriteriaMode('subject_wise')}
                  className={`target-pill ${criteriaMode === 'subject_wise' ? 'active' : ''}`}
                >
                  Subject-Wise Mode
                </button>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
                Target Criteria
              </span>
              <div className="target-criteria-pills">
                {[75, 80, 85].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setTargetPercent(pct)}
                    className={`target-pill ${targetPercent === pct ? 'active' : ''}`}
                  >
                    {pct}% {pct === 75 ? 'Standard' : pct === 80 ? 'Buffer' : 'Honors'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '14px 18px', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '18px', border: '1px solid rgba(162, 187, 207, 0.28)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {criteriaMode === 'aggregate' ? (
                <>
                  Evaluating aggregate attendance against the <strong>{targetPercent}%</strong> threshold.{' '}
                  {isMasterSafe
                    ? `Safe margin: You have a healthy buffer across your semester courses.`
                    : `Action required: Deficit of ${Math.ceil((targetPercent / 100) * aggregate.totalConducted - aggregate.totalAttended)} hours to clear criteria.`}
                </>
              ) : (
                <>
                  Strict subject-wise inspection:{' '}
                  <strong>{aggregate.shortageCount}</strong> of <strong>{aggregate.subjectCount}</strong> courses are currently below the {targetPercent}% requirement.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Split Herbarium Cards: Lecture vs Lab Breakdown */}
      <div className="split-herbarium-grid">
        <div className="herbarium-card">
          <div className="herbarium-icon-badge">
            <BookOpen size={24} />
          </div>
          <div className="herbarium-meta">
            <h4>Theory Lectures ({lectureAgg.count})</h4>
            <div className="percentage">{lectureAgg.pct}%</div>
            <div className="herbarium-subtext">
              {lectureAgg.att} / {lectureAgg.cond} hrs &bull; {lectureAgg.shortages} shortages at {targetPercent}%
            </div>
          </div>
        </div>

        <div className="herbarium-card lab-card">
          <div className="herbarium-icon-badge">
            <FlaskConical size={24} />
          </div>
          <div className="herbarium-meta">
            <h4>Practical Labs ({labAgg.count})</h4>
            <div className="percentage">{labAgg.pct}%</div>
            <div className="herbarium-subtext">
              {labAgg.att} / {labAgg.cond} hrs &bull; {labAgg.shortages} shortages at {targetPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sorting Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Specimens (${aggregate.subjectCount})` },
            { id: 'lectures', label: `Theory (${lectureAgg.count})` },
            { id: 'labs', label: `Labs (${labAgg.count})` },
            { id: 'shortage', label: `Shortages (${aggregate.shortageCount})` },
            { id: 'safe', label: `Safe (${aggregate.subjectCount - aggregate.shortageCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`target-pill ${filter === tab.id ? 'active' : ''}`}
              style={{
                background: filter === tab.id ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                border: '1px solid rgba(162, 187, 207, 0.35)',
                padding: '8px 18px',
                fontSize: '0.84rem',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpDown size={15} color="var(--text-muted)" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              background: '#ffffff',
              border: '1px solid rgba(162, 187, 207, 0.35)',
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="shortage_first">Priority: Shortages First</option>
            <option value="alphabetical">Alphabetical (Code)</option>
            <option value="highest_pct">Highest Percentage First</option>
          </select>
        </div>
      </div>

      {/* Course Botanical Specimens Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '32px' }}>
          <Sparkles size={36} color="var(--accent-blush)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>No Course Specimens in this View</h3>
          <p style={{ maxWidth: '440px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            You have no active courses matching the selected filter. Ingest your student portal data or load the curated portfolio.
          </p>
          <button onClick={loadSampleData} className="btn btn-blush">
            <Sparkles size={15} /> Curate 12-Course Portfolio
          </button>
        </div>
      ) : (
        <div className="botanical-grid">
          {filteredSubjects.map((subject) => (
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
