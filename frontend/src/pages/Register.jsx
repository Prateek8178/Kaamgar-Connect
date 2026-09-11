import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import Toast from '../components/Toast';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '', role: 'worker' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { Toast.warning('All fields are required.'); return; }
    if (form.password !== form.password2) { Toast.error('Passwords do not match.'); return; }
    if (form.password.length < 6) { Toast.warning('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const { data } = await register({ username: form.username, email: form.email, password: form.password, role: form.role });
      if (data.emailSent) {
        Toast.success('OTP sent to your email! Please verify.');
      } else {
        Toast.warning('Email not sent — your OTP is shown on the next screen.');
      }
      navigate('/verify-otp', {
        state: {
          pendingUserId: data.pendingUserId,
          email: data.email,
          emailFallbackOtp: data.otp || null,
        }
      });
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kc-auth-bg">
      <div className="kc-auth-wrapper" style={{ maxWidth: '520px' }}>

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
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create Your Account</h1>
            <p className="text-muted small">Join thousands of workers &amp; employers</p>
          </div>

          {/* Role Selector */}
          <div className="mb-4">
            <label className="form-label fw-600 small">I am a…</label>
            <div className="row g-2">
              <div className="col-6">
                <input type="radio" className="btn-check" name="role" id="roleWorker" value="worker" checked={form.role === 'worker'} onChange={handleChange} />
                <label className="btn btn-outline-primary w-100 py-3" htmlFor="roleWorker">
                  <i className="bi bi-hammer fs-4 d-block mb-1"></i>
                  <span className="fw-600">Worker</span>
                  <div className="small text-muted mt-1">Find skilled jobs</div>
                </label>
              </div>
              <div className="col-6">
                <input type="radio" className="btn-check" name="role" id="roleEmployer" value="employer" checked={form.role === 'employer'} onChange={handleChange} />
                <label className="btn btn-outline-primary w-100 py-3" htmlFor="roleEmployer">
                  <i className="bi bi-building fs-4 d-block mb-1"></i>
                  <span className="fw-600">Employer</span>
                  <div className="small text-muted mt-1">Hire Workers</div>
                </label>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mb-3">
              <label className="form-label fw-600 small">Username</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person"></i></span>
                <input id="regUsername" type="text" className="form-control" name="username" placeholder="Choose a username" value={form.username} onChange={handleChange} autoFocus />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-600 small">Email Address</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                <input id="regEmail" type="email" className="form-control" name="email" placeholder="Enter your email" value={form.email} onChange={handleChange} />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-600 small">Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input id="regPassword" type={showPwd ? 'text' : 'password'} className="form-control" name="password" placeholder="Create a password (min. 6 chars)" value={form.password} onChange={handleChange} />
                <button type="button" className="input-group-text" onClick={() => setShowPwd(!showPwd)} style={{ cursor: 'pointer' }}>
                  <i className={`bi bi-eye${showPwd ? '-slash' : ''}`}></i>
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label fw-600 small">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                <input id="regPassword2" type={showPwd ? 'text' : 'password'} className="form-control" name="password2" placeholder="Re-enter password" value={form.password2} onChange={handleChange} />
              </div>
            </div>
            <button id="registerBtn" type="submit" className="btn btn-primary w-100 btn-pill" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating Account…</> : <><i className="bi bi-stars me-2"></i>Create Account</>}
            </button>
          </form>
          <hr className="my-4" />
          <div className="text-center small">
            <p className="mb-0">Already have an account? <Link to="/login" className="fw-600" style={{ color: 'var(--p)' }}>Sign In</Link></p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
