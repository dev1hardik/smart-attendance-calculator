import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { simulateWhatIf, calculateERPStats, analyzeSubject } from '../utils/erpEngine';
import { Sparkles, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

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
    code: 'DEMO',
    name: 'Sample Subject',
    type: 'Lecture',
    stepWeight: 1,
    present: 20,
    od: 0,
    makeup: 0,
    absent: 10,
  };

  const currentStats = calculateERPStats(selectedSubject);
  const currentAnalysis = analyzeSubject(selectedSubject, targetPercent);

  const sw = selectedSubject.stepWeight || 1;
  const simulatedAnalysis = simulateWhatIf(
    selectedSubject,
    extraPresent * sw,
    extraAbsent * sw,
    extraMakeup * sw,
    targetPercent
  );

  const delta = (simulatedAnalysis.percentage - currentStats.percentage).toFixed(2);

  const handleReset = () => {
    setExtraPresent(0);
    setExtraAbsent(0);
    setExtraMakeup(0);
  };

  return (
    <div className="container simulator-page">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles color="var(--accent-secondary)" /> What-If Attendance Simulator
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          Model the mathematical impact of attending or missing future classes before taking decisions.
        </p>
      </div>

      <div className="simulator-grid">
        {/* Left Column: Interactive Controls */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Simulation Parameters</h3>
            <button onClick={handleReset} className="btn btn-sm btn-secondary" title="Reset sliders">
              <RotateCcw size={13} style={{ marginRight: '4px' }} /> Reset
            </button>
          </div>

          <div className="form-group">
            <label>Select Target Subject</label>
            <select
              value={selectedCode}
              onChange={(e) => {
                setSelectedCode(e.target.value);
                handleReset();
              }}
            >
              {subjects.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.name} ({s.type})
                </option>
              ))}
            </select>
          </div>

          <div className="slider-group">
            <label>
              <span>Attend Next Classes (+Present)</span>
              <strong style={{ color: 'var(--accent-secondary)' }}>+{extraPresent} classes ({extraPresent * sw} hrs)</strong>
            </label>
            <input
              type="range"
              min="0"
              max="25"
              value={extraPresent}
              onChange={(e) => setExtraPresent(Number(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <label>
              <span>Miss Next Classes (+Absent)</span>
              <strong style={{ color: 'var(--danger)' }}>+{extraAbsent} classes ({extraAbsent * sw} hrs)</strong>
            </label>
            <input
              type="range"
              min="0"
              max="25"
              value={extraAbsent}
              onChange={(e) => setExtraAbsent(Number(e.target.value))}
            />
          </div>

          <div className="slider-group">
            <label>
              <span>Earn Makeup Hours (+Makeup)</span>
              <strong style={{ color: '#6da2ff' }}>+{extraMakeup} classes ({extraMakeup * sw} hrs)</strong>
            </label>
            <input
              type="range"
              min="0"
              max="15"
              value={extraMakeup}
              onChange={(e) => setExtraMakeup(Number(e.target.value))}
            />
          </div>

          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target Criteria:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[75, 80, 85].map((pct) => (
                <button
                  key={pct}
                  className={`btn btn-sm ${targetPercent === pct ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTargetPercent(pct)}
                  style={{ border: targetPercent === pct ? 'none' : '1px solid var(--border-color)' }}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Results */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '22px' }}>Projected Result</h3>

            {/* Comparison Cards with circular styling */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
              <div
                style={{
                  background: 'var(--bg-input)',
                  padding: '20px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>CURRENT BASELINE</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0' }}>
                  {currentStats.percentage}%
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {currentStats.attended} / {currentStats.totalConducted} hrs
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.75rem', fontWeight: 700, color: currentAnalysis.isSafe ? 'var(--accent-secondary)' : 'var(--danger)' }}>
                  {currentAnalysis.isSafe ? 'Criteria Met' : 'Shortage'}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-input)',
                  padding: '20px',
                  borderRadius: 'var(--radius)',
                  border: `1px solid ${simulatedAnalysis.isSafe ? 'var(--accent-secondary)' : 'var(--danger)'}`,
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>PROJECTED OUTCOME</div>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    margin: '6px 0',
                    color: simulatedAnalysis.isSafe ? 'var(--accent-secondary)' : 'var(--danger)',
                  }}
                >
                  {simulatedAnalysis.percentage}%
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {simulatedAnalysis.attended} / {simulatedAnalysis.totalConducted} hrs
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                  <span style={{ color: Number(delta) >= 0 ? 'var(--accent-secondary)' : 'var(--danger)' }}>
                    {Number(delta) >= 0 ? `+${delta}% change` : `${delta}% change`}
                  </span>
                </div>
              </div>
            </div>

            {/* Projected Advice / Result Banner */}
            <div className="simulator-result">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {simulatedAnalysis.isSafe ? (
                  <CheckCircle2 size={18} color="var(--accent-secondary)" />
                ) : (
                  <AlertTriangle size={18} color="var(--danger)" />
                )}
                <strong style={{ color: simulatedAnalysis.isSafe ? 'var(--accent-secondary)' : 'var(--danger)' }}>
                  {simulatedAnalysis.isSafe ? 'Safe Attendance Target' : 'Shortage Alert'}
                </strong>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {simulatedAnalysis.message}
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '14px 20px',
              background: 'rgba(21, 88, 201, 0.12)',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(21, 88, 201, 0.3)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginTop: '22px',
            }}
          >
            💡 <strong>Formula Insight:</strong> Attending classes increases both Attended (A) and Total Conducted (T) by {sw}h,
            causing your percentage to converge upward. Makeup hours increase A without altering T!
          </div>
        </div>
      </div>
    </div>
  );
}
