import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';

const StatCard = ({ icon, label, value, color }) => (
  <div className="col-6 col-lg-3">
    <div className={`kc-stat stat-${color}`}>
      <div className="stat-icon"><i className={`bi bi-${icon}`}></i></div>
      <div className="stat-info">
        <div className="stat-value">{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  </div>
);

const WorkerDashboard = ({ data }) => {
  const { user } = useAuth();
  const wp = data.workerProfile;
  const stats = data.stats;
  const completion = data.completion;
  const avatarInitial = (user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase();

  return (
    <>
      {/* Profile Completion Banner */}
      {completion < 100 && (
        <div className="kc-card mb-4" style={{ borderLeft: '4px solid var(--p)' }}>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="flex-grow-1">
              <div className="fw-700 mb-1"><i className="bi bi-bar-chart-steps me-2" style={{ color: 'var(--p)' }}></i>Complete Your Profile</div>
              <div className="progress" style={{ height: '8px', borderRadius: '4px', background: 'var(--bg)' }}>
                <div className="progress-bar" role="progressbar" style={{ width: `${completion}%`, background: 'var(--p)', borderRadius: '4px' }}></div>
              </div>
              <div className="small text-muted mt-1">{completion}% complete — finish your profile to get more job offers</div>
            </div>
            <Link to="/profile" className="btn btn-primary btn-sm btn-pill px-4">Complete Profile</Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="row g-3 mb-4">
        <StatCard icon="file-earmark-text" label="Applications" value={stats.totalApplications} color="blue" />
        <StatCard icon="check2-circle" label="Accepted" value={stats.accepted} color="green" />
        <StatCard icon="hourglass-split" label="Pending" value={stats.pending} color="amber" />
        <StatCard icon="briefcase" label="Available Jobs" value={stats.availableJobs} color="purple" />
      </div>

      <div className="row g-4">
        {/* Recent Applications */}
        <div className="col-lg-7">
          <div className="kc-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="fw-700 mb-0" style={{ fontSize: '1.05rem' }}><i className="bi bi-clock-history me-2" style={{ color: 'var(--p)' }}></i>Recent Applications</h2>
              <Link to="/applications" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            {data.recentApplications.length === 0 ? (
              <div className="kc-empty py-4">
                <i className="bi bi-file-earmark-plus kc-empty-icon"></i>
                <div className="kc-empty-title">No applications yet</div>
                <div className="kc-empty-sub">Start applying to jobs below</div>
                <Link to="/jobs" className="btn btn-primary btn-sm btn-pill mt-3">Browse Jobs</Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {data.recentApplications.map(app => (
                  <div key={app._id} className="d-flex align-items-center gap-3 p-3" style={{ background: 'var(--bg)', borderRadius: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--p)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="bi bi-briefcase text-white"></i>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-700 small text-truncate">{app.job?.title}</div>
                      <div className="text-muted" style={{ fontSize: '.78rem' }}>{app.job?.location} · {new Date(app.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                    <span className={`status-chip chip-${app.status}`}>{app.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="col-lg-5">
          <div className="kc-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="fw-700 mb-0" style={{ fontSize: '1.05rem' }}><i className="bi bi-stars me-2" style={{ color: 'var(--accent)' }}></i>For You</h2>
              <Link to="/jobs" className="btn btn-ghost btn-sm">Browse All</Link>
            </div>
            {data.recommendedJobs.length === 0 ? (
              <div className="kc-empty py-4">
                <i className="bi bi-search kc-empty-icon"></i>
                <div className="kc-empty-title">No recommendations</div>
                <Link to="/jobs" className="btn btn-primary btn-sm btn-pill mt-3">Browse Jobs</Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {data.recommendedJobs.map(job => (
                  <Link key={job._id} to={`/jobs/${job._id}`} className="d-flex align-items-center gap-3 p-3 text-decoration-none kc-card-hover" style={{ background: 'var(--bg)', borderRadius: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,var(--p),var(--p-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                      {job.categoryIcon}
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-700 small text-truncate" style={{ color: 'var(--text-primary)' }}>{job.title}</div>
                      <div className="text-muted" style={{ fontSize: '.78rem' }}>₹{job.salaryMin}–{job.salaryMax}/mo · {job.location}</div>
                    </div>
                    {job.isFeatured && <span className="kc-badge badge-primary" style={{ fontSize: '.65rem' }}>Featured</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const EmployerDashboard = ({ data }) => {
  const stats = data.stats;
  return (
    <>
      <div className="row g-3 mb-4">
        <StatCard icon="collection-fill" label="Active Jobs" value={stats.activeJobs} color="blue" />
        <StatCard icon="people-fill" label="Total Applicants" value={stats.totalApplicants} color="purple" />
        <StatCard icon="check2-circle" label="Hired" value={stats.hired} color="green" />
        <StatCard icon="eye" label="Total Views" value={stats.totalViews} color="amber" />
      </div>

      <div className="row g-4">
        {/* Active Jobs */}
        <div className="col-lg-6">
          <div className="kc-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="fw-700 mb-0" style={{ fontSize: '1.05rem' }}><i className="bi bi-collection-fill me-2" style={{ color: 'var(--p)' }}></i>Active Jobs</h2>
              <div className="d-flex gap-2">
                <Link to="/jobs/post" className="btn btn-primary btn-sm btn-pill"><i className="bi bi-plus-circle me-1"></i>Post</Link>
                <Link to="/jobs/my-jobs" className="btn btn-ghost btn-sm">View All</Link>
              </div>
            </div>
            {data.myJobs.length === 0 ? (
              <div className="kc-empty py-4">
                <i className="bi bi-briefcase-fill kc-empty-icon"></i>
                <div className="kc-empty-title">No active jobs</div>
                <Link to="/jobs/post" className="btn btn-primary btn-sm btn-pill mt-3">Post a Job</Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {data.myJobs.map(job => (
                  <div key={job._id} className="d-flex align-items-center gap-3 p-3" style={{ background: 'var(--bg)', borderRadius: '10px' }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <Link to={`/jobs/${job._id}`} className="fw-700 small text-decoration-none" style={{ color: 'var(--text-primary)' }}>{job.title}</Link>
                      <div className="text-muted" style={{ fontSize: '.78rem' }}>{job.location} · <i className="bi bi-eye"></i> {job.views}</div>
                    </div>
                    <Link to={`/jobs/${job._id}/applicants`} className="btn btn-ghost btn-sm">Applicants</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Applicants */}
        <div className="col-lg-6">
          <div className="kc-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="fw-700 mb-0" style={{ fontSize: '1.05rem' }}><i className="bi bi-person-lines-fill me-2" style={{ color: 'var(--p)' }}></i>Recent Applicants</h2>
            </div>
            {data.recentApplicants.length === 0 ? (
              <div className="kc-empty py-4">
                <i className="bi bi-person-plus kc-empty-icon"></i>
                <div className="kc-empty-title">No applicants yet</div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {data.recentApplicants.map(app => {
                  const initial = (app.worker?.firstName?.[0] || app.worker?.username?.[0] || 'W').toUpperCase();
                  return (
                    <div key={app._id} className="d-flex align-items-center gap-3 p-3" style={{ background: 'var(--bg)', borderRadius: '10px' }}>
                      <div className="kc-avatar kc-avatar-sm">
                        {app.worker?.profilePhoto ? <img src={`http://localhost:5000${app.worker.profilePhoto}`} alt="" /> : initial}
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="fw-700 small">{app.worker?.firstName ? `${app.worker.firstName} ${app.worker.lastName}`.trim() : app.worker?.username}</div>
                        <div className="text-muted text-truncate" style={{ fontSize: '.78rem' }}>{app.job?.title}</div>
                      </div>
                      <span className={`status-chip chip-${app.status}`}>{app.status}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}>
            👋 Welcome back, {user?.firstName || user?.username}!
          </h1>
          <p className="text-muted small mb-0">Here's what's happening on your account today.</p>
        </div>
      </div>

      {loading ? (
        <div className="row g-3 mb-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="col-6 col-lg-3">
              <div className="skeleton" style={{ height: '80px', borderRadius: '12px' }}></div>
            </div>
          ))}
        </div>
      ) : data ? (
        data.role === 'worker' ? <WorkerDashboard data={data} /> : <EmployerDashboard data={data} />
      ) : (
        <div className="kc-empty"><div className="kc-empty-title">Failed to load dashboard</div></div>
      )}
    </MainLayout>
  );
};

export default Dashboard;
