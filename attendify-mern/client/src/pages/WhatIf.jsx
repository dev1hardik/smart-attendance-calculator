import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { simulateWhatIf, calculateERPStats, analyzeSubject } from '../utils/erpEngine';
import { Wind, CheckCircle2, AlertTriangle, RotateCcw, Sparkles } from 'lucide-react';

export default function WhatIf() {
  const [subjects, setSubjects] = useState([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [extraPresent, setExtraPresent] = useState(0);
  const [extraAbsent, setExtraAbsent] = useState(0);
  const [extraMakeup, setExtraMakeup] = useState(0);
  const [targetPercent, setTargetPercent] = useState(75);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects');
        setSubjects(res.data);
        if (res.data.length > 0) {
          setSelectedCode(res.data[0].code);
        }
      } catch {
        const stored = localStorage.getItem('attendify_subjects');
        if (stored) {
          const parsed = JSON.parse(stored);
          setSubjects(parsed);
          if (parsed.length > 0) {
            setSelectedCode(parsed[0].code);
          }
        }
      }
    };
    fetchSubjects();
  }, []);

  const selectedSubject = subjects.find((s) => s.code === selectedCode) || {
    code: 'CS503',
    name: 'Operating Systems',
    type: 'Lecture',
    stepWeight: 1,
    present: 26,
    od: 0,
    makeup: 0,
    absent: 14,
  };

  const currentStats = calculateERPStats(selectedSubject);
  const currentAnalysis = analyzeSubject(selectedSubject, targetPercent);

  const sw = selectedSubject.stepWeight || (selectedSubject.type === 'Lab' ? 2 : 1);
  const simulatedAnalysis = simulateWhatIf(
    selectedSubject,
    extraPresent * sw,
    extraAbsent * sw,
    extraMakeup * sw,
    targetPercent
  );

  const delta = (simulatedAnalysis.percentage - currentStats.percentage).toFixed(2);
  const isSimulatedSafe = simulatedAnalysis.percentage >= targetPercent;

  const handleReset = () => {
    setExtraPresent(0);
    setExtraAbsent(0);
    setExtraMakeup(0);
  };

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      {/* Editorial Header */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <div className="atelier-badge">
          <Wind size={13} color="var(--accent-blue)" />
          What-If Solarium &bull; Predictive Modeling
        </div>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '8px' }}>
          What-If Attendance <em>Solarium</em>
        </h1>
        <p style={{ maxWidth: '640px', margin: '0 auto', fontSize: '0.95rem' }}>
          Simulate the mathematical impact of attending prospective lectures or taking leaves
          before making decisions for hackathons, travel, or sick days.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '28px' }}>
        {/* Left Column: Solarium Controls */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.45rem' }}>Simulation Parameters</h3>
            <button onClick={handleReset} className="btn btn-sm btn-secondary">
              <RotateCcw size={13} /> Reset Sliders
            </button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Target Course Specimen
            </label>
            <select
              value={selectedCode}
              onChange={(e) => {
                setSelectedCode(e.target.value);
                handleReset();
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '16px',
                background: '#ffffff',
                border: '1px solid rgba(162, 187, 207, 0.35)',
                fontSize: '0.92rem',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {subjects.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} &mdash; {s.name} ({s.type})
                </option>
              ))}
            </select>
          </div>

          {/* Slider 1: Present */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Attend Upcoming Sessions (+Present)
              </span>
              <strong style={{ color: 'var(--accent-blue)', fontSize: '0.9rem' }}>
                +{extraPresent} classes ({extraPresent * sw}h)
              </strong>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={extraPresent}
              onChange={(e) => setExtraPresent(Number(e.target.value))}
              className="solarium-slider"
            />
          </div>

          {/* Slider 2: Absent */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Prospective Leaves / Absences (+Absent)
              </span>
              <strong style={{ color: 'var(--accent-rose)', fontSize: '0.9rem' }}>
                +{extraAbsent} classes ({extraAbsent * sw}h)
              </strong>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={extraAbsent}
              onChange={(e) => setExtraAbsent(Number(e.target.value))}
              className="solarium-slider"
            />
          </div>

          {/* Slider 3: Makeup */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Makeup / Duty Credits (+Makeup)
              </span>
              <strong style={{ color: 'var(--accent-blush)', fontSize: '0.9rem' }}>
                +{extraMakeup} classes ({extraMakeup * sw}h)
              </strong>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={extraMakeup}
              onChange={(e) => setExtraMakeup(Number(e.target.value))}
              className="solarium-slider"
            />
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(162, 187, 207, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target Benchmark:</span>
            <div className="target-criteria-pills">
              {[75, 80, 85].map((pct) => (
                <button
                  key={pct}
                  className={`target-pill ${targetPercent === pct ? 'active' : ''}`}
                  onClick={() => setTargetPercent(pct)}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Projection */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.45rem', marginBottom: '20px' }}>Projected Standing</h3>

            {/* Comparison Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div
                style={{
                  background: '#ffffff',
                  padding: '20px',
                  borderRadius: '20px',
                  border: '1px solid rgba(162, 187, 207, 0.3)',
                  boxShadow: '0 4px 14px rgba(25, 40, 56, 0.03)',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Current Standing
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.3rem', fontWeight: 600, margin: '6px 0', color: 'var(--text-primary)' }}>
                  {currentStats.percentage}%
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {currentStats.attended} of {currentStats.totalConducted} hrs
                </div>
              </div>

              <div
                style={{
                  background: isSimulatedSafe ? 'var(--accent-sage-light)' : 'var(--accent-rose-light)',
                  padding: '20px',
                  borderRadius: '20px',
                  border: `1px solid ${isSimulatedSafe ? 'rgba(63, 123, 93, 0.35)' : 'rgba(200, 77, 91, 0.35)'}`,
                  boxShadow: '0 4px 14px rgba(25, 40, 56, 0.03)',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: isSimulatedSafe ? 'var(--accent-sage)' : 'var(--accent-rose)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Simulated Outcome
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '2.3rem',
                    fontWeight: 600,
                    margin: '6px 0',
                    color: isSimulatedSafe ? '#1d4a31' : '#8c1f2c',
                  }}
                >
                  {simulatedAnalysis.percentage}%
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {delta > 0 ? `+${delta}% change` : delta < 0 ? `${delta}% change` : 'No variation'}
                </div>
              </div>
            </div>

            {/* Projected Status Pill */}
            <div
              style={{
                padding: '14px 20px',
                borderRadius: '16px',
                background: isSimulatedSafe ? 'var(--accent-sage-light)' : 'var(--accent-rose-light)',
                border: `1px solid ${isSimulatedSafe ? 'rgba(63, 123, 93, 0.3)' : 'rgba(200, 77, 91, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              {isSimulatedSafe ? <CheckCircle2 size={18} color="var(--accent-sage)" /> : <AlertTriangle size={18} color="var(--accent-rose)" />}
              <div>
                <strong style={{ color: isSimulatedSafe ? 'var(--accent-sage)' : 'var(--accent-rose)', fontSize: '0.9rem' }}>
                  {isSimulatedSafe ? 'Exam-Safe Scenario' : 'Debarment Risk Scenario'}
                </strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {isSimulatedSafe
                    ? `This scenario satisfies your institutional ${targetPercent}% requirement.`
                    : `This scenario leaves you below the mandatory ${targetPercent}% cutoff.`}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {simulatedAnalysis.message}
            </p>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(162, 187, 207, 0.25)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Calculations strictly account for course slot weights (1h for Lectures, 2h for Labs).
          </div>
        </div>
      </div>
    </div>
  );
}
