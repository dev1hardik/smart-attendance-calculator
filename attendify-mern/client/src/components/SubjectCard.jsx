import React from 'react';
import { analyzeSubject } from '../utils/erpEngine';
import { Trash2, CheckCircle2, AlertTriangle, Sparkles, BookOpen, FlaskConical, Undo2 } from 'lucide-react';

export default function SubjectCard({ subject, targetPercent = 75, onMark, onUnmark, onDelete }) {
  const analysis = analyzeSubject(subject, targetPercent);
  const isSafe = analysis.isSafe;
  const percentage = analysis.percentage;
  const isLab = subject.type === 'Lab';

  // SVG Circular Radial Bloom Ring
  const radius = 34;
  const circumference = 2 * Math.PI * radius; // ~213.6
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className={`specimen-card ${isSafe ? 'safe-card' : 'shortage-card'}`}>
      {/* Top Header: Code & Type & Delete */}
      <div className="specimen-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="specimen-code-badge">
              {isLab ? <FlaskConical size={12} /> : <BookOpen size={12} />}
              {subject.code} &bull; {isLab ? '2h Lab' : '1h Lecture'}
            </span>
            <span className={`specimen-status-chip ${isSafe ? 'safe' : 'shortage'}`}>
              {isSafe ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
              {isSafe ? 'Blossoming & Safe' : 'Action Required'}
            </span>
          </div>
          <h3 className="specimen-name">{subject.name}</h3>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(subject._id || subject.code)}
            className="btn-mark"
            title="Remove course from atelier"
            style={{ width: '32px', height: '32px', borderRadius: '50%', flex: 'none', color: 'var(--text-muted)' }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Radial Bloom Ring & Metric Breakdown */}
      <div className="specimen-dial-container">
        {/* Circular Bloom Gauge */}
        <div style={{ position: 'relative', width: '84px', height: '84px', flexShrink: 0 }}>
          <svg width="84" height="84" viewBox="0 0 84 84" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="42"
              cy="42"
              r={radius}
              fill="rgba(255, 255, 255, 0.65)"
              stroke="rgba(180, 204, 222, 0.3)"
              strokeWidth="6"
            />
            <circle
              cx="42"
              cy="42"
              r={radius}
              fill="transparent"
              stroke={isSafe ? '#3f7b5d' : '#c84d5b'}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.7s cubic-bezier(0.25, 1, 0.5, 1)',
                filter: isSafe ? 'drop-shadow(0 2px 6px rgba(63, 123, 93, 0.3))' : 'drop-shadow(0 2px 6px rgba(200, 77, 91, 0.35))'
              }}
            />
          </svg>

          {/* Centered Percentage */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 600, lineHeight: 1, color: 'var(--text-primary)' }}>
              {percentage}%
            </span>
            <span style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isSafe ? 'Target Met' : 'Shortage'}
            </span>
          </div>
        </div>

        {/* 4 Herbarium Count Bubbles */}
        <div className="specimen-counts" style={{ flex: 1, marginLeft: '16px' }}>
          <div className="count-bubble" title="Attended Hours">
            <div className="number" style={{ color: 'var(--accent-blue)' }}>{subject.present}</div>
            <div className="label">Present</div>
          </div>
          <div className="count-bubble" title="On-Duty (OD) Approved">
            <div className="number">{subject.od || 0}</div>
            <div className="label">OD</div>
          </div>
          <div className="count-bubble" title="Makeup Sessions">
            <div className="number" style={{ color: 'var(--accent-blush)' }}>{subject.makeup || 0}</div>
            <div className="label">Makeup</div>
          </div>
          <div className="count-bubble" title="Absent Hours">
            <div className="number" style={{ color: 'var(--accent-rose)' }}>{subject.absent}</div>
            <div className="label">Absent</div>
          </div>
        </div>
      </div>

      {/* Recovery Guidance Prescription */}
      <div className={`recovery-banner ${isSafe ? 'safe' : 'shortage'}`}>
        {isSafe ? <Sparkles size={14} style={{ flexShrink: 0 }} /> : <AlertTriangle size={14} style={{ flexShrink: 0 }} />}
        <span>{analysis.message}</span>
      </div>

      {/* Quick Interactive Mark Controls */}
      <div className="specimen-actions">
        <button
          className="btn-mark"
          onClick={() => onMark(subject._id || subject.code, 'present')}
          title={`Log +${subject.stepWeight || (isLab ? 2 : 1)}h Attended`}
        >
          <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>+P</span> Present
        </button>

        <button
          className="btn-mark btn-absent"
          onClick={() => onMark(subject._id || subject.code, 'absent')}
          title={`Log +${subject.stepWeight || (isLab ? 2 : 1)}h Absent`}
        >
          <span style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>+A</span> Absent
        </button>

        <button
          className="btn-mark"
          onClick={() => onMark(subject._id || subject.code, 'makeup')}
          title={`Log +${subject.stepWeight || (isLab ? 2 : 1)}h Makeup Credit`}
        >
          <span style={{ color: 'var(--accent-blush)', fontWeight: 700 }}>+M</span> Makeup
        </button>

        <button
          className="btn-mark"
          style={{ flex: 'none', width: '34px' }}
          onClick={() => onUnmark(subject._id || subject.code, 'absent')}
          title="Undo last absent record"
        >
          <Undo2 size={13} />
        </button>
      </div>
    </div>
  );
}
