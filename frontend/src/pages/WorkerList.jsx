import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getWorkers, startChat } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { FullLayout } from '../layouts/MainLayout';
import Toast from '../components/Toast';

const SKILL_CHOICES = [
  { value:'plumber', label:'Plumber' }, { value:'electrician', label:'Electrician' },
  { value:'carpenter', label:'Carpenter' }, { value:'painter', label:'Painter' },
  { value:'driver', label:'Driver' }, { value:'cook', label:'Cook' },
  { value:'security', label:'Security Guard' }, { value:'cleaner', label:'Cleaner' },
  { value:'mason', label:'Mason' }, { value:'welder', label:'Welder' },
  { value:'ac_technician', label:'AC Technician' }, { value:'tailor', label:'Tailor' },
  { value:'other', label:'Other' },
];

const WorkerCard = ({ worker, onChat }) => {
  const wp = worker.workerProfile;
  const initial = (worker.firstName?.[0] || worker.username?.[0] || 'W').toUpperCase();

  return (
    <div className="col-md-6 col-xl-4">
      <div className="kc-worker-card h-100">
        <div className="d-flex align-items-start gap-3 mb-3">
          <div className="kc-avatar kc-avatar-lg flex-shrink-0">
            {worker.profilePhoto ? <img src={`http://localhost:5000${worker.profilePhoto}`} alt="" /> : initial}
          </div>
          <div className="flex-grow-1">
            <Link to={`/workers/${worker._id}`} className="fw-700 text-decoration-none" style={{ color: 'var(--text-primary)', fontSize: '.95rem' }}>
              {worker.firstName ? `${worker.firstName} ${worker.lastName || ''}`.trim() : worker.username}
            </Link>
            <div className="text-muted small">{worker.city || 'Location not set'}</div>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {wp?.aadharVerified && <span className="kc-badge badge-verified"><i className="bi bi-patch-check-fill me-1"></i>Verified</span>}
              {wp?.availability ? <span className="kc-badge badge-success">Available</span> : <span className="kc-badge badge-gray">Unavailable</span>}
            </div>
          </div>
        </div>

        {wp && (
          <>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className="kc-badge badge-primary">{SKILL_CHOICES.find(s => s.value === wp.skills)?.label || wp.skills}</span>
              <span className="kc-badge badge-gray"><i className="bi bi-star-fill me-1"></i>{wp.rating}/5</span>
              <span className="kc-badge badge-gray">{wp.experienceYears} yr{wp.experienceYears !== 1 ? 's' : ''}</span>
            </div>

            {wp.extraSkills && (
              <div className="d-flex flex-wrap gap-1 mb-3">
                {wp.extraSkills.split(',').slice(0, 3).map((s, i) => (
                  <span key={i} className="badge" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '.72rem' }}>{s.trim()}</span>
                ))}
              </div>
            )}

            <div className="d-flex gap-3 small text-muted mb-3">
              <span><i className="bi bi-currency-rupee me-1"></i>₹{wp.dailyRate}/day</span>
              <span><i className="bi bi-check2-circle me-1"></i>{wp.totalJobs} jobs</span>
            </div>
          </>
        )}

        <div className="d-flex gap-2 mt-auto pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <Link to={`/workers/${worker._id}`} className="btn btn-ghost btn-sm flex-grow-1">
            <i className="bi bi-person me-1"></i>Profile
          </Link>
          <button onClick={() => onChat(worker._id)} className="btn btn-primary btn-sm flex-grow-1 btn-pill">
            <i className="bi bi-chat-dots me-1"></i>Message
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkerList = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = {
    skills: searchParams.get('skills') || '',
    search: searchParams.get('search') || '',
    available: searchParams.get('available') || '',
  };

  useEffect(() => {
    setLoading(true);
    getWorkers(filters).then(r => setWorkers(r.data.workers)).catch(() => {}).finally(() => setLoading(false));
  }, [searchParams.toString()]);

  const update = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  const handleChat = async (workerId) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'employer') { Toast.warning('Only employers can initiate chats.'); return; }
    try {
      const r = await startChat(workerId);
      navigate(`/chat/${r.data.roomId}`);
    } catch (err) { Toast.error(err.response?.data?.message || 'Cannot start chat.'); }
  };

  const Layout = isAuthenticated ? MainLayout : FullLayout;

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}><i className="bi bi-people-fill me-2" style={{ color: 'var(--p)' }}></i>Find Workers</h1>
        <p className="text-muted small">{workers.length} workers found</p>
      </div>

      {/* Filters */}
      <div className="kc-card mb-4">
        <div className="row g-3">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-search"></i></span>
              <input id="workerSearch" type="text" className="form-control" placeholder="Name, city…" defaultValue={filters.search}
                onKeyDown={e => e.key === 'Enter' && update('search', e.target.value)} />
            </div>
          </div>
          <div className="col-md-4">
            <select id="skillsFilter" className="form-select" value={filters.skills} onChange={e => update('skills', e.target.value)}>
              <option value="">All Skills</option>
              {SKILL_CHOICES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filters.available} onChange={e => update('available', e.target.value)}>
              <option value="">All Availability</option>
              <option value="1">Available Only</option>
            </select>
          </div>
        </div>
        {(filters.skills || filters.search || filters.available) && (
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setSearchParams({})}>
              <i className="bi bi-x-circle me-1"></i>Clear Filters
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="row g-4">{[1,2,3,4,5,6].map(i => <div key={i} className="col-md-6 col-xl-4"><div className="skeleton" style={{ height: '240px', borderRadius: '16px' }}></div></div>)}</div>
      ) : workers.length === 0 ? (
        <div className="kc-empty">
          <i className="bi bi-people kc-empty-icon"></i>
          <div className="kc-empty-title">No workers found</div>
          <div className="kc-empty-sub">Try adjusting your search filters</div>
          <button className="btn btn-primary btn-sm btn-pill mt-3" onClick={() => setSearchParams({})}>Clear Filters</button>
        </div>
      ) : (
        <div className="row g-4">
          {workers.map(w => <WorkerCard key={w._id} worker={w} onChat={handleChat} />)}
        </div>
      )}
    </Layout>
  );
};

export default WorkerList;
