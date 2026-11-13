import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { calculateAggregate, recoveryOptimizer } from '../utils/erpEngine';
import toast from 'react-hot-toast';
import {
  Compass,
  CheckCircle2,
  TrendingUp,
  CheckSquare,
  AlertTriangle,
  Layers,
  BookOpen,
  Sparkles,
  ArrowRight
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

  const toggleTask = (key) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const aggregate = calculateAggregate(subjects, targetPercent);
  const shortages = aggregate.subjects.filter((s) => s.percentage < targetPercent);
  const recovery = recoveryOptimizer(shortages, targetPercent);

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      {/* Editorial Header */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <div className="atelier-badge">
          <Compass size={13} color="var(--accent-blush)" />
          Recovery Sanctuary &bull; Equilibrium Roadmap
        </div>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '8px' }}>
          Attendance Recovery <em>Sanctuary</em>
        </h1>
        <p style={{ maxWidth: '640px', margin: '0 auto', fontSize: '0.95rem' }}>
          Procedural convergence optimizer calculating the exact minimal consecutive sessions
          needed to clear institutional exam eligibility thresholds.
        </p>
      </div>

      {/* Control Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 24px',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Sanctuary Focus:
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setCriteriaType('subject_wise')}
              className={`target-pill ${criteriaType === 'subject_wise' ? 'active' : ''}`}
            >
              <BookOpen size={14} style={{ marginRight: '6px' }} />
              Subject-Wise ({shortages.length} Deficits)
            </button>
            <button
              onClick={() => setCriteriaType('aggregate')}
              className={`target-pill ${criteriaType === 'aggregate' ? 'active' : ''}`}
            >
              <Layers size={14} style={{ marginRight: '6px' }} />
              Curricular Aggregate ({aggregate.overallPercentage}%)
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Target:</span>
          <div className="target-criteria-pills">
            {[75, 80, 85].map((pct) => (
              <button
                key={pct}
                onClick={() => setTargetPercent(pct)}
                className={`target-pill ${targetPercent === pct ? 'active' : ''}`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
            Simulating convergence vectors...
          </p>
        </div>
      ) : shortages.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '56px 24px',
            border: '1px solid rgba(63, 123, 93, 0.4)',
            background: 'rgba(232, 244, 237, 0.65)',
          }}
        >
          <CheckCircle2 size={48} color="var(--accent-sage)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: '8px', color: 'var(--accent-sage)', fontFamily: 'var(--font-serif)' }}>
            Complete Curricular Equilibrium!
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto', fontSize: '0.95rem' }}>
            Zero course specimens are currently under your {targetPercent}% target. All requirements are safely met.
          </p>
        </div>
      ) : (
        <>
          {/* Target Recovery Roadmap Card */}
          <div className="glass-panel" style={{ padding: '30px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="var(--accent-blue)" />
                Target Recovery Roadmap
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Simulating class increments according to lecture (1h) & lab (2h) weights
              </span>
            </div>

            {/* Log entries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {recovery.log.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid rgba(162, 187, 207, 0.25)',
                    fontSize: '0.86rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span style={{ color: 'var(--accent-sage)', fontWeight: 700 }}>&bull;</span>
                  {entry}
                </div>
              ))}
            </div>

            {/* Specimen target cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {recovery.results.map((res, i) => (
                <div
                  key={i}
                  style={{
                    background: '#ffffff',
                    padding: '18px 22px',
                    borderRadius: '20px',
                    border: '1px solid rgba(162, 187, 207, 0.3)',
                    boxShadow: '0 4px 16px rgba(25, 40, 56, 0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="specimen-code-badge">{res.code}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-sage)', fontWeight: 700 }}>
                      Target: {res.finalPercentage}%
                    </span>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginTop: '6px', color: 'var(--text-primary)' }}>
                    {res.name}
                  </h4>
                  <div style={{ marginTop: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Prescription:{' '}
                    <strong style={{ color: 'var(--accent-rose)' }}>{res.weeksNeeded} consecutive classes</strong> ({res.totalExtraHours}h)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Action Checklist */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.45rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={20} color="var(--accent-blush)" />
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
                      padding: '14px 22px',
                      background: isChecked ? 'var(--accent-sage-light)' : 'rgba(255, 255, 255, 0.75)',
                      border: `1px solid ${isChecked ? 'rgba(63, 123, 93, 0.35)' : 'rgba(162, 187, 207, 0.3)'}`,
                      borderRadius: 'var(--radius-pill)',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: `2px solid ${isChecked ? 'var(--accent-sage)' : 'rgba(162, 187, 207, 0.6)'}`,
                          background: isChecked ? 'var(--accent-sage)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'var(--transition)',
                        }}
                      >
                        {isChecked && <CheckCircle2 size={16} color="#ffffff" />}
                      </div>
                      <div>
                        <span
                          style={{
                            fontWeight: 600,
                            color: isChecked ? 'var(--accent-sage)' : 'var(--text-primary)',
                            textDecoration: isChecked ? 'line-through' : 'none',
                          }}
                        >
                          {subj.code} &bull; {subj.name}
                        </span>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Currently at {subj.percentage}% &bull; Step weight: {subj.stepWeight}h
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        background: isChecked ? 'rgba(63, 123, 93, 0.15)' : 'var(--accent-blush-light)',
                        color: isChecked ? 'var(--accent-sage)' : '#9c483a',
                      }}
                    >
                      {isChecked ? 'Session Attended' : `Priority Recovery`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
