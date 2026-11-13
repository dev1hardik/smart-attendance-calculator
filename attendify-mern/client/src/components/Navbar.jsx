import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardPaste, CheckCircle2, Sparkles, Zap } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-secondary)', color: '#030407', padding: 0 }}>
            <Zap size={16} fill="#030407" />
          </span>
          <span style={{ background: 'transparent', padding: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 800 }}>
            SMART ATTENDENDENCE CALCULATOR
          </span>
        </NavLink>

        <div className="navbar-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} end>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LayoutDashboard size={15} /> Dashboard
            </span>
          </NavLink>
          <NavLink to="/parser" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ClipboardPaste size={15} /> ERP Parser
            </span>
          </NavLink>
          <NavLink to="/recovery" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={15} /> Recovery Plan
            </span>
          </NavLink>
          <NavLink to="/what-if" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} /> What-If
            </span>
          </NavLink>
        </div>

        <div className="navbar-user">
          <span className="roll-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-secondary)' }} />
            Instant Access (Zero Login)
          </span>
        </div>
      </div>
    </nav>
  );
}
