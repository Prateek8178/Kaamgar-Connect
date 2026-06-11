import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getWorkerDetail, startChat } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { FullLayout } from '../layouts/MainLayout';
import Toast from '../components/Toast';

const WorkerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkerDetail(id)
      .then(r => setData(r.data))
      .catch(() => navigate('/workers'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChat = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'employer') { Toast.warning('Only employers can initiate chats.'); return; }
    try {
      const r = await startChat(id);
      navigate(`/chat/${r.data.roomId}`);
    } catch (err) { Toast.error(err.response?.data?.message || 'Cannot start chat.'); }
  };

  const Layout = isAuthenticated ? MainLayout : FullLayout;

  if (loading) return (
    <Layout>
      <div className="skeleton mb-4" style={{ height: '200px', borderRadius: '16px' }}></div>
      <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }}></div>
    </Layout>
  );

  if (!data) return <Layout><div className="kc-empty"><div className="kc-empty-title">Worker not found</div></div></Layout>;

  const { worker, workerDetails = [], reviews = [] } = data;
  const wp = worker.workerProfile;
  const initial = (worker.firstName?.[0] || worker.username?.[0] || 'W').toUpperCase();
  const fullName = `${worker.firstName || ''} ${worker.lastName || ''}`.trim() || worker.username;

  return (
    <Layout>
      <div className="mb-4">
        <Link to="/workers" className="btn btn-ghost btn-sm"><i className="bi bi-arrow-left me-1"></i>Back to Workers</Link>
      </div>

      <div className="row g-4">
        {/* Left — Profile */}
        <div className="col-lg-4">
          <div className="kc-card text-center mb-4">
            <div className="kc-avatar kc-avatar-xl mx-auto mb-3">
              {worker.profilePhoto ? <img src={`http://localhost:5000${worker.profilePhoto}`} alt={fullName} /> : initial}
            </div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>{fullName}</h1>
            <div className="text-muted small mb-3"><i className="bi bi-geo-alt me-1"></i>{worker.city || 'Location not set'}</div>

            <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
              {wp?.aadharVerified && <span className="kc-badge badge-verified"><i className="bi bi-patch-check-fill me-1"></i>ID Verified</span>}
              {wp?.availability ? <span className="kc-badge badge-success"><i className="bi bi-circle-fill me-1" style={{ fontSize: '.5rem' }}></i>Available</span> : <span className="kc-badge badge-gray">Unavailable</span>}
            </div>

            {worker.bio && <p className="small text-muted lh-relaxed mb-4">{worker.bio}</p>}

            {wp && (
              <div className="row g-2 mb-4">
                {[
                  { label: 'Rating', value: `⭐ ${wp.rating}/5` },
                  { label: 'Jobs Done', value: wp.totalJobs },
                  { label: 'Daily Rate', value: `₹${wp.dailyRate}` },
                  { label: 'Experience', value: `${wp.experienceYears} yrs` },
                ].map(s => (
                  <div key={s.label} className="col-6">
                    <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '10px' }}>
                      <div className="fw-700 small">{s.value}</div>
                      <div className="text-muted" style={{ fontSize: '.72rem' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {user?.role === 'employer' && (
              <button className="btn btn-primary w-100 btn-pill" onClick={handleChat}>
                <i className="bi bi-chat-dots me-2"></i>Send Message
              </button>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="btn btn-primary w-100 btn-pill">
                <i className="bi bi-box-arrow-in-right me-2"></i>Login to Contact
              </Link>
            )}
          </div>

          {/* Worker Details List */}
          {workerDetails.length > 0 && (
            <div className="kc-card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Details</h2>
              <ul className="list-unstyled d-flex flex-column gap-3">
                {workerDetails.map((d, i) => (
                  <li key={i} className="d-flex align-items-center gap-3">
                    <i className={`bi bi-${d.icon}`} style={{ width: '20px', color: 'var(--p)', flexShrink: 0 }}></i>
                    <div>
                      <div className="text-muted" style={{ fontSize: '.75rem' }}>{d.label}</div>
                      <div className="fw-600 small">{d.value}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right — Skills & Reviews */}
        <div className="col-lg-8">
          {/* Skills */}
          {wp && (
            <div className="kc-card mb-4">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}><i className="bi bi-tools me-2" style={{ color: 'var(--p)' }}></i>Skills & Expertise</h2>
              {wp.extraSkills && (
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {wp.extraSkills.split(',').map((s, i) => (
                    <span key={i} className="badge" style={{ background: 'var(--p)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontWeight: 500 }}>{s.trim()}</span>
                  ))}
                </div>
              )}
              <div className="row g-3 mt-2">
                {wp.portfolioUrl && (
                  <div className="col-md-6">
                    <a href={wp.portfolioUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                      <i className="bi bi-link-45deg me-1"></i>View Portfolio
                    </a>
                  </div>
                )}
                {wp.resume && (
                  <div className="col-md-6">
                    <a href={`http://localhost:5000${wp.resume}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                      <i className="bi bi-file-earmark-pdf me-1"></i>Download Resume
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="kc-card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              <i className="bi bi-star-fill me-2" style={{ color: 'var(--accent)' }}></i>
              Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <div className="kc-empty py-3">
                <i className="bi bi-star kc-empty-icon"></i>
                <div className="kc-empty-title">No reviews yet</div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                {reviews.map(rev => {
                  const ri = (rev.reviewer?.firstName?.[0] || rev.reviewer?.username?.[0] || 'R').toUpperCase();
                  return (
                    <div key={rev._id} className="notif-item p-3" style={{ borderRadius: '12px', background: 'var(--bg)' }}>
                      <div className="d-flex align-items-start gap-3">
                        <div className="kc-avatar kc-avatar-sm flex-shrink-0">
                          {rev.reviewer?.profilePhoto ? <img src={`http://localhost:5000${rev.reviewer.profilePhoto}`} alt="" /> : ri}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="fw-700 small">{rev.reviewer?.firstName ? `${rev.reviewer.firstName} ${rev.reviewer.lastName || ''}`.trim() : rev.reviewer?.username}</div>
                            <div className="text-muted" style={{ fontSize: '.75rem' }}>{new Date(rev.createdAt).toLocaleDateString('en-IN')}</div>
                          </div>
                          <div className="d-flex gap-1 my-1">
                            {[1,2,3,4,5].map(s => (
                              <i key={s} className={`bi bi-star${s <= rev.rating ? '-fill' : ''}`} style={{ color: s <= rev.rating ? 'var(--accent)' : 'var(--border)', fontSize: '.85rem' }}></i>
                            ))}
                          </div>
                          {rev.comment && <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>{rev.comment}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WorkerDetail;
