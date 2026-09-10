import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { Toast.warning('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const { data } = await login(form);
      if (data.requiresOtp) {
        Toast.info('OTP sent to your email. Please verify.');
        navigate('/verify-otp', { state: { pendingUserId: data.pendingUserId, email: data.email, fromLogin: true } });
      } else {
        loginUser(data.token, data.user);
        Toast.success(`Welcome back, ${data.user.firstName || data.user.username}! 👋`);
        navigate('/dashboard');
      }
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kc-auth-bg">
      <div className="kc-auth-wrapper">

        {/* Brand Logo */}
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3">
            <div className="brand-icon" style={{ width: '44px', height: '44px', fontSize: '1.3rem' }}>K</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)' }}>Kaamgar Connect</span>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="kc-auth-card">
          <div className="text-center mb-4">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome Back</h1>
            <p className="text-muted small">Sign in to your account to continue</p>
          </div>
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mb-3">
              <label className="form-label fw-600 small">Username</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person"></i></span>
                <input
                  id="loginUsername"
                  type="text"
                  className="form-control"
                  name="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label fw-600 small">Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input
                  id="loginPassword"
                  type={showPwd ? 'text' : 'password'}
                  className="form-control"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button type="button" className="input-group-text" onClick={() => setShowPwd(!showPwd)} style={{ cursor: 'pointer' }}>
                  <i className={`bi bi-eye${showPwd ? '-slash' : ''}`}></i>
                </button>
              </div>
              <div className="text-end mt-1">
                <Link to="/forgot-password" className="small fw-600" style={{ color: 'var(--p)', textDecoration: 'none' }}>
                  <i className="bi bi-question-circle me-1"></i>Forgot Password?
                </Link>
              </div>
            </div>
            <button id="loginBtn" type="submit" className="btn btn-primary w-100 btn-pill" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Signing in…</> : <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>}
            </button>
          </form>
          <hr className="my-4" />
          <div className="text-center small">
            <p className="mb-1">Don't have an account? <Link to="/register" className="fw-600" style={{ color: 'var(--p)' }}>Register Free</Link></p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
