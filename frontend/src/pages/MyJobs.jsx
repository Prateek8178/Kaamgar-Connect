import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyJobs, deleteJob, toggleJob } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Toast from '../components/Toast';


const CATEGORY_LABELS = { construction:'Construction',electrical:'Electrical',plumbing:'Plumbing',carpentry:'Carpentry',painting:'Painting',driving:'Driving',cooking:'Cooking',cleaning:'Cleaning',security:'Security',welding:'Welding',ac_tech:'AC Technician',tailoring:'Tailoring',other:'Other' };

const MyJobs = () => {
  const [data, setData] = useState({ jobs: [], activeCount: 0, totalApps: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);

  const fetchJobs = () => {
    setLoading(true);
    getMyJobs().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleToggle = async (id) => {
    try {
      const r = await toggleJob(id);
      Toast.success(r.data.message);
      fetchJobs();
    } catch { Toast.error('Failed.'); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteJob(id);
      Toast.success(`"${title}" deleted.`);
      fetchJobs();
    } catch { Toast.error('Delete failed.'); }
  };

  return (
    <MainLayout>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}><i className="bi bi-collection-fill me-2" style={{ color: 'var(--p)' }}></i>My Jobs</h1>
          <p className="text-muted small">{data.jobs.length} jobs posted</p>
        </div>
        <Link to="/jobs/post" className="btn btn-primary btn-pill"><i className="bi bi-plus-circle me-2"></i>Post New Job</Link>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Active Jobs', value: data.activeCount, icon: 'collection-fill', color: 'blue' },
          { label: 'Total Applicants', value: data.totalApps, icon: 'people-fill', color: 'purple' },
          { label: 'Total Views', value: data.totalViews, icon: 'eye', color: 'amber' },
        ].map(s => (
          <div key={s.label} className="col-md-4">
            <div className={`kc-stat stat-${s.color}`}>
              <div className="stat-icon"><i className={`bi bi-${s.icon}`}></i></div>
              <div className="stat-info"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="d-flex flex-column gap-3">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }}></div>)}</div>
      ) : data.jobs.length === 0 ? (
        <div className="kc-empty">
          <i className="bi bi-briefcase kc-empty-icon"></i>
          <div className="kc-empty-title">No jobs posted yet</div>
          <Link to="/jobs/post" className="btn btn-primary btn-pill mt-3">Post Your First Job</Link>
        </div>
      ) : (
        <div className="kc-card p-0">
          <div className="kc-table-wrap">
            <table className="kc-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Category</th>
                  <th>Salary</th>
                  <th>Apps</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.jobs.map(job => (
                  <tr key={job._id}>
                    <td>
                      <Link to={`/jobs/${job._id}`} className="fw-700 text-decoration-none" style={{ color: 'var(--text-primary)' }}>{job.title}</Link>
                      <div className="text-muted small"><i className="bi bi-geo-alt me-1"></i>{job.location}</div>
                    </td>
                    <td><span className="kc-badge badge-primary">{CATEGORY_LABELS[job.category]}</span></td>
                    <td className="small">₹{job.salaryMin?.toLocaleString('en-IN')}–{job.salaryMax?.toLocaleString('en-IN')}</td>
                    <td>
                      <Link to={`/jobs/${job._id}/applicants`} className="fw-700" style={{ color: 'var(--p)' }}>{job.applicationsCount || 0}</Link>
                    </td>
                    <td className="small text-muted">{job.views}</td>
                    <td>
                      <span className={`kc-badge ${job.isActive ? 'badge-success' : 'badge-gray'}`}>
                        {job.isActive ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link to={`/jobs/edit/${job._id}`} className="btn btn-ghost btn-sm" title="Edit"><i className="bi bi-pencil"></i></Link>
                        <button className="btn btn-ghost btn-sm" title={job.isActive ? 'Pause' : 'Activate'} onClick={() => handleToggle(job._id)}>
                          <i className={`bi bi-${job.isActive ? 'pause-circle' : 'play-circle'}`}></i>
                        </button>
                        <button className="btn btn-ghost btn-sm text-danger" title="Delete" onClick={() => handleDelete(job._id, job.title)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default MyJobs;
