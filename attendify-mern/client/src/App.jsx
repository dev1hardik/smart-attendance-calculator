import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import StillfloraCanvas from './components/StillfloraCanvas';
import Dashboard from './pages/Dashboard';
import ERPParser from './pages/ERPParser';
import RecoveryMode from './pages/RecoveryMode';
import WhatIf from './pages/WhatIf';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 3D Stillflora Canvas Background */}
      <StillfloraCanvas />

      {/* Foreground Atelier Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1, paddingBottom: '40px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/parser" element={<ERPParser />} />
            <Route path="/recovery" element={<RecoveryMode />} />
            <Route path="/what-if" element={<WhatIf />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="atelier-footer">
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontStyle: 'italic', marginBottom: '4px' }}>
            Stillflora &bull; Botanical Attendance Intelligence &bull; Curated by Hardik Singhal
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Zero-Login Architecture &bull; All calculations processed privately within your local atelier environment.
          </p>
        </footer>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgba(255, 255, 255, 0.92)',
            color: '#192736',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(222, 142, 128, 0.4)',
            borderRadius: '9999px',
            boxShadow: '0 16px 36px -10px rgba(28, 43, 60, 0.12)',
            padding: '12px 24px',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
          },
        }}
      />
    </div>
  );
}
