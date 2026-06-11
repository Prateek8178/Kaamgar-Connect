import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postJob, editJob, getJobDetail } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Toast from '../components/Toast';

const CATEGORIES = [
  ['construction','🏗️ Construction'], ['electrical','⚡ Electrical'], ['plumbing','🔧 Plumbing'],
  ['carpentry','🪚 Carpentry'], ['painting','🎨 Painting'], ['driving','🚗 Driving'],
  ['cooking','👨‍🍳 Cooking'], ['cleaning','🧹 Cleaning'], ['security','🛡️ Security'],
  ['welding','⚒️ Welding'], ['ac_tech','❄️ AC Technician'], ['tailoring','🧵 Tailoring'], ['other','💼 Other'],
];
const JOB_TYPES = [['full_time','Full Time'],['part_time','Part Time'],['contract','Contract'],['daily','Daily Wage'],['internship','Internship']];
const EXP_CHOICES = [['fresher','Fresher (0 yrs)'],['1_2','1–2 Years'],['3_5','3–5 Years'],['5_plus','5+ Years'],['10_plus','10+ Years']];

const PostJob = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '', titleHi: '', category: '', jobType: 'full_time', experienceReq: 'fresher',
    skillsRequired: '', description: '', descriptionHi: '', location: '',
    latitude: '', longitude: '', salaryMin: '', salaryMax: '', openings: '1', deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      getJobDetail(id).then(r => {
        const j = r.data.job;
        setForm({
          title: j.title || '', titleHi: j.titleHi || '', category: j.category || '',
          jobType: j.jobType || 'full_time', experienceReq: j.experienceReq || 'fresher',
          skillsRequired: j.skillsRequired || '', description: j.description || '',
          descriptionHi: j.descriptionHi || '', location: j.location || '',
          latitude: j.latitude || '', longitude: j.longitude || '',
          salaryMin: j.salaryMin || '', salaryMax: j.salaryMax || '',
          openings: j.openings || '1', deadline: j.deadline ? j.deadline.split('T')[0] : '',
        });
      }).catch(() => navigate('/jobs/my-jobs')).finally(() => setFetching(false));
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.description || !form.location) {
      Toast.warning('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await editJob(id, form);
        Toast.success('Job updated successfully!');
        navigate(`/jobs/${id}`);
      } else {
        const r = await postJob(form);
        Toast.success(r.data.message);
        navigate('/jobs/my-jobs');
      }
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Failed to save job.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <MainLayout><div className="skeleton" style={{ height: '600px', borderRadius: '16px' }}></div></MainLayout>;

  return (
    <MainLayout>
      <div className="mb-4">
        <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}>
          <i className={`bi bi-${isEdit ? 'pencil-square' : 'plus-circle-fill'} me-2`} style={{ color: 'var(--p)' }}></i>
          {isEdit ? 'Edit Job' : 'Post a New Job'}
        </h1>
        <p className="text-muted small">{isEdit ? 'Update job details' : 'Fill in the details to post a job'}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Basic Info */}
          <div className="col-lg-8">
            <div className="kc-card mb-4">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}><i className="bi bi-info-circle me-2" style={{ color: 'var(--p)' }}></i>Basic Information</h2>
              <div className="mb-3">
                <label className="form-label fw-600 small">Job Title <span className="text-danger">*</span></label>
                <input id="jobTitle" type="text" className="form-control" name="title" placeholder="e.g. Experienced Electrician for Office Building" value={form.title} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-600 small">Job Title (Hindi) <span className="text-muted">(optional)</span></label>
                <input type="text" className="form-control" name="titleHi" placeholder="Hindi title" value={form.titleHi} onChange={handleChange} />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-600 small">Category <span className="text-danger">*</span></label>
                  <select id="jobCategory" className="form-select" name="category" value={form.category} onChange={handleChange} required>
                    <option value="">Select category…</option>
                    {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-600 small">Job Type</label>
                  <select className="form-select" name="jobType" value={form.jobType} onChange={handleChange}>
                    {JOB_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-600 small">Experience Required</label>
                  <select className="form-select" name="experienceReq" value={form.experienceReq} onChange={handleChange}>
                    {EXP_CHOICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-600 small">Number of Openings</label>
                  <input type="number" className="form-control" name="openings" min="1" value={form.openings} onChange={handleChange} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-600 small">Skills Required <span className="text-muted">(comma separated)</span></label>
                <input type="text" className="form-control" name="skillsRequired" placeholder="e.g. Wiring, Switchboard, AC Installation" value={form.skillsRequired} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-600 small">Job Description <span className="text-danger">*</span></label>
                <textarea id="jobDescription" className="form-control" name="description" rows={5} placeholder="Describe the role, responsibilities, requirements…" value={form.description} onChange={handleChange} required />
              </div>
            </div>

            {/* Location & Salary */}
            <div className="kc-card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}><i className="bi bi-geo-alt me-2" style={{ color: 'var(--p)' }}></i>Location & Compensation</h2>
              <div className="mb-3">
                <label className="form-label fw-600 small">Job Location <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="location" placeholder="e.g. Bhopal, MP" value={form.location} onChange={handleChange} required />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-600 small">Min Salary (₹/month)</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input type="number" className="form-control" name="salaryMin" placeholder="8000" min="0" value={form.salaryMin} onChange={handleChange} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-600 small">Max Salary (₹/month)</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input type="number" className="form-control" name="salaryMax" placeholder="15000" min="0" value={form.salaryMax} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-600 small">Application Deadline <span className="text-muted">(optional)</span></label>
                <input type="date" className="form-control" name="deadline" value={form.deadline} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="kc-card" style={{ position: 'sticky', top: '90px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Preview & Publish</h2>
              {form.title && (
                <div className="p-3 mb-4" style={{ background: 'var(--bg)', borderRadius: '12px' }}>
                  <div className="fw-700 mb-1">{form.title}</div>
                  <div className="text-muted small">{form.location || 'Location not set'}</div>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {form.category && <span className="kc-badge badge-primary">{form.category}</span>}
                    {form.jobType && <span className="kc-badge badge-gray">{form.jobType.replace('_', ' ')}</span>}
                  </div>
                </div>
              )}
              <button id="submitJobBtn" type="submit" className="btn btn-primary w-100 btn-pill" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>{isEdit ? 'Updating…' : 'Publishing…'}</> : <><i className={`bi bi-${isEdit ? 'check-circle' : 'send'} me-2`}></i>{isEdit ? 'Save Changes' : 'Publish Job'}</>}
              </button>
              <div className="text-muted small text-center mt-3">
                {isEdit ? 'Changes will be visible immediately.' : 'Your job will be live immediately after posting.'}
              </div>
            </div>
          </div>
        </div>
      </form>
    </MainLayout>
  );
};

export default PostJob;
