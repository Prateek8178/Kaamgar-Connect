import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getMyApplications, withdrawApplication } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Toast from '../components/Toast';

const STATUS_COLORS = { pending:'amber', reviewed:'blue', shortlisted:'purple', accepted:'green', rejected:'red' };

const MyApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [apps, setApps] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const statusFilter = searchParams.get('status') || '';

  const fetchApps = () => {
    setLoading(true);
    getMyApplications(statusFilter ? { status: statusFilter } : {})
      .then(r => { setApps(r.data.applications); setCounts(r.data.counts); })
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchApps(); }, [searchParams.toString()]);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await withdrawApplication(id);
      Toast.info('Application withdrawn.');
      fetchApps();
    } catch (err) { Toast.error(err.response?.data?.message || 'Cannot withdraw.'); }
  };

  const filters = [
    { key: '', label: 'All', count: counts.all },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'reviewed', label: 'Reviewed', count: counts.reviewed },
    { key: 'shortlisted', label: 'Shortlisted', count: counts.shortlisted },
    { key: 'accepted', label: 'Accepted', count: counts.accepted },
    { key: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  return (
    <MainLayout>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}><i className="bi bi-file-earmark-text-fill me-2" style={{ color: 'var(--p)' }}></i>My Applications</h1>
          <p className="text-muted small">{counts.all || 0} total applications</p>
        </div>
        <Link to="/jobs" className="btn btn-primary btn-pill btn-sm"><i className="bi bi-briefcase me-1"></i>Browse Jobs</Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {filters.map(f => (
          <button key={f.key} className={`btn btn-sm btn-pill ${statusFilter === f.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { const p = new URLSearchParams(); if (f.key) p.set('status', f.key); setSearchParams(p); }}>
            {f.label} {f.count > 0 && <span className="badge bg-opacity-20 ms-1" style={{ background: 'rgba(255,255,255,.2)' }}>{f.count}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="d-flex flex-column gap-3">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }}></div>)}
        </div>
      ) : apps.length === 0 ? (
        <div className="kc-empty">
          <i className="bi bi-file-earmark-x kc-empty-icon"></i>
          <div className="kc-empty-title">No applications yet</div>
          <div className="kc-empty-sub">Start applying to jobs to see them here</div>
          <Link to="/jobs" className="btn btn-primary btn-pill mt-3">Browse Jobs</Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {apps.map(app => (
            <div key={app._id} className="kc-card">
              <div className="row align-items-center g-3">
                <div className="col-md-6">
                  <Link to={`/jobs/${app.job?._id}`} className="fw-700 text-decoration-none" style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
                    {app.job?.title}
                  </Link>
                  <div className="d-flex flex-wrap gap-2 mt-1 small text-muted">
                    <span><i className="bi bi-building me-1"></i>{app.job?.employer?.username || 'Employer'}</span>
                    <span>·</span>
                    <span><i className="bi bi-geo-alt me-1"></i>{app.job?.location}</span>
                    <span>·</span>
                    <span><i className="bi bi-currency-rupee me-1"></i>₹{app.job?.salaryMin?.toLocaleString('en-IN')}–{app.job?.salaryMax?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="col-md-2 text-muted small">
                  <i className="bi bi-calendar me-1"></i>
                  {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className="col-md-2">
                  <span className={`status-chip chip-${STATUS_COLORS[app.status]}`}>{app.status}</span>
                </div>
                <div className="col-md-2 text-end">
                  {app.status === 'pending' && (
                    <button className="btn btn-danger btn-sm btn-pill" onClick={() => handleWithdraw(app._id)}>
                      <i className="bi bi-x-circle me-1"></i>Withdraw
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default MyApplications;
