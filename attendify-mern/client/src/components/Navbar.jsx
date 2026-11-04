import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, ClipboardPaste, CheckCircle2, Sparkles, Zap } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

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
          <span className="roll-badge">
            {user?.rollNo || '24ESKIT059'} • {user?.name || 'Student'}
          </span>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="btn btn-sm btn-secondary"
            title="Log out"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={13} /> Exit
          </button>
        </div>
      </div>
    </nav>
  );
}
