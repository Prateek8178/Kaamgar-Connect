import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJobDetail, toggleSaveJob, startChat } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { FullLayout } from '../layouts/MainLayout';
import ApplyModal from '../components/ApplyModal';
import Toast from '../components/Toast';

const CATEGORY_ICONS = { construction:'🏗️',electrical:'⚡',plumbing:'🔧',carpentry:'🪚',painting:'🎨',driving:'🚗',cooking:'👨‍🍳',cleaning:'🧹',security:'🛡️',welding:'⚒️',ac_tech:'❄️',tailoring:'🧵',other:'💼' };

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showApply, setShowApply] = useState(false);

  useEffect(() => {
    getJobDetail(id).then(r => {
      setData(r.data);
      setSaved(r.data.job.isSaved);
    }).catch(() => navigate('/jobs')).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      const { data: d } = await toggleSaveJob(id);
      setSaved(d.saved);
      Toast[d.saved ? 'success' : 'info'](d.message);
    } catch { Toast.error('Please login to save jobs.'); }
  };

  const handleChat = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!data?.job?.employer?._id) return;
    try {
      const r = await startChat(data.job.employer._id);
      navigate(`/chat/${r.data.roomId}`);
    } catch (err) { Toast.error(err.response?.data?.message || 'Cannot start chat.'); }
  };

  const Layout = isAuthenticated ? MainLayout : FullLayout;

  if (loading) return (
    <Layout>
      <div className="skeleton mb-3" style={{ height: '200px', borderRadius: '16px' }}></div>
      <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }}></div>
    </Layout>
  );

  if (!data) return <Layout><div className="kc-empty"><div className="kc-empty-title">Job not found</div></div></Layout>;

  const { job, alreadyApplied, relatedJobs = [] } = data;

  return (
    <Layout>
      {showApply && <ApplyModal job={job} onClose={() => setShowApply(false)} onApplied={() => { setData(d => ({ ...d, alreadyApplied: true })); setShowApply(false); }} />}

      <div className="mb-4">
        <Link to="/jobs" className="btn btn-ghost btn-sm mb-3"><i className="bi bi-arrow-left me-1"></i>Back to Jobs</Link>
      </div>

      <div className="row g-4">
        {/* Main */}
        <div className="col-lg-8">
          <div className="kc-card mb-4">
            {/* Header */}
            <div className="d-flex align-items-start gap-4 mb-4">
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg,var(--p),var(--p-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
                {CATEGORY_ICONS[job.category] || '💼'}
              </div>
              <div className="flex-grow-1">
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>{job.title}</h1>
                <div className="d-flex align-items-center gap-2 text-muted small flex-wrap">
                  <span><i className="bi bi-building me-1"></i>{job.employer?.fullName || 'Employer'}</span>
                  <span>·</span>
                  <span><i className="bi bi-geo-alt me-1"></i>{job.location}</span>
                  <span>·</span>
                  <span><i className="bi bi-clock me-1"></i>{new Date(job.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              <div className="d-flex gap-2 flex-shrink-0">
                <button onClick={handleSave} className="btn btn-ghost btn-sm" title={saved ? 'Unsave' : 'Save job'}>
                  <i className={`bi bi-bookmark${saved ? '-fill' : ''}`} style={{ color: saved ? 'var(--p)' : undefined }}></i>
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              <span className="kc-badge badge-primary"><i className="bi bi-tag me-1"></i>{job.categoryLabel}</span>
              <span className="kc-badge badge-gray">{job.jobTypeLabel}</span>
              <span className="kc-badge badge-gray">{job.experienceLabel}</span>
              {job.isFeatured && <span className="kc-badge badge-warning"><i className="bi bi-star-fill me-1"></i>Featured</span>}
            </div>

            {/* Stats row */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <div className="text-center p-3" style={{ background: 'var(--bg)', borderRadius: '12px' }}>
                  <div className="fw-800" style={{ fontSize: '1.1rem', color: 'var(--success)' }}>₹{job.salaryMin?.toLocaleString('en-IN')}</div>
                  <div className="text-muted" style={{ fontSize: '.75rem' }}>Min Salary/mo</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-center p-3" style={{ background: 'var(--bg)', borderRadius: '12px' }}>
                  <div className="fw-800" style={{ fontSize: '1.1rem', color: 'var(--success)' }}>₹{job.salaryMax?.toLocaleString('en-IN')}</div>
                  <div className="text-muted" style={{ fontSize: '.75rem' }}>Max Salary/mo</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-center p-3" style={{ background: 'var(--bg)', borderRadius: '12px' }}>
                  <div className="fw-800" style={{ fontSize: '1.1rem', color: 'var(--p)' }}>{job.openings}</div>
                  <div className="text-muted" style={{ fontSize: '.75rem' }}>Openings</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-center p-3" style={{ background: 'var(--bg)', borderRadius: '12px' }}>
                  <div className="fw-800" style={{ fontSize: '1.1rem', color: 'var(--accent)' }}>{job.views}</div>
                  <div className="text-muted" style={{ fontSize: '.75rem' }}>Views</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Job Description</h2>
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{job.description}</div>
            </div>

            {/* Skills */}
            {job.skillsList?.length > 0 && (
              <div className="mb-4">
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '.75rem' }}>Required Skills</h2>
                <div className="d-flex flex-wrap gap-2">
                  {job.skillsList.map((s, i) => (
                    <span key={i} className="badge" style={{ background: 'var(--p)', color: '#fff', fontWeight: 500, padding: '6px 12px', borderRadius: '8px' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {user?.role === 'worker' && (
              <div className="d-flex gap-3 flex-wrap pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                {alreadyApplied ? (
                  <div className="d-flex align-items-center gap-2 text-success fw-700"><i className="bi bi-check2-circle fs-5"></i>You've applied</div>
                ) : (
                  <button id="applyBtn" className="btn btn-primary btn-pill px-5" onClick={() => setShowApply(true)}>
                    <i className="bi bi-send me-2"></i>Apply Now
                  </button>
                )}
                <button className="btn btn-secondary btn-pill" onClick={handleChat}>
                  <i className="bi bi-chat-dots me-2"></i>Message Employer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Employer card */}
          <div className="kc-card mb-4">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>About the Employer</h2>
            <div className="d-flex align-items-center gap-3">
              <div className="kc-avatar kc-avatar-md">
                {job.employer?.profilePhoto ? <img src={`http://localhost:5000${job.employer.profilePhoto}`} alt="" /> : (job.employer?.fullName?.[0] || 'E').toUpperCase()}
              </div>
              <div>
                <div className="fw-700">{job.employer?.fullName || 'Employer'}</div>
                <div className="text-muted small"><i className="bi bi-geo-alt me-1"></i>{job.employer?.city || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="kc-card mb-4">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Job Details</h2>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li className="d-flex justify-content-between"><span className="text-muted">Deadline</span><span className="fw-600">{job.deadline ? new Date(job.deadline).toLocaleDateString('en-IN') : 'Open'}</span></li>
              <li className="d-flex justify-content-between"><span className="text-muted">Experience</span><span className="fw-600">{job.experienceLabel}</span></li>
              <li className="d-flex justify-content-between"><span className="text-muted">Job Type</span><span className="fw-600">{job.jobTypeLabel}</span></li>
              <li className="d-flex justify-content-between"><span className="text-muted">Openings</span><span className="fw-600">{job.openings}</span></li>
            </ul>
          </div>

          {/* Related Jobs */}
          {relatedJobs.length > 0 && (
            <div className="kc-card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Similar Jobs</h2>
              <div className="d-flex flex-column gap-3">
                {relatedJobs.map(rj => (
                  <Link key={rj._id} to={`/jobs/${rj._id}`} className="d-flex gap-3 text-decoration-none">
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--p)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                      {CATEGORY_ICONS[rj.category] || '💼'}
                    </div>
                    <div>
                      <div className="fw-600 small" style={{ color: 'var(--text-primary)' }}>{rj.title}</div>
                      <div className="text-muted" style={{ fontSize: '.76rem' }}>{rj.location}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JobDetail;
