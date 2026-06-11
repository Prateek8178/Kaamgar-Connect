import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getApplicants, updateApplicationStatus, startChat } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Toast from '../components/Toast';

const STATUS_OPTIONS = ['pending','reviewed','shortlisted','accepted','rejected'];
const STATUS_COLORS = { pending:'amber', reviewed:'blue', shortlisted:'purple', accepted:'green', rejected:'red' };

const JobApplicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState({});

  const fetchApplicants = () => {
    setLoading(true);
    getApplicants(id, statusFilter ? { status: statusFilter } : {})
      .then(r => setData(r.data))
      .catch(() => navigate('/jobs/my-jobs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApplicants(); }, [id, statusFilter]);

  const handleStatus = async (appId, status) => {
    setUpdating(u => ({ ...u, [appId]: true }));
    try {
      await updateApplicationStatus(id, appId, { status });
      Toast.success(`Status updated to "${status}"`);
      fetchApplicants();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setUpdating(u => ({ ...u, [appId]: false }));
    }
  };

  const handleChat = async (workerId) => {
    try {
      const r = await startChat(workerId);
      navigate(`/chat/${r.data.roomId}`);
    } catch (err) { Toast.error('Cannot start chat.'); }
  };

  return (
    <MainLayout>
      <div className="mb-4">
        <Link to="/jobs/my-jobs" className="btn btn-ghost btn-sm mb-3"><i className="bi bi-arrow-left me-1"></i>My Jobs</Link>
        {data && (
          <>
            <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}>
              <i className="bi bi-people-fill me-2" style={{ color: 'var(--p)' }}></i>Applicants for "{data.job.title}"
            </h1>
            <p className="text-muted small">{data.counts?.all || 0} total applicants</p>
          </>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {[['', 'All'], ['pending','Pending'], ['reviewed','Reviewed'], ['shortlisted','Shortlisted'], ['accepted','Accepted'], ['rejected','Rejected']].map(([k, l]) => (
          <button key={k} className={`btn btn-sm btn-pill ${statusFilter === k ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatusFilter(k)}>
            {l} {data?.counts?.[k || 'all'] > 0 && <span className="badge bg-opacity-20 ms-1" style={{ background: 'rgba(255,255,255,.2)', fontSize: '.7rem' }}>{data.counts[k || 'all']}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="d-flex flex-column gap-3">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '12px' }}></div>)}</div>
      ) : !data || data.applications.length === 0 ? (
        <div className="kc-empty">
          <i className="bi bi-person-x kc-empty-icon"></i>
          <div className="kc-empty-title">No applicants {statusFilter ? `with status "${statusFilter}"` : 'yet'}</div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {data.applications.map(app => {
            const w = app.worker;
            const wp = w.workerProfile;
            const initial = (w.fullName?.[0] || w.username?.[0] || 'W').toUpperCase();
            return (
              <div key={app._id} className="kc-card">
                <div className="row align-items-start g-4">
                  <div className="col-md-5 d-flex align-items-start gap-3">
                    <div className="kc-avatar kc-avatar-md flex-shrink-0">
                      {w.profilePhoto ? <img src={`http://localhost:5000${w.profilePhoto}`} alt="" /> : initial}
                    </div>
                    <div>
                      <Link to={`/workers/${w._id}`} className="fw-700 text-decoration-none" style={{ color: 'var(--text-primary)' }}>
                        {w.fullName || w.username}
                      </Link>
                      <div className="text-muted small mt-1">
                        {w.city && <span><i className="bi bi-geo-alt me-1"></i>{w.city}</span>}
                        {w.phone && <span className="ms-2"><i className="bi bi-telephone me-1"></i>{w.phone}</span>}
                      </div>
                      {wp && (
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {wp.aadharVerified && <span className="kc-badge badge-verified"><i className="bi bi-patch-check-fill me-1"></i>Verified</span>}
                          <span className="kc-badge badge-gray"><i className="bi bi-star-fill me-1"></i>{wp.rating}/5</span>
                          <span className="kc-badge badge-gray">{wp.experienceYears} yrs exp</span>
                          <span className="kc-badge badge-gray">₹{wp.dailyRate}/day</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-muted small mb-2">Cover Note:</div>
                    <div className="small" style={{ color: 'var(--text-secondary)', maxHeight: '80px', overflow: 'hidden' }}>
                      {app.coverNote || <span className="text-muted fst-italic">No cover note</span>}
                    </div>
                    {app.resume && (
                      <a href={`http://localhost:5000${app.resume}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm mt-2 p-0">
                        <i className="bi bi-file-earmark-pdf me-1"></i>View Resume
                      </a>
                    )}
                    <div className="text-muted mt-2" style={{ fontSize: '.75rem' }}>Applied {new Date(app.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className="text-muted small">Status:</span>
                      <span className={`status-chip chip-${STATUS_COLORS[app.status]}`}>{app.status}</span>
                    </div>
                    <select
                      className="form-select form-select-sm mb-2"
                      value={app.status}
                      onChange={e => handleStatus(app._id, e.target.value)}
                      disabled={updating[app._id]}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    <div className="d-flex gap-2">
                      <Link to={`/workers/${w._id}`} className="btn btn-ghost btn-sm flex-grow-1"><i className="bi bi-person me-1"></i>Profile</Link>
                      <button onClick={() => handleChat(w._id)} className="btn btn-primary btn-sm flex-grow-1">
                        <i className="bi bi-chat-dots me-1"></i>Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
};

export default JobApplicants;
