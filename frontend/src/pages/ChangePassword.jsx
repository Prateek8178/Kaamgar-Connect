import React, { useState } from 'react';
import { changePassword } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import Toast from '../components/Toast';

const ChangePassword = () => {
  const { logoutUser } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', newPassword2: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.newPassword !== form.newPassword2) { Toast.error('New passwords do not match.'); return; }
    if (form.newPassword.length < 6) { Toast.warning('New password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      Toast.success('Password changed successfully! Please log in again.');
      setTimeout(() => logoutUser(), 1500);
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-4">
        <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}><i className="bi bi-shield-lock-fill me-2" style={{ color: 'var(--p)' }}></i>Change Password</h1>
        <p className="text-muted small">Update your account password</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="kc-card">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-600 small">Current Password</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-lock"></i></span>
                  <input type={showPwd ? 'text' : 'password'} className="form-control" name="currentPassword" value={form.currentPassword} onChange={handleChange} placeholder="Current password" />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-600 small">New Password</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                  <input id="newPassword" type={showPwd ? 'text' : 'password'} className="form-control" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="New password (min. 6 chars)" />
                  <button type="button" className="input-group-text" onClick={() => setShowPwd(!showPwd)} style={{ cursor: 'pointer' }}>
                    <i className={`bi bi-eye${showPwd ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label fw-600 small">Confirm New Password</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                  <input type={showPwd ? 'text' : 'password'} className="form-control" name="newPassword2" value={form.newPassword2} onChange={handleChange} placeholder="Re-enter new password" />
                </div>
              </div>
              <button id="changePasswordBtn" type="submit" className="btn btn-primary w-100 btn-pill" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Updating…</> : <><i className="bi bi-shield-check me-2"></i>Update Password</>}
              </button>
            </form>
            <div className="alert alert-secondary mt-4 small" style={{ borderRadius: '10px' }}>
              <i className="bi bi-info-circle me-2"></i>After changing your password, you will be logged out automatically.
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChangePassword;
