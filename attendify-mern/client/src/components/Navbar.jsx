import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Layers, Compass, Wind, Feather } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          <span className="navbar-logo-badge">
            <Sparkles size={17} />
          </span>
          <div>
            <span className="navbar-logo-text">Stillflora</span>
            <span className="navbar-logo-subtitle">Atelier</span>
          </div>
        </NavLink>

        <div className="navbar-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} end>
            <Layers size={14} /> Overview
          </NavLink>
          <NavLink to="/parser" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Feather size={14} /> ERP Ingestion
          </NavLink>
          <NavLink to="/recovery" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Compass size={14} /> Recovery Sanctuary
          </NavLink>
          <NavLink to="/what-if" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Wind size={14} /> What-If Solarium
          </NavLink>
        </div>

        <div>
          <span className="navbar-pill-status">
            <span className="navbar-pill-dot" />
            Zero-Login Atelier
          </span>
        </div>
      </div>
    </nav>
  );
}
