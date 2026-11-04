import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ERPParser from './pages/ERPParser';
import RecoveryMode from './pages/RecoveryMode';
import WhatIf from './pages/WhatIf';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parser"
              element={
                <ProtectedRoute>
                  <ERPParser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recovery"
              element={
                <ProtectedRoute>
                  <RecoveryMode />
                </ProtectedRoute>
              }
            />

            <Route
              path="/what-if"
              element={
                <ProtectedRoute>
                  <WhatIf />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0d1322',
              color: '#f2f5fb',
              border: '1px solid rgba(212, 255, 36, 0.3)',
              borderRadius: '9999px',
              padding: '12px 24px',
              fontSize: '0.875rem',
              fontWeight: 600,
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}
