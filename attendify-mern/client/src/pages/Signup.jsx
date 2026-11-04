import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Hash, Mail, Lock, ArrowRight, Zap } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('Hardik Singhal');
  const [rollNo, setRollNo] = useState('24ESKIT059');
  const [email, setEmail] = useState('hardik.24eskit059@skit.ac.in');
  const [password, setPassword] = useState('attendify123');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !rollNo || !email || !password) return;
    setLoading(true);
    const result = await signup({ name, rollNo, email, password });
    setLoading(false);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container fade-in">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-secondary)', color: '#030407', marginBottom: '16px', boxShadow: 'var(--shadow-lime)' }}>
            <Zap size={30} fill="#030407" />
          </div>
          <h1 className="gradient-text">SMART ATTENDENDENCE CALCULATOR</h1>
          <p>Register your student profile to track ERP criteria</p>
        </div>

        <div className="auth-form">
          <h2 style={{ marginBottom: '22px', fontSize: '1.25rem', textAlign: 'center' }}>
            New Student Registration
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <User size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Full Name
              </label>
              <input
                type="text"
                placeholder="Hardik Singhal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Hash size={14} style={{ display: 'inline', marginRight: '6px' }} />
                College Roll Number
              </label>
              <input
                type="text"
                placeholder="24ESKIT059"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Mail size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Official Email
              </label>
              <input
                type="email"
                placeholder="hardik@skit.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Password (min 6 characters)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '12px' }}>
              {loading ? 'Creating Profile...' : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  Register & Continue <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <div className="auth-toggle">
            Already registered?{' '}
            <Link to="/login">
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
