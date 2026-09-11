import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  const { pendingUserId, email, fromLogin, emailFallbackOtp } = location.state || {};

  useEffect(() => {
    if (!pendingUserId) navigate('/register');
    inputRefs.current[0]?.focus();
    const timer = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every(d => d) && next.join('').length === 6) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (otpStr) => {
    const code = otpStr || otp.join('');
    if (code.length < 6) { Toast.warning('Please enter all 6 digits.'); return; }
    setLoading(true);
    try {
      const { data } = await verifyOtp({ userId: pendingUserId, otp: code });
      loginUser(data.token, data.user);
      Toast.success(data.message || 'Email verified! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Invalid or expired OTP.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await resendOtp({ userId: pendingUserId });
      Toast.success('New OTP sent!');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
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
        <div className="kc-auth-card text-center">
          <div className="mb-4">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Verify Your Email</h1>
            <p className="text-muted small">
              {emailFallbackOtp
                ? <>Email delivery failed. Enter this OTP:<br /></>
                : <>We sent a 6-digit OTP to<br /></>}
              <strong style={{ color: 'var(--p)' }}>{email || 'your email'}</strong>
            </p>
          </div>

          {/* OTP Fallback Box — shown when email couldn't be sent */}
          {emailFallbackOtp && (
            <div style={{
              background: 'rgba(99,102,241,0.12)',
              border: '2px solid var(--p)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '20px',
            }}>
              <div className="small text-muted mb-1">⚠️ Email not delivered — Your OTP is:</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '8px', color: 'var(--p)' }}>
                {emailFallbackOtp}
              </div>
              <div className="small text-muted mt-1">Copy this and enter below ↓</div>
            </div>
          )}

          <div className="kc-otp-grid mb-4" onPaste={handlePaste}>
            {otp.map((d, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                className="kc-otp-input"
                maxLength={1}
                value={d}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                id={`otp${i}`}
              />
            ))}
          </div>

          <button
            id="verifyOtpBtn"
            className="btn btn-primary w-100 btn-pill mb-3"
            onClick={() => handleVerify()}
            disabled={loading || otp.join('').length < 6}
          >
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Verifying…</> : <><i className="bi bi-shield-check me-2"></i>Verify OTP</>}
          </button>

          <div className="small text-muted">
            Didn't get the code?{' '}
            {countdown > 0 ? (
              <span>Resend in <strong>{countdown}s</strong></span>
            ) : (
              <button className="btn btn-link btn-sm p-0 fw-600" onClick={handleResend} disabled={resending} style={{ color: 'var(--p)' }}>
                {resending ? 'Sending…' : 'Resend OTP'}
              </button>
            )}
          </div>

          <hr className="my-4" />
          <Link to={fromLogin ? '/login' : '/register'} className="small" style={{ color: 'var(--p)' }}>
            <i className="bi bi-arrow-left me-1"></i>Back
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyOTP;
