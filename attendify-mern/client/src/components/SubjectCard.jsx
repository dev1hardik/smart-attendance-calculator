import React from 'react';
import { analyzeSubject } from '../utils/erpEngine';
import { Plus, Minus, Trash2, Check, AlertCircle, BookOpen, FlaskConical } from 'lucide-react';

export default function SubjectCard({ subject, targetPercent = 75, onMark, onUnmark, onDelete }) {
  const analysis = analyzeSubject(subject, targetPercent);
  const isSafe = analysis.isSafe;
  const percentage = analysis.percentage;
  const isLab = subject.type === 'Lab';

  // SVG Circular Radial Progress Ring Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className={`circular-subject-pod ${isSafe ? 'safe' : 'shortage'}`}>
      {/* Top Header: Code, Name, Type */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isLab ? 'rgba(212, 255, 36, 0.15)' : 'rgba(21, 88, 201, 0.2)',
                color: isLab ? 'var(--accent-secondary)' : '#6da2ff',
                border: `1px solid ${isLab ? 'rgba(212, 255, 36, 0.35)' : 'rgba(21, 88, 201, 0.35)'}`,
                flexShrink: 0
              }}
              title={isLab ? 'Practical Lab (2 hrs)' : 'Theory Lecture (1 hr)'}
            >
              {isLab ? <FlaskConical size={16} /> : <BookOpen size={16} />}
            </span>
            <div>
              <div className="subject-code">{subject.code}</div>
              <div className="subject-name">{subject.name}</div>
            </div>
          </div>
        </div>

        {/* Circular Action Icons: Type Indicator & Delete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              fontWeight: 800,
              background: isLab ? 'rgba(212, 255, 36, 0.12)' : 'rgba(21, 88, 201, 0.2)',
              color: isLab ? 'var(--accent-secondary)' : '#6da2ff',
              border: `1px solid ${isLab ? 'rgba(212, 255, 36, 0.3)' : 'rgba(21, 88, 201, 0.3)'}`,
            }}
          >
            {isLab ? 'LAB (2h)' : 'LECTURE (1h)'}
          </span>
          {onDelete && (
            <button
              onClick={() => onDelete(subject._id || subject.code)}
              className="circular-btn"
              title="Delete course"
              style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Hero Centerpiece: Circular SVG Radial Gauge (NO RECTANGULAR BAR) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0 16px 0', position: 'relative' }}>
        <div style={{ position: 'relative', width: '96px', height: '96px' }}>
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="rgba(7, 11, 20, 0.8)"
              stroke="rgba(21, 88, 201, 0.2)"
              strokeWidth="6"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="transparent"
              stroke={isSafe ? 'var(--accent-secondary)' : 'var(--danger)'}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
              style={{
                transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: isSafe ? 'drop-shadow(0 0 6px rgba(212, 255, 36, 0.45))' : 'drop-shadow(0 0 6px rgba(255, 71, 102, 0.45))'
              }}
            />
          </svg>

          {/* Centered Percentage Display */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <span style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', color: isSafe ? 'var(--accent-secondary)' : 'var(--danger)' }}>
              {percentage}%
            </span>
            <span style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', marginTop: '2px', color: 'var(--text-muted)' }}>
              {isSafe ? 'CLEARED' : 'AT RISK'}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Pure Circular Stat Orbs */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: '12px 0 18px 0' }}>
        <div className="circular-stat-item" title="Present Hours">
          <div className="stat-value" style={{ color: 'var(--accent-secondary)' }}>{subject.present}</div>
          <div className="stat-label">PRES</div>
        </div>
        <div className="circular-stat-item" title="On Duty (OD) Hours">
          <div className="stat-value">{subject.od || 0}</div>
          <div className="stat-label">OD</div>
        </div>
        <div className="circular-stat-item" title="Makeup Hours">
          <div className="stat-value" style={{ color: '#6da2ff' }}>{subject.makeup || 0}</div>
          <div className="stat-label">MKUP</div>
        </div>
        <div className="circular-stat-item" title="Absent Hours">
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{subject.absent}</div>
          <div className="stat-label">ABST</div>
        </div>
      </div>

      {/* Circular Action Advice Badge (NO RECTANGLE) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: '9999px',
          background: isSafe ? 'rgba(212, 255, 36, 0.08)' : 'rgba(255, 71, 102, 0.1)',
          border: `1px solid ${isSafe ? 'rgba(212, 255, 36, 0.25)' : 'rgba(255, 71, 102, 0.25)'}`,
          color: isSafe ? 'var(--accent-secondary)' : 'var(--danger)',
          fontSize: '0.825rem',
          fontWeight: 700,
          margin: '10px 0 16px 0',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        {isSafe ? <Check size={14} /> : <AlertCircle size={14} />}
        <span>{analysis.message}</span>
      </div>

      {/* Pure Circular Quick Buttons (NO RECTANGULAR BUTTON BARS) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(21, 88, 201, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Circular + Present Button */}
          <button
            className="circular-btn present"
            onClick={() => onMark(subject._id, 'present')}
            title={`+${subject.stepWeight}h Present`}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>+P</span>
          </button>

          {/* Circular + Absent Button */}
          <button
            className="circular-btn absent"
            onClick={() => onMark(subject._id, 'absent')}
            title={`+${subject.stepWeight}h Absent`}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>+A</span>
          </button>

          {/* Circular + Makeup Button */}
          <button
            className="circular-btn"
            onClick={() => onMark(subject._id, 'makeup')}
            title={`+${subject.stepWeight}h Makeup`}
            style={{ color: '#6da2ff' }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>+M</span>
          </button>
        </div>

        {/* Circular Undo Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="circular-btn"
            onClick={() => onUnmark(subject._id, 'absent')}
            title="Undo 1 absent record"
          >
            <Minus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
