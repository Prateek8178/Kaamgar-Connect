import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminJobs, toggleJobFeatured } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Toast from '../components/Toast';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchJobs = () => {
    setLoading(true);
    getAdminJobs().then(r => setJobs(r.data.jobs)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleFeature = async (id) => {
    try { await toggleJobFeatured(id); Toast.success('Feature status updated.'); fetchJobs(); } catch { Toast.error('Failed.'); }
  };

  const filtered = jobs.filter(j =>
    !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="mb-4">
        <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}><i className="bi bi-briefcase-fill me-2" style={{ color: 'var(--p)' }}></i>Manage Jobs</h1>
        <p className="text-muted small">{jobs.length} total jobs</p>
      </div>

      <div className="kc-card mb-4">
        <div className="input-group">
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input type="text" className="form-control" placeholder="Search title, location…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="d-flex flex-column gap-3">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '10px' }}></div>)}</div>
      ) : filtered.length === 0 ? (
        <div className="kc-empty"><div className="kc-empty-title">No jobs found</div></div>
      ) : (
        <div className="kc-card p-0">
          <div className="kc-table-wrap">
            <table className="kc-table">
              <thead><tr><th>Job</th><th>Employer</th><th>Category</th><th>Salary</th><th>Apps</th><th>Status</th><th>Featured</th></tr></thead>
              <tbody>
                {filtered.map(job => (
                  <tr key={job._id}>
                    <td>
                      <Link to={`/jobs/${job._id}`} className="fw-700 small text-decoration-none" style={{ color: 'var(--text-primary)' }}>{job.title}</Link>
                      <div className="text-muted" style={{ fontSize: '.72rem' }}><i className="bi bi-geo-alt me-1"></i>{job.location}</div>
                    </td>
                    <td className="small text-muted">{job.employer?.firstName ? `${job.employer.firstName} ${job.employer.lastName || ''}`.trim() : job.employer?.username}</td>
                    <td><span className="kc-badge badge-primary" style={{ textTransform: 'capitalize' }}>{job.category}</span></td>
                    <td className="small">₹{job.salaryMin?.toLocaleString('en-IN')}–{job.salaryMax?.toLocaleString('en-IN')}</td>
                    <td className="fw-700" style={{ color: 'var(--p)' }}>{job.applicationsCount || 0}</td>
                    <td><span className={`kc-badge ${job.isActive ? 'badge-success' : 'badge-gray'}`}>{job.isActive ? 'Active' : 'Paused'}</span></td>
                    <td>
                      <button className={`btn btn-ghost btn-sm ${job.isFeatured ? 'text-warning' : ''}`} onClick={() => handleFeature(job._id)} title="Toggle featured">
                        <i className={`bi bi-star${job.isFeatured ? '-fill' : ''}`}></i> {job.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
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

export default AdminJobs;
