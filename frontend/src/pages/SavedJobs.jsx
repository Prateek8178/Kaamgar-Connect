import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSavedJobs, toggleSaveJob } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Toast from '../components/Toast';

const SavedJobs = () => {
  const [saves, setSaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    getSavedJobs().then(r => setSaves(r.data.saves)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleUnsave = async (jobId) => {
    try {
      await toggleSaveJob(jobId);
      Toast.info('Job removed from saved list.');
      setSaves(prev => prev.filter(j => j._id !== jobId));
    } catch { Toast.error('Failed.'); }
  };

  return (
    <MainLayout>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}><i className="bi bi-bookmark-heart-fill me-2" style={{ color: 'var(--p)' }}></i>Saved Jobs</h1>
          <p className="text-muted small">{saves.length} saved jobs</p>
        </div>
        <Link to="/jobs" className="btn btn-primary btn-pill btn-sm"><i className="bi bi-briefcase me-1"></i>Browse Jobs</Link>
      </div>

      {loading ? (
        <div className="row g-4">{[1,2,3].map(i => <div key={i} className="col-md-6 col-xl-4"><div className="skeleton" style={{ height: '200px', borderRadius: '16px' }}></div></div>)}</div>
      ) : saves.length === 0 ? (
        <div className="kc-empty">
          <i className="bi bi-bookmark kc-empty-icon"></i>
          <div className="kc-empty-title">No saved jobs</div>
          <div className="kc-empty-sub">Bookmark jobs you're interested in to find them later</div>
          <Link to="/jobs" className="btn btn-primary btn-pill mt-3">Browse Jobs</Link>
        </div>
      ) : (
        <div className="row g-4">
          {saves.map(job => (
            <div key={job._id} className="col-md-6 col-xl-4">
              <div className="kc-job-card h-100">
                <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                  <div>
                    <Link to={`/jobs/${job._id}`} className="fw-700 text-decoration-none" style={{ color: 'var(--text-primary)' }}>{job.title}</Link>
                    <div className="text-muted small">{job.employer?.fullName || job.employer?.username}</div>
                  </div>
                  <button onClick={() => handleUnsave(job._id)} className="btn btn-ghost btn-sm p-1" title="Remove from saved">
                    <i className="bi bi-bookmark-fill" style={{ color: 'var(--p)' }}></i>
                  </button>
                </div>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="kc-badge badge-primary">{job.categoryLabel}</span>
                  <span className="kc-badge badge-gray">{job.jobTypeLabel}</span>
                </div>
                <div className="d-flex flex-column gap-1 mb-3 small text-muted">
                  <div><i className="bi bi-geo-alt me-2"></i>{job.location}</div>
                  <div><i className="bi bi-currency-rupee me-2"></i>₹{job.salaryMin?.toLocaleString('en-IN')}–{job.salaryMax?.toLocaleString('en-IN')}/mo</div>
                </div>
                <div className="d-flex align-items-center justify-content-between mt-auto pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-muted" style={{ fontSize: '.75rem' }}>Saved {new Date(job.savedAt).toLocaleDateString('en-IN')}</span>
                  <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm btn-pill px-3">View Job</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default SavedJobs;
