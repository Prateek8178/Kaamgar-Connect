import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJobs, getWorkers } from '../services/api';
import { FullLayout } from '../layouts/MainLayout';

const CATEGORY_ICONS = { construction:'🏗️',electrical:'⚡',plumbing:'🔧',carpentry:'🪚',painting:'🎨',driving:'🚗',cooking:'👨‍🍳',cleaning:'🧹',security:'🛡️',welding:'⚒️',ac_tech:'❄️',tailoring:'🧵',other:'💼' };

const CATEGORIES = [
  { value:'construction', label:'Construction', count:'120+' },
  { value:'electrical', label:'Electrical', count:'85+' },
  { value:'plumbing', label:'Plumbing', count:'74+' },
  { value:'carpentry', label:'Carpentry', count:'63+' },
  { value:'painting', label:'Painting', count:'91+' },
  { value:'driving', label:'Driving', count:'55+' },
  { value:'cooking', label:'Cooking', count:'48+' },
  { value:'cleaning', label:'Cleaning', count:'67+' },
  { value:'security', label:'Security', count:'38+' },
  { value:'welding', label:'Welding', count:'42+' },
  { value:'ac_tech', label:'AC Technician', count:'36+' },
  { value:'tailoring', label:'Tailoring', count:'29+' },
];

const STATS = [
  { value: '10,000+', label: 'Registered Workers', icon: 'people-fill' },
  { value: '3,500+', label: 'Active Jobs', icon: 'briefcase-fill' },
  { value: '5,000+', label: 'Successful Hires', icon: 'check2-circle' },
  { value: '50+', label: 'Cities Covered', icon: 'geo-alt-fill' },
];

const TESTIMONIALS = [
  { name: 'Ramesh Kumar', role: 'Electrician · Bhopal', text: 'Kaamgar Connect changed my life. I now get 3-4 job calls per week. The platform is very easy to use even on my phone.', rating: 5 },
  { name: 'Priya Sharma', role: 'Employer · Indore', text: 'I needed a reliable plumber urgently. Found a verified professional within 2 hours. Absolutely amazing service!', rating: 5 },
  { name: 'Mohan Singh', role: 'Carpenter · Jabalpur', text: 'Ab mujhe kaam dhundne ki tension nahi. Kaamgar Connect se rozana naye kaam milte hain. Bahut achha platform hai.', rating: 5 },
];

const HOW_IT_WORKS_WORKER = [
  { step: '01', title: 'Create Profile', desc: 'Sign up and build your professional profile with your skills and experience.', icon: 'person-plus-fill' },
  { step: '02', title: 'Get Discovered', desc: 'Employers searching for your skills will find and contact you directly.', icon: 'eye-fill' },
  { step: '03', title: 'Start Working', desc: 'Accept offers, complete jobs, and build your reputation with reviews.', icon: 'briefcase-fill' },
];

const HOW_IT_WORKS_EMPLOYER = [
  { step: '01', title: 'Post a Job', desc: 'Create a detailed job listing for free and reach thousands of workers.', icon: 'plus-circle-fill' },
  { step: '02', title: 'Review Applicants', desc: 'Browse worker profiles, check ratings, and shortlist candidates.', icon: 'people-fill' },
  { step: '03', title: 'Hire & Review', desc: 'Hire the right worker and leave a review to help the community.', icon: 'star-fill' },
];

