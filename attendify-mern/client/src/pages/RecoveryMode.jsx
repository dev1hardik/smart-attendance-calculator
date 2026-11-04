import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { calculateAggregate, recoveryOptimizer } from '../utils/erpEngine';
import SubjectCard from '../components/SubjectCard';
import toast from 'react-hot-toast';
import {
  Zap,
  CheckCircle2,
  TrendingUp,
  CheckSquare,
  AlertTriangle,
  Layers,
  BookOpen
} from 'lucide-react';

export default function RecoveryMode() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetPercent, setTargetPercent] = useState(75);
  const [criteriaType, setCriteriaType] = useState('subject_wise'); // 'aggregate' | 'subject_wise'
  const [completedTasks, setCompletedTasks] = useState({});

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subjects');
      setSubjects(res.data);
      localStorage.setItem('attendify_subjects', JSON.stringify(res.data));
    } catch {
      const stored = localStorage.getItem('attendify_subjects');
      if (stored) {
        setSubjects(JSON.parse(stored));
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
      toast.success(`Logged ${field} (+${res.data.stepWeight}h)`);
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

  const toggleTask = (key) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const aggregate = calculateAggregate(subjects, targetPercent);
  const shortages = aggregate.subjects.filter((s) => s.percentage < targetPercent);
  const recovery = recoveryOptimizer(shortages, targetPercent);

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '1.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap color="var(--accent-secondary)" /> Attendance Recovery Planner
          </h1>
          <span
            style={{
              background: 'var(--accent-secondary)',
              color: '#030407',
              padding: '4px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.75rem',
              fontWeight: 800,
            }}
          >
            ACTION MODE
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Targeted recovery roadmap. Calculate the minimal consecutive sessions needed to clear either aggregate or subject-wise thresholds.
        </p>
      </div>

      {/* Criteria Selection Header Bar */}
      <div className="action-banner active" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Recovery Focus:</span>
          <div className="criteria-switcher">
            <button
              onClick={() => setCriteriaType('subject_wise')}
              className={`criteria-pill ${criteriaType === 'subject_wise' ? 'active' : ''}`}
            >
              <BookOpen size={14} /> Subject-Wise ({shortages.length} Shortages)
            </button>
            <button
              onClick={() => setCriteriaType('aggregate')}
              className={`criteria-pill ${criteriaType === 'aggregate' ? 'active' : ''}`}
            >
              <Layers size={14} /> Institutional Aggregate ({aggregate.overallPercentage}%)
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div className="loading-pulse">Calculating optimal recovery roadmap...</div>
        </div>
      ) : shortages.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '56px 24px',
            border: '2px solid rgba(212, 255, 36, 0.4)',
            background: 'rgba(212, 255, 36, 0.04)',
          }}
        >
          <CheckCircle2 size={48} color="var(--accent-secondary)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: '8px', color: 'var(--accent-secondary)' }}>All Criteria Cleared!</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
            Zero subjects are below the {targetPercent}% target threshold. You are fully compliant with attendance requirements.
          </p>
        </div>
      ) : (
        <>
          {/* Target Recovery Roadmap Card */}
          <div className="card" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="var(--accent-secondary)" />
                Target Recovery Roadmap
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Simulating class increments according to lecture/lab step weights
              </span>
            </div>

            <div className="roadmap-log">
              {recovery.log.map((entry, idx) => (
                <div key={idx} className="roadmap-log-entry">
                  <span className="converged">✓</span> {entry}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {recovery.results.map((res, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--bg-input)',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{res.code}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{res.name}</div>
                  <div style={{ marginTop: '10px', fontSize: '0.875rem' }}>
                    Need: <strong style={{ color: 'var(--danger)' }}>{res.weeksNeeded} consecutive classes</strong> ({res.totalExtraHours}h)
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', marginTop: '4px', fontWeight: 700 }}>
                    Projected Final: {res.finalPercentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Action Checklist with Circular Radios */}
          <div className="card" style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={18} color="var(--accent-secondary)" />
              Daily Action Checklist
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {shortages.map((subj) => {
                const key = `task_${subj.code}`;
                const isChecked = !!completedTasks[key];
                return (
                  <div
                    key={subj.code}
                    onClick={() => toggleTask(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 20px',
                      background: isChecked ? 'rgba(212, 255, 36, 0.08)' : 'var(--bg-input)',
                      border: `1px solid ${isChecked ? 'var(--accent-secondary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-pill)',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: `2px solid ${isChecked ? 'var(--accent-secondary)' : 'var(--border-color)'}`,
                          background: isChecked ? 'var(--accent-secondary)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'var(--transition)'
                        }}
                      >
                        {isChecked && <CheckCircle2 size={16} color="#030407" />}
                      </div>
                      <div>
                        <span style={{ fontWeight: 700, textDecoration: isChecked ? 'line-through' : 'none' }}>
                          {subj.code} — {subj.name}
                        </span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Current: {subj.percentage}% • Target: Attend next {subj.sessionsNeeded} {subj.sessionType}
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn btn-sm btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMark(subj._id, 'present');
                      }}
                    >
                      + Attend Today
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shortage Subject Cards Grid */}
          <h3 style={{ fontSize: '1.15rem', marginBottom: '18px' }}>Critical Shortage Cards</h3>
          <div className="subject-grid">
            {shortages.map((subject) => (
              <SubjectCard
                key={subject._id || subject.code}
                subject={subject}
                targetPercent={targetPercent}
                onMark={handleMark}
                onUnmark={handleUnmark}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
