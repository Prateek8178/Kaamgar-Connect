import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

// ── Yeh 3 steps hain: email → otp → new password ───────────────────────────
const STEP_EMAIL = 1;
const STEP_OTP   = 2;
const STEP_PASS  = 3;

const ForgotPassword = () => {
  const navigate   = useNavigate();
  const { loginUser } = useAuth();

  const [step,    setStep]    = useState(STEP_EMAIL);
  const [loading, setLoading] = useState(false);
  const [email,   setEmail]   = useState('');
  const [userId,  setUserId]  = useState('');
  const [otp,     setOtp]     = useState(['', '', '', '', '', '']);
  const [newPwd,  setNewPwd]  = useState('');
  const [confPwd, setConfPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [timer,   setTimer]   = useState(0);

  const otpRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // ── Step 1: Email bhejo ─────────────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { Toast.warning('Please enter your email.'); return; }
    setLoading(true);
    try {
      const { data } = await forgotPassword({ email: email.trim() });
      if (data.pendingUserId) {
        setUserId(data.pendingUserId);
        setStep(STEP_OTP);
        setTimer(60);
        Toast.success('OTP sent! Check your email inbox.');
      } else {
        // User not found — still show OTP step for security
        Toast.info(data.message || 'If this email is registered, OTP has been sent.');
      }
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Input Handlers ──────────────────────────────────────────────────
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { Toast.warning('Please enter the complete 6-digit OTP.'); return; }
    setStep(STEP_PASS);
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      const { data } = await forgotPassword({ email });
      if (data.pendingUserId) setUserId(data.pendingUserId);
      setOtp(['', '', '', '', '', '']);
      setTimer(60);
      Toast.success('New OTP sent!');
      otpRefs.current[0]?.focus();
    } catch (err) {
      Toast.error('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: New Password set karo ──────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPwd.length < 6) { Toast.warning('Password must be at least 6 characters.'); return; }
    if (newPwd !== confPwd) { Toast.error('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { data } = await resetPassword({ userId, otp: otp.join(''), newPassword: newPwd });
      loginUser(data.token, data.user);
      Toast.success('Password reset successfully! Welcome back 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed.';
      Toast.error(msg);
      // Agar OTP expired toh wapas OTP step pe
      if (msg.toLowerCase().includes('otp')) {
        setStep(STEP_OTP);
        setOtp(['', '', '', '', '', '']);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Progress Bar ────────────────────────────────────────────────────────
  const progressPct = step === STEP_EMAIL ? 33 : step === STEP_OTP ? 66 : 100;

  return (
    <div className="kc-auth-bg">
      <div className="kc-auth-wrapper">

        {/* Brand */}
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3">
            <div className="brand-icon" style={{ width: '44px', height: '44px', fontSize: '1.3rem' }}>K</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)' }}>Kaamgar Connect</span>
          </Link>
        </div>

        <div className="kc-auth-card">

          {/* Step Indicator */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              {['Email', 'OTP', 'New Password'].map((label, i) => (
                <div key={i} className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: step > i + 1 ? 'var(--p)' : step === i + 1 ? 'var(--p)' : 'var(--card-border)',
                    color: step >= i + 1 ? '#fff' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700,
                    transition: 'all 0.3s ease',
                  }}>
                    {step > i + 1 ? <i className="bi bi-check-lg" /> : i + 1}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: step === i + 1 ? 'var(--p)' : 'var(--text-muted)', marginTop: 4, fontWeight: step === i + 1 ? 700 : 400 }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ height: 4, background: 'var(--card-border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--p)', transition: 'width 0.4s ease' }} />
            </div>
          </div>

          {/* ── STEP 1: Email ── */}
          {step === STEP_EMAIL && (
            <>
              <div className="text-center mb-4">
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔑</div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Forgot Password?</h1>
                <p className="text-muted small">Enter your registered email — we'll send an OTP to reset your password.</p>
              </div>
              <form onSubmit={handleEmailSubmit} autoComplete="off">
                <div className="mb-4">
                  <label className="form-label fw-600 small">Registered Email</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope" /></span>
                    <input
                      id="fpEmail"
                      type="email"
                      className="form-control"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                </div>
                <button id="fpEmailBtn" type="submit" className="btn btn-primary w-100 btn-pill" disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2" />Sending OTP…</> : <><i className="bi bi-send me-2" />Send OTP</>}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === STEP_OTP && (
            <>
              <div className="text-center mb-4">
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📧</div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Check Your Email</h1>
                <p className="text-muted small">
                  We sent a 6-digit OTP to <strong style={{ color: 'var(--p)' }}>{email}</strong>
                </p>
              </div>
              <form onSubmit={handleOtpSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-600 small text-center d-block">Enter OTP</label>
                  <div className="d-flex justify-content-center gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => otpRefs.current[i] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="form-control text-center fw-700"
                        style={{
                          width: 48, height: 56, fontSize: '1.4rem',
                          borderRadius: 10, border: digit ? '2px solid var(--p)' : '2px solid var(--card-border)',
                          transition: 'border 0.2s',
                        }}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>

                <button id="fpOtpBtn" type="submit" className="btn btn-primary w-100 btn-pill mb-3" disabled={otp.join('').length < 6}>
                  <i className="bi bi-shield-check me-2" />Verify OTP
                </button>

                <div className="text-center small">
                  {timer > 0 ? (
                    <span className="text-muted">Resend OTP in <strong style={{ color: 'var(--p)' }}>{timer}s</strong></span>
                  ) : (
                    <button type="button" className="btn btn-link btn-sm p-0 fw-600" style={{ color: 'var(--p)' }} onClick={handleResend} disabled={loading}>
                      {loading ? 'Sending…' : '🔄 Resend OTP'}
                    </button>
                  )}
                </div>
              </form>
              <button type="button" className="btn btn-link btn-sm d-block mx-auto mt-2 text-muted" onClick={() => { setStep(STEP_EMAIL); setOtp(['','','','','','']); }}>
                ← Change Email
              </button>
            </>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === STEP_PASS && (
            <>
              <div className="text-center mb-4">
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🔐</div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Set New Password</h1>
                <p className="text-muted small">Choose a strong password for your account.</p>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-600 small">New Password</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock" /></span>
                    <input
                      id="fpNewPwd"
                      type={showPwd ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Min 6 characters"
                      value={newPwd}
                      onChange={e => setNewPwd(e.target.value)}
                      autoFocus
                      required
                      minLength={6}
                    />
                    <button type="button" className="input-group-text" onClick={() => setShowPwd(!showPwd)} style={{ cursor: 'pointer' }}>
                      <i className={`bi bi-eye${showPwd ? '-slash' : ''}`} />
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-600 small">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock-fill" /></span>
                    <input
                      id="fpConfPwd"
                      type={showPwd ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Re-enter new password"
                      value={confPwd}
                      onChange={e => setConfPwd(e.target.value)}
                      required
                    />
                  </div>
                  {confPwd && newPwd !== confPwd && (
                    <div className="mt-1 small text-danger"><i className="bi bi-x-circle me-1" />Passwords do not match</div>
                  )}
                  {confPwd && newPwd === confPwd && (
                    <div className="mt-1 small text-success"><i className="bi bi-check-circle me-1" />Passwords match</div>
                  )}
                </div>
                <button id="fpResetBtn" type="submit" className="btn btn-primary w-100 btn-pill" disabled={loading || newPwd !== confPwd}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2" />Resetting…</> : <><i className="bi bi-check2-circle me-2" />Reset Password</>}
                </button>
              </form>
            </>
          )}

          <hr className="my-4" />
          <div className="text-center small">
            <p className="mb-0">Remember your password? <Link to="/login" className="fw-600" style={{ color: 'var(--p)' }}>Sign In</Link></p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
