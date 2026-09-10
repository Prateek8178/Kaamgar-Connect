import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getJobs, toggleSaveJob } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FullLayout } from '../layouts/MainLayout';
import MainLayout from '../layouts/MainLayout';
import Toast from '../components/Toast';

const CATEGORY_ICONS = { construction:'🏗️',electrical:'⚡',plumbing:'🔧',carpentry:'🪚',painting:'🎨',driving:'🚗',cooking:'👨‍🍳',cleaning:'🧹',security:'🛡️',welding:'⚒️',ac_tech:'❄️',tailoring:'🧵',other:'💼' };

const JobCard = ({ job, onSave }) => {
  const [saved, setSaved] = useState(job.isSaved);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    try {
      const { data } = await toggleSaveJob(job._id);
      setSaved(data.saved);
      Toast[data.saved ? 'success' : 'info'](data.message);
    } catch {
      Toast.error('Please login to save jobs.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="col-md-6 col-xl-4">
      <div className="kc-job-card h-100">
        <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center gap-3">
            <div className="job-icon" style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,var(--p),var(--p-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
              {CATEGORY_ICONS[job.category] || '💼'}
            </div>
            <div>
              <Link to={`/jobs/${job._id}`} className="fw-700 text-decoration-none" style={{ color: 'var(--text-primary)', fontSize: '.95rem' }}>{job.title}</Link>
              <div className="text-muted small">{job.employer?.fullName || job.employer?.username}</div>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn btn-ghost btn-sm p-1" title={saved ? 'Unsave' : 'Save'} style={{ flexShrink: 0 }}>
            <i className={`bi bi-bookmark${saved ? '-fill' : ''}`} style={{ color: saved ? 'var(--p)' : undefined }}></i>
          </button>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-3">
          <span className="kc-badge badge-primary">{job.categoryLabel}</span>
          <span className="kc-badge badge-gray">{job.jobTypeLabel}</span>
          {job.isFeatured && <span className="kc-badge badge-warning"><i className="bi bi-star-fill me-1"></i>Featured</span>}
        </div>

        <div className="d-flex flex-column gap-1 mb-3 small text-muted">
          <div><i className="bi bi-geo-alt me-2"></i>{job.location}</div>
          <div><i className="bi bi-currency-rupee me-2"></i>₹{job.salaryMin?.toLocaleString('en-IN')}–{job.salaryMax?.toLocaleString('en-IN')}/mo</div>
          <div><i className="bi bi-people me-2"></i>{job.openings} opening{job.openings !== 1 ? 's' : ''}</div>
          {job.distance != null && <div><i className="bi bi-pin-map me-2"></i>{job.distance} km away</div>}
        </div>

        <div className="d-flex flex-wrap gap-2 mb-3">
          {(job.skillsList || []).slice(0, 3).map((s, i) => (
            <span key={i} className="badge" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontWeight: 500, fontSize: '.72rem' }}>{s}</span>
          ))}
        </div>

        <div className="d-flex align-items-center justify-content-between mt-auto pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-muted" style={{ fontSize: '.75rem' }}>
            <i className="bi bi-clock me-1"></i>
            {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
          <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm btn-pill px-3">
            View Job <i className="bi bi-arrow-right ms-1"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

const JobList = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({});
  const [categories, setCategories] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  // expChoices fetched from API — reserved for future experience-level filter UI
  const [, setExpChoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = {
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    job_type: searchParams.get('job_type') || '',
    experience: searchParams.get('experience') || '',
    salary_min: searchParams.get('salary_min') || '',
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
  };

  const searchKey = searchParams.toString();
  useEffect(() => {
    setLoading(true);
    getJobs(filters).then(r => {
      setJobs(r.data.jobs);
      setMeta(r.data);
      setCategories(r.data.categories || []);
      setJobTypes(r.data.jobTypes || []);
      setExpChoices(r.data.expChoices || []);
    }).catch(() => {}).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey]);

  const update = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const Layout = isAuthenticated ? MainLayout : FullLayout;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-4">
        <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}><i className="bi bi-briefcase-fill me-2" style={{ color: 'var(--p)' }}></i>Browse Jobs</h1>
        <p className="text-muted small">{meta.total || 0} jobs found</p>
      </div>

      {/* Search bar */}
      <div className="kc-card mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-search"></i></span>
              <input id="jobSearch" type="text" className="form-control" placeholder="Job title, skill, keyword…" defaultValue={filters.search}
                onKeyDown={e => e.key === 'Enter' && update('search', e.target.value)} />
            </div>
          </div>
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
              <input id="locationSearch" type="text" className="form-control" placeholder="City or area…" defaultValue={filters.location}
                onKeyDown={e => e.key === 'Enter' && update('location', e.target.value)} />
            </div>
          </div>
          <div className="col-md-3">
            <select id="categoryFilter" className="form-select" value={filters.category} onChange={e => update('category', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select id="jobTypeFilter" className="form-select" value={filters.job_type} onChange={e => update('job_type', e.target.value)}>
              <option value="">Job Type</option>
              {jobTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        {(filters.category || filters.location || filters.job_type || filters.search) && (
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setSearchParams({})}>
              <i className="bi bi-x-circle me-1"></i>Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="row g-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="col-md-6 col-xl-4"><div className="skeleton" style={{ height: '220px', borderRadius: '16px' }}></div></div>)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="kc-empty">
          <i className="bi bi-search kc-empty-icon"></i>
          <div className="kc-empty-title">No jobs found</div>
          <div className="kc-empty-sub">Try adjusting your filters</div>
          <button className="btn btn-primary btn-sm btn-pill mt-3" onClick={() => setSearchParams({})}>Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            {jobs.map(job => <JobCard key={job._id} job={job} />)}
          </div>
          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="kc-pagination">
              <button className="kc-page-btn" disabled={meta.page <= 1} onClick={() => update('page', String(meta.page - 1))}>
                <i className="bi bi-chevron-left"></i>
              </button>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`kc-page-btn ${p === meta.page ? 'active' : ''}`} onClick={() => update('page', String(p))}>{p}</button>
              ))}
              <button className="kc-page-btn" disabled={!meta.hasNext} onClick={() => update('page', String(meta.page + 1))}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default JobList;
