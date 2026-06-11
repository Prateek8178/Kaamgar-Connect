import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="kc-auth-bg min-vh-100 d-flex align-items-center justify-content-center">
      <div id="toastContainer"></div>
      <div className="text-center px-4">
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔍</div>
        <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--p)', marginBottom: '0' }}>404</h1>
        <h2 className="fw-800 mb-3" style={{ fontSize: '1.5rem' }}>Page Not Found</h2>
        <p className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto 2rem' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <button className="btn btn-secondary btn-pill px-4" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i>Go Back
          </button>
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="btn btn-primary btn-pill px-4">
            <i className="bi bi-house me-2"></i>{isAuthenticated ? 'Dashboard' : 'Home'}
          </Link>
          <Link to="/jobs" className="btn btn-ghost btn-pill px-4">
            <i className="bi bi-briefcase me-2"></i>Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
