import React, { useState } from 'react';
import { applyForJob } from '../services/api';
import Toast from '../components/Toast';

const ApplyModal = ({ job, onClose, onApplied }) => {
  const [coverNote, setCoverNote] = useState('');
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('coverNote', coverNote);
      if (resume) formData.append('resume', resume);
      await applyForJob(job._id, formData);
      Toast.success(`Applied to "${job.title}" successfully! 🎉`);
      onApplied();
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Application failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-flex align-items-center" style={{ background: 'rgba(0,0,0,.6)', position: 'fixed', inset: 0, zIndex: 9999 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="kc-card" style={{ maxWidth: '520px', width: '90%', margin: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}><i className="bi bi-send me-2" style={{ color: 'var(--p)' }}></i>Apply for Job</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm"><i className="bi bi-x-lg"></i></button>
        </div>

        <div className="p-3 mb-4" style={{ background: 'var(--bg)', borderRadius: '12px' }}>
          <div className="fw-700">{job.title}</div>
          <div className="text-muted small">{job.location} · ₹{job.salaryMin?.toLocaleString('en-IN')}–{job.salaryMax?.toLocaleString('en-IN')}/mo</div>
        </div>

        <form onSubmit={handleApply}>
          <div className="mb-3">
            <label className="form-label fw-600 small">Cover Note <span className="text-muted">(optional)</span></label>
            <textarea
              id="coverNote"
              className="form-control"
              rows={4}
              placeholder="Why are you a good fit for this role? Highlight your relevant skills..."
              value={coverNote}
              onChange={e => setCoverNote(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-600 small">Resume / Portfolio <span className="text-muted">(optional, PDF/JPG)</span></label>
            <div className={`kc-upload ${resume ? 'has-file' : ''}`}>
              <input id="resumeInput" type="file" className="kc-upload-input" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e => setResume(e.target.files[0])} />
              <div className="kc-upload-content">
                {resume ? (
                  <><i className="bi bi-file-earmark-check" style={{ fontSize: '1.5rem', color: 'var(--success)' }}></i><div className="fw-600 small mt-1">{resume.name}</div></>
                ) : (
                  <><i className="bi bi-cloud-upload" style={{ fontSize: '1.5rem', color: 'var(--p)' }}></i><div className="fw-600 small mt-1">Upload Resume</div><div className="text-muted" style={{ fontSize: '.75rem' }}>PDF, DOC, JPG · Max 5MB</div></>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-grow-1">Cancel</button>
            <button id="submitApplyBtn" type="submit" className="btn btn-primary flex-grow-1 btn-pill" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Applying…</> : <><i className="bi bi-send me-2"></i>Submit Application</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;
