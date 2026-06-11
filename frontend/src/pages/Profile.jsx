import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updateResume } from '../services/api';
import MainLayout from '../layouts/MainLayout';
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

const Profile = () => {
  const { user, updateUser, fetchMe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const photoRef = useRef();

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', city: '', bio: '', language: 'en',
    skills: '', extraSkills: '', experienceYears: '', dailyRate: '',
    availability: true, address: '', workingRadiusKm: '10', portfolioUrl: '', languages: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm(f => ({
      ...f,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      city: user.city || '',
      bio: user.bio || '',
      language: user.language || 'en',
    }));
  }, [user]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append('profilePhoto', photoFile);

      const { data } = await updateProfile(fd);
      updateUser(data.user);
      Toast.success('Profile updated successfully!');
      setPhotoFile(null);
    } catch (err) {
      Toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      await updateResume(fd);
      Toast.success('Resume uploaded!');
      fetchMe();
    } catch { Toast.error('Resume upload failed.'); }
  };

  const initial = (user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase();

  return (
    <MainLayout>
      <div className="mb-4">
        <h1 className="fw-800 mb-1" style={{ fontSize: '1.5rem' }}><i className="bi bi-person-circle me-2" style={{ color: 'var(--p)' }}></i>My Profile</h1>
        <p className="text-muted small">Manage your account information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Avatar & Basic */}
          <div className="col-lg-4">
            <div className="kc-card text-center mb-4">
              <div className="kc-avatar kc-avatar-xl mx-auto mb-3" style={{ cursor: 'pointer' }} onClick={() => photoRef.current?.click()}>
                {(photoPreview || user?.profilePhoto)
                  ? <img src={photoPreview || `http://localhost:5000${user.profilePhoto}`} alt="avatar" />
                  : initial}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '.2s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                  <i className="bi bi-camera-fill text-white"></i>
                </div>
              </div>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
              <div className="fw-700 mb-1">{user?.fullName || user?.username}</div>
              <div className="text-muted small" style={{ textTransform: 'capitalize' }}>{user?.role} Account</div>
              <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={() => photoRef.current?.click()}>
                <i className="bi bi-camera me-1"></i>Change Photo
              </button>
            </div>

            {user?.role === 'worker' && (
              <div className="kc-card">
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}><i className="bi bi-file-earmark-pdf me-2" style={{ color: 'var(--p)' }}></i>Resume</h2>
                <div className="kc-upload mb-3">
                  <input type="file" className="kc-upload-input" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                  <div className="kc-upload-content">
                    <i className="bi bi-cloud-upload" style={{ fontSize: '1.5rem', color: 'var(--p)' }}></i>
                    <div className="fw-600 small mt-1">{resumeFile ? resumeFile.name : 'Upload Resume'}</div>
                    <div className="text-muted" style={{ fontSize: '.75rem' }}>PDF, DOC · Max 5MB</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="col-lg-8">
            <div className="kc-card mb-4">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}><i className="bi bi-person me-2" style={{ color: 'var(--p)' }}></i>Personal Information</h2>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-600 small">First Name</label>
                  <input type="text" className="form-control" name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-600 small">Last Name</label>
                  <input type="text" className="form-control" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-600 small">Phone Number</label>
                  <input type="tel" className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-600 small">City</label>
                  <input type="text" className="form-control" name="city" value={form.city} onChange={handleChange} placeholder="Bhopal, MP" />
                </div>
                <div className="col-12">
                  <label className="form-label fw-600 small">Bio</label>
                  <textarea className="form-control" name="bio" rows={3} value={form.bio} onChange={handleChange} placeholder="Tell employers about yourself…" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-600 small">Language Preference</label>
                  <select className="form-select" name="language" value={form.language} onChange={handleChange}>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
              </div>
            </div>

            {user?.role === 'worker' && (
              <div className="kc-card mb-4">
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}><i className="bi bi-tools me-2" style={{ color: 'var(--p)' }}></i>Work Details</h2>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-600 small">Primary Skill</label>
                    <select className="form-select" name="skills" value={form.skills} onChange={handleChange}>
                      <option value="">Select skill…</option>
                      {SKILL_CHOICES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-600 small">Experience (years)</label>
                    <input type="number" className="form-control" name="experienceYears" min="0" value={form.experienceYears} onChange={handleChange} placeholder="e.g. 3" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-600 small">Daily Rate (₹)</label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input type="number" className="form-control" name="dailyRate" min="0" value={form.dailyRate} onChange={handleChange} placeholder="500" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-600 small">Working Radius (km)</label>
                    <input type="number" className="form-control" name="workingRadiusKm" min="1" value={form.workingRadiusKm} onChange={handleChange} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-600 small">Additional Skills <span className="text-muted">(comma separated)</span></label>
                    <input type="text" className="form-control" name="extraSkills" value={form.extraSkills} onChange={handleChange} placeholder="e.g. Tiling, Waterproofing, Grouting" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-600 small">Work Address</label>
                    <input type="text" className="form-control" name="address" value={form.address} onChange={handleChange} placeholder="Your current address" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-600 small">Portfolio URL</label>
                    <input type="url" className="form-control" name="portfolioUrl" value={form.portfolioUrl} onChange={handleChange} placeholder="https://…" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-600 small">Languages Spoken</label>
                    <input type="text" className="form-control" name="languages" value={form.languages} onChange={handleChange} placeholder="Hindi, English" />
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="availabilityToggle" checked={form.availability} onChange={e => setForm({ ...form, availability: e.target.checked })} />
                      <label className="form-check-label fw-600 small" htmlFor="availabilityToggle">
                        Available for Work <span className="text-muted">(show as "Available" to employers)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="d-flex justify-content-end">
              <button id="saveProfileBtn" type="submit" className="btn btn-primary btn-pill px-5" disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving…</> : <><i className="bi bi-check-circle me-2"></i>Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </MainLayout>
  );
};

export default Profile;
