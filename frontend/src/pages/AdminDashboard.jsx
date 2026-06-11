import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard, toggleAdminUser, verifyWorker, toggleJobFeatured } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Toast from '../components/Toast';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    getAdminDashboard().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleToggleUser = async (id) => {
    try { await toggleAdminUser(id); Toast.success('User status updated.'); fetch(); } catch { Toast.error('Failed.'); }
  };

  const handleVerify = async (id) => {
    try { await verifyWorker(id); Toast.success('Worker verified!'); fetch(); } catch { Toast.error('Failed.'); }
  };

  const handleFeature = async (id) => {
    try { await toggleJobFeatured(id); Toast.success('Job feature status updated.'); fetch(); } catch { Toast.error('Failed.'); }
  };

  const stats = data?.stats;

  return (
    <MainLayout>
      <div className="mb-4">
        <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}><i className="bi bi-speedometer2 me-2" style={{ color: 'var(--p)' }}></i>Admin Dashboard</h1>
        <div className="d-flex gap-2 mt-2">
          <Link to="/admin/users" className="btn btn-ghost btn-sm"><i className="bi bi-people me-1"></i>Users</Link>
          <Link to="/admin/jobs" className="btn btn-ghost btn-sm"><i className="bi bi-briefcase me-1"></i>Jobs</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-3 mb-4">
        {[
          { label:'Total Users', value: stats?.totalUsers, icon:'people-fill', color:'blue' },
          { label:'Workers', value: stats?.totalWorkers, icon:'hammer', color:'amber' },
          { label:'Employers', value: stats?.totalEmployers, icon:'building', color:'purple' },
          { label:'Active Jobs', value: stats?.activeJobs, icon:'briefcase-fill', color:'green' },
          { label:'Total Apps', value: stats?.totalApps, icon:'file-earmark-text', color:'teal' },
          { label:'Pending Apps', value: stats?.pendingApps, icon:'hourglass-split', color:'rose' },
          { label:'Verified Workers', value: stats?.verifiedWorkers, icon:'patch-check-fill', color:'green' },
          { label:'New This Week', value: stats?.newUsersWeek, icon:'person-plus', color:'blue' },
        ].map(s => (
          <div key={s.label} className="col-6 col-md-4 col-xl-3">
            <div className={`kc-stat stat-${s.color}`}>
              <div className="stat-icon"><i className={`bi bi-${s.icon}`}></i></div>
              <div className="stat-info"><div className="stat-value">{s.value ?? '—'}</div><div className="stat-label">{s.label}</div></div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Recent Users */}
        <div className="col-lg-6">
          <div className="kc-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}><i className="bi bi-people me-2" style={{ color: 'var(--p)' }}></i>Recent Users</h2>
              <Link to="/admin/users" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            <div className="kc-table-wrap">
              <table className="kc-table">
                <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {(data?.recentUsers || []).map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="fw-700 small">{u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username}</div>
                        <div className="text-muted" style={{ fontSize: '.72rem' }}>{u.email}</div>
                      </td>
                      <td><span className="kc-badge badge-primary" style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                      <td><span className={`kc-badge ${u.isActive ? 'badge-success' : 'badge-gray'}`}>{u.isActive ? 'Active' : 'Blocked'}</span></td>
                      <td>
                        <button className={`btn btn-${u.isActive ? 'danger' : 'success'} btn-sm btn-pill`} style={{ fontSize: '.72rem' }} onClick={() => handleToggleUser(u._id)}>
                          {u.isActive ? 'Block' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="col-lg-6">
          <div className="kc-card h-100">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              <i className="bi bi-patch-check me-2" style={{ color: 'var(--accent)' }}></i>Pending Verifications
            </h2>
            {(data?.pendingVerifications || []).length === 0 ? (
              <div className="kc-empty py-3"><i className="bi bi-check2-circle kc-empty-icon"></i><div className="kc-empty-title">All verified!</div></div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {data.pendingVerifications.map(wp => (
                  <div key={wp._id} className="d-flex align-items-center gap-3 p-3" style={{ background: 'var(--bg)', borderRadius: '10px' }}>
                    <div className="kc-avatar kc-avatar-sm">{(wp.user?.firstName?.[0] || wp.user?.username?.[0] || 'W').toUpperCase()}</div>
                    <div className="flex-grow-1">
                      <div className="fw-700 small">{wp.user?.firstName ? `${wp.user.firstName} ${wp.user.lastName || ''}`.trim() : wp.user?.username}</div>
                      <div className="text-muted" style={{ fontSize: '.72rem' }}>{wp.user?.email}</div>
                    </div>
                    <button className="btn btn-success btn-sm btn-pill" onClick={() => handleVerify(wp.user._id)}>
                      <i className="bi bi-patch-check me-1"></i>Verify
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="col-12">
          <div className="kc-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}><i className="bi bi-briefcase me-2" style={{ color: 'var(--p)' }}></i>Recent Jobs</h2>
              <Link to="/admin/jobs" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            <div className="kc-table-wrap">
              <table className="kc-table">
                <thead><tr><th>Title</th><th>Employer</th><th>Category</th><th>Status</th><th>Featured</th></tr></thead>
                <tbody>
                  {(data?.recentJobs || []).map(job => (
                    <tr key={job._id}>
                      <td className="fw-700 small">{job.title}</td>
                      <td className="small text-muted">{job.employer?.firstName ? `${job.employer.firstName} ${job.employer.lastName || ''}`.trim() : job.employer?.username}</td>
                      <td><span className="kc-badge badge-primary" style={{ textTransform: 'capitalize' }}>{job.category}</span></td>
                      <td><span className={`kc-badge ${job.isActive ? 'badge-success' : 'badge-gray'}`}>{job.isActive ? 'Active' : 'Paused'}</span></td>
                      <td>
                        <button className={`btn btn-ghost btn-sm ${job.isFeatured ? 'text-warning' : ''}`} onClick={() => handleFeature(job._id)} title="Toggle featured">
                          <i className={`bi bi-star${job.isFeatured ? '-fill' : ''}`}></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