const Landing = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [topWorkers, setTopWorkers] = useState([]);

  useEffect(() => {
    getJobs({ featured: true, limit: 6 }).then(r => setFeaturedJobs(r.data.jobs?.slice(0, 6) || [])).catch(() => {});
    getWorkers({ available: 1, limit: 6 }).then(r => setTopWorkers(r.data.workers?.slice(0, 6) || [])).catch(() => {});
  }, []);

  return (
    <FullLayout>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-bg-shapes"></div>
        <div className="container">
          <div className="row align-items-center" style={{ minHeight: '88vh', paddingTop: '100px', paddingBottom: '60px' }}>
            <div className="col-lg-7">
              <div className="kc-badge badge-primary d-inline-flex mb-4" style={{ fontSize: '.8rem', padding: '8px 16px', borderRadius: '50px' }}>
                <i className="bi bi-stars me-2" style={{ color: 'var(--accent)' }}></i>
                India's Fastest Growing Job Platform for Skilled Workers
              </div>
              <h1 className="hero-title">
                Connect <span className="text-gradient">Skilled Workers</span><br />
                with Local Employers
              </h1>
              <p className="hero-sub">
                Find electricians, plumbers, carpenters & more — or post jobs and hire trusted local talent across Bhopal, Indore & beyond.
              </p>
              <div className="d-flex gap-3 flex-wrap mb-5">
                <Link to="/register" className="btn btn-primary btn-pill btn-lg px-5">
                  <i className="bi bi-stars me-2"></i>Get Started Free
                </Link>
                <Link to="/jobs" className="btn btn-outline-secondary btn-pill btn-lg px-5">
                  <i className="bi bi-briefcase me-2"></i>Browse Jobs
                </Link>
              </div>
              <div className="row g-3">
                {STATS.map(s => (
                  <div key={s.label} className="col-6 col-sm-3">
                    <div className="hero-stat">
                      <div className="hero-stat-value">{s.value}</div>
                      <div className="hero-stat-label"><i className={`bi bi-${s.icon} me-1`} style={{ color: 'var(--p)' }}></i>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-flex align-items-center justify-content-center">
              <div className="hero-visual">
                <div className="hero-card floating-card card-1">
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ fontSize: '2rem' }}>⚡</div>
                    <div><div className="fw-700">Rajesh Kumar</div><div className="small text-muted">Electrician · 5★</div></div>
                  </div>
                  <div className="kc-badge badge-verified mt-2"><i className="bi bi-patch-check-fill me-1"></i>ID Verified</div>
                </div>
                <div className="hero-card floating-card card-2">
                  <div className="fw-700 small mb-1"><i className="bi bi-briefcase me-1" style={{ color: 'var(--p)' }}></i>New Job Posted</div>
                  <div className="text-muted small">Senior Plumber needed — ₹18,000/mo</div>
                  <div className="text-muted" style={{ fontSize: '.75rem', marginTop: '4px' }}>Bhopal · Just now</div>
                </div>
                <div className="hero-card floating-card card-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    {[1,2,3,4,5].map(s => <i key={s} className="bi bi-star-fill" style={{ color: 'var(--accent)', fontSize: '.85rem' }}></i>)}
                  </div>
                  <div className="fw-700 small">Application Accepted!</div>
                  <div className="text-muted small">Mohan Singh · Carpenter</div>
                </div>
                <div className="hero-circle">
                  <div style={{ fontSize: '3.5rem' }}>🔨</div>
                  <div className="fw-700" style={{ fontFamily: 'var(--font-display)' }}>कामगार</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="kc-section" id="categories">
        <div className="container">
          <div className="section-header text-center mb-5">
            <div className="kc-badge badge-primary d-inline-flex mb-3"><i className="bi bi-grid me-2"></i>Browse by Category</div>
            <h2 className="section-title">Find the Right Skill</h2>
            <p className="section-sub">Thousands of verified professionals across all major trade categories</p>
          </div>
          <div className="row g-3">
            {CATEGORIES.map(cat => (
              <div key={cat.value} className="col-6 col-md-4 col-lg-3 col-xl-2">
                <Link to={`/jobs?category=${cat.value}`} className="kc-category-card text-decoration-none">
                  <div className="category-icon">{CATEGORY_ICONS[cat.value] || '💼'}</div>
                  <div className="category-label">{cat.label}</div>
                  <div className="category-count">{cat.count} jobs</div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="kc-section" id="how-it-works" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div className="section-header text-center mb-5">
            <div className="kc-badge badge-primary d-inline-flex mb-3"><i className="bi bi-play-circle me-2"></i>Simple Process</div>
            <h2 className="section-title">How It Works</h2>
          </div>
          <div className="row g-5">
            <div className="col-lg-6">
              <div className="mb-4">
                <div className="kc-badge badge-primary d-inline-flex mb-3"><i className="bi bi-hammer me-2"></i>For Workers</div>
              </div>
              <div className="d-flex flex-column gap-4">
                {HOW_IT_WORKS_WORKER.map((step, i) => (
                  <div key={i} className="d-flex gap-4">
                    <div className="step-num">{step.step}</div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                        <i className={`bi bi-${step.icon} me-2`} style={{ color: 'var(--p)' }}></i>{step.title}
                      </h3>
                      <p className="text-muted small mb-0">{step.desc}</p>
                    </div>
                  </div>
                ))}
                <Link to="/register" className="btn btn-primary btn-pill" style={{ width: 'fit-content' }}>
                  <i className="bi bi-hammer me-2"></i>Join as Worker
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="mb-4">
                <div className="kc-badge badge-success d-inline-flex mb-3"><i className="bi bi-building me-2"></i>For Employers</div>
              </div>
              <div className="d-flex flex-column gap-4">
                {HOW_IT_WORKS_EMPLOYER.map((step, i) => (
                  <div key={i} className="d-flex gap-4">
                    <div className="step-num" style={{ background: 'var(--success)20', color: 'var(--success)' }}>{step.step}</div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                        <i className={`bi bi-${step.icon} me-2`} style={{ color: 'var(--success)' }}></i>{step.title}
                      </h3>
                      <p className="text-muted small mb-0">{step.desc}</p>
                    </div>
                  </div>
                ))}
                <Link to="/register" className="btn btn-pill" style={{ width: 'fit-content', background: 'var(--success)', color: '#fff' }}>
                  <i className="bi bi-building me-2"></i>Join as Employer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED JOBS ────────────────────────────────── */}
      {featuredJobs.length > 0 && (
        <section className="kc-section" id="featured-jobs">
          <div className="container">
            <div className="section-header d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
              <div>
                <div className="kc-badge badge-warning d-inline-flex mb-3"><i className="bi bi-star-fill me-2"></i>Featured Jobs</div>
                <h2 className="section-title mb-0">Top Opportunities</h2>
              </div>
              <Link to="/jobs" className="btn btn-ghost btn-sm">View All Jobs <i className="bi bi-arrow-right ms-1"></i></Link>
            </div>
            <div className="row g-4">
              {featuredJobs.map(job => (
                <div key={job._id} className="col-md-6 col-xl-4">
                  <div className="kc-job-card h-100">
                    <div className="d-flex align-items-start gap-3 mb-3">
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,var(--p),var(--p-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                        {CATEGORY_ICONS[job.category] || '💼'}
                      </div>
                      <div>
                        <Link to={`/jobs/${job._id}`} className="fw-700 text-decoration-none" style={{ color: 'var(--text-primary)', fontSize: '.95rem' }}>{job.title}</Link>
                        <div className="text-muted small">{job.employer?.fullName || job.employer?.username}</div>
                      </div>
                      <span className="kc-badge badge-warning ms-auto"><i className="bi bi-star-fill me-1"></i>Featured</span>
                    </div>
                    <div className="d-flex flex-column gap-1 mb-3 small text-muted">
                      <div><i className="bi bi-geo-alt me-2"></i>{job.location}</div>
                      <div><i className="bi bi-currency-rupee me-2"></i>₹{job.salaryMin?.toLocaleString('en-IN')}–{job.salaryMax?.toLocaleString('en-IN')}/mo</div>
                    </div>
                    <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm btn-pill w-100 mt-auto">View Job</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TOP WORKERS ──────────────────────────────────── */}
      {topWorkers.length > 0 && (
        <section className="kc-section" id="top-workers" style={{ background: 'var(--surface)' }}>
          <div className="container">
            <div className="section-header d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
              <div>
                <div className="kc-badge badge-primary d-inline-flex mb-3"><i className="bi bi-people-fill me-2"></i>Top Rated</div>
                <h2 className="section-title mb-0">Meet Our Workers</h2>
              </div>
              <Link to="/workers" className="btn btn-ghost btn-sm">View All Workers <i className="bi bi-arrow-right ms-1"></i></Link>
            </div>
            <div className="row g-4">
              {topWorkers.map(w => {
                const wp = w.workerProfile;
                const initial = (w.firstName?.[0] || w.username?.[0] || 'W').toUpperCase();
                return (
                  <div key={w._id} className="col-md-6 col-xl-4">
                    <div className="kc-worker-card h-100 text-center">
                      <div className="kc-avatar kc-avatar-lg mx-auto mb-3">
                        {w.profilePhoto ? <img src={`http://localhost:5000${w.profilePhoto}`} alt="" /> : initial}
                      </div>
                      <div className="fw-700 mb-1">{w.firstName ? `${w.firstName} ${w.lastName || ''}`.trim() : w.username}</div>
                      <div className="text-muted small mb-2">{w.city || 'N/A'}</div>
                      {wp && (
                        <>
                          <div className="d-flex justify-content-center flex-wrap gap-2 mb-3">
                            {wp.aadharVerified && <span className="kc-badge badge-verified"><i className="bi bi-patch-check-fill me-1"></i>Verified</span>}
                            {wp.availability && <span className="kc-badge badge-success">Available</span>}
                            <span className="kc-badge badge-gray"><i className="bi bi-star-fill me-1"></i>{wp.rating}</span>
                          </div>
                          <div className="small text-muted mb-3">₹{wp.dailyRate}/day · {wp.experienceYears} yrs exp</div>
                        </>
                      )}
                      <Link to={`/workers/${w._id}`} className="btn btn-ghost btn-sm btn-pill w-100">View Profile</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="kc-section" id="testimonials">
        <div className="container">
          <div className="section-header text-center mb-5">
            <div className="kc-badge badge-primary d-inline-flex mb-3"><i className="bi bi-chat-quote me-2"></i>Real Stories</div>
            <h2 className="section-title">What People Say</h2>
          </div>
          <div className="row g-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="col-md-4">
                <div className="kc-card h-100">
                  <div className="d-flex gap-1 mb-3">
                    {[1,2,3,4,5].map(s => <i key={s} className="bi bi-star-fill" style={{ color: 'var(--accent)', fontSize: '.85rem' }}></i>)}
                  </div>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '.95rem' }}>"{t.text}"</p>
                  <div className="d-flex align-items-center gap-3 mt-auto">
                    <div className="kc-avatar kc-avatar-sm">{t.name[0]}</div>
                    <div>
                      <div className="fw-700 small">{t.name}</div>
                      <div className="text-muted" style={{ fontSize: '.75rem' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="kc-section" style={{ background: 'linear-gradient(135deg, var(--p), var(--p-light))' }}>
        <div className="container text-center">
          <div className="kc-badge d-inline-flex mb-4" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.3)' }}>
            <i className="bi bi-rocket-takeoff me-2"></i>Join 10,000+ users
          </div>
          <h2 className="fw-900 text-white mb-3" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>Ready to Get Started?</h2>
          <p className="mb-5" style={{ color: 'rgba(255,255,255,.8)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Join thousands of workers and employers on Kaamgar Connect today — it's completely free!
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/register" className="btn btn-lg btn-pill px-5" style={{ background: '#fff', color: 'var(--p)', fontWeight: 700 }}>
              <i className="bi bi-stars me-2"></i>Create Free Account
            </Link>
            <Link to="/jobs" className="btn btn-lg btn-pill btn-outline-light px-5">
              <i className="bi bi-briefcase me-2"></i>Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </FullLayout>
  );
};

export default Landing;
