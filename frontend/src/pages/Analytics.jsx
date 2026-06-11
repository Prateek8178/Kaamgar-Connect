import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../services/api';
import MainLayout from '../layouts/MainLayout';

const CATEGORY_LABELS = { construction:'Construction',electrical:'Electrical',plumbing:'Plumbing',carpentry:'Carpentry',painting:'Painting',driving:'Driving',cooking:'Cooking',cleaning:'Cleaning',security:'Security',welding:'Welding',ac_tech:'AC Tech',tailoring:'Tailoring',other:'Other' };
const STATUS_COLORS = { pending:'amber', reviewed:'blue', shortlisted:'purple', accepted:'green', rejected:'red' };

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <MainLayout>
      <div className="row g-3">{[1,2,3,4].map(i => <div key={i} className="col-md-3"><div className="skeleton" style={{ height: '80px', borderRadius: '12px' }}></div></div>)}</div>
    </MainLayout>
  );

  const maxMonthly = Math.max(...(data?.monthly || []).map(m => m.count), 1);

  return (
    <MainLayout>
      <div className="mb-4">
        <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}><i className="bi bi-bar-chart-fill me-2" style={{ color: 'var(--p)' }}></i>Analytics</h1>
        <p className="text-muted small">Performance overview for your jobs</p>
      </div>

      {/* Summary Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Jobs', value: data?.jobs?.length || 0, icon: 'collection-fill', color: 'blue' },
          { label: 'Total Views', value: data?.totalViews || 0, icon: 'eye', color: 'amber' },
          { label: 'Total Applicants', value: data?.totalApps || 0, icon: 'people-fill', color: 'purple' },
          { label: 'Hired', value: data?.hired || 0, icon: 'check2-circle', color: 'green' },
        ].map(s => (
          <div key={s.label} className="col-6 col-lg-3">
            <div className={`kc-stat stat-${s.color}`}>
              <div className="stat-icon"><i className={`bi bi-${s.icon}`}></i></div>
              <div className="stat-info"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Monthly chart */}
        <div className="col-lg-8">
          <div className="kc-card h-100">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}><i className="bi bi-bar-chart me-2" style={{ color: 'var(--p)' }}></i>Monthly Applications</h2>
            <div className="d-flex align-items-end gap-3" style={{ height: '160px' }}>
              {(data?.monthly || []).map((m, i) => (
                <div key={i} className="d-flex flex-column align-items-center gap-1 flex-grow-1">
                  <div className="small fw-700" style={{ color: 'var(--p)' }}>{m.count}</div>
                  <div style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    background: 'linear-gradient(to top, var(--p), var(--p-light))',
                    height: `${Math.round((m.count / maxMonthly) * 120)}px`,
                    minHeight: m.count > 0 ? '8px' : '2px',
                    transition: 'height .5s ease',
                  }}></div>
                  <div className="text-muted" style={{ fontSize: '.72rem' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Application status breakdown */}
        <div className="col-lg-4">
          <div className="kc-card h-100">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Application Status</h2>
            {(data?.appsByStatus || []).length === 0 ? (
              <div className="kc-empty py-2"><div className="kc-empty-title">No data yet</div></div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {(data?.appsByStatus || []).map(s => {
                  const total = data.totalApps || 1;
                  const pct = Math.round((s.count / total) * 100);
                  return (
                    <div key={s.status}>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className={`status-chip chip-${STATUS_COLORS[s.status] || 'gray'}`}>{s.status}</span>
                        <span className="fw-700">{s.count} <span className="text-muted fw-400">({pct}%)</span></span>
                      </div>
                      <div className="progress" style={{ height: '6px', borderRadius: '3px', background: 'var(--bg)' }}>
                        <div className="progress-bar" style={{ width: `${pct}%`, background: 'var(--p)', borderRadius: '3px', transition: 'width .5s' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Jobs table */}
        <div className="col-12">
          <div className="kc-card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Jobs Performance</h2>
            {!data?.jobs?.length ? (
              <div className="kc-empty py-2"><div className="kc-empty-title">No jobs posted yet</div></div>
            ) : (
              <div className="kc-table-wrap">
                <table className="kc-table">
                  <thead>
                    <tr><th>Job Title</th><th>Category</th><th>Salary</th><th>Views</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {data.jobs.map(job => (
                      <tr key={job._id}>
                        <td className="fw-700">{job.title}</td>
                        <td><span className="kc-badge badge-primary">{CATEGORY_LABELS[job.category] || job.category}</span></td>
                        <td className="small">₹{job.salaryMin?.toLocaleString('en-IN')}–{job.salaryMax?.toLocaleString('en-IN')}</td>
                        <td>{job.views}</td>
                        <td><span className={`kc-badge ${job.isActive ? 'badge-success' : 'badge-gray'}`}>{job.isActive ? 'Active' : 'Paused'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
