import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    }
  };

  const fillDemo = () => {
    setEmail('hardik.24eskit059@skit.ac.in');
    setPassword('attendify123');
  };

  return (
    <div className="auth-page">
      <div className="auth-container fade-in">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-secondary)', color: '#030407', marginBottom: '16px', boxShadow: 'var(--shadow-lime)' }}>
            <Zap size={30} fill="#030407" />
          </div>
          <h1 className="gradient-text">SMART ATTENDENDENCE CALCULATOR</h1>
          <p>Institutional Attendance Criteria Engine & Recovery Planner</p>
        </div>

        <div className="auth-form">
          <h2 style={{ marginBottom: '22px', fontSize: '1.25rem', textAlign: 'center', letterSpacing: '-0.01em' }}>
            Student Portal Sign In
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <Mail size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@skit.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '12px' }}>
              {loading ? 'Authenticating...' : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  Sign In <ArrowRight size={16} />
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={fillDemo}
              className="btn btn-secondary"
              style={{ marginTop: '12px', width: '100%', fontSize: '0.825rem' }}
            >
              Fill Demo Profile (Hardik Singhal • 24ESKIT059)
            </button>
          </form>

          <div className="auth-toggle">
            Don't have an account?{' '}
            <Link to="/signup">
              Create Student Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
