import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <footer className="kc-footer">
      <div className="container">
        <div className="row g-4 py-5">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="brand-icon" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>K</div>
              <span className="footer-brand">Kaamgar Connect</span>
            </div>
            <p className="small lh-relaxed mb-3" style={{ color: '#9ca3af' }}>
              India's trusted local job marketplace — connecting skilled workers with employers across Bhopal, Indore &amp; beyond.
            </p>
            <div className="d-flex gap-2">
              <button type="button" className="kc-social-btn" aria-label="Twitter / X"><i className="bi bi-twitter-x"></i></button>
              <button type="button" className="kc-social-btn" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></button>
              <button type="button" className="kc-social-btn" aria-label="Instagram"><i className="bi bi-instagram"></i></button>
              <a href="mailto:hello@kaamgar.com" className="kc-social-btn"><i className="bi bi-envelope"></i></a>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-6">
            <div className="footer-section-title">Platform</div>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="/jobs" className="footer-link">Browse Jobs</Link></li>
              <li><Link to="/workers" className="footer-link">Find Workers</Link></li>
              <li><Link to="/register" className="footer-link">Register</Link></li>
              {isAuthenticated && user?.role === 'employer' && (
                <li><Link to="/jobs/post" className="footer-link">Post a Job</Link></li>
              )}
            </ul>
          </div>
          <div className="col-lg-2 col-md-3 col-6">
            <div className="footer-section-title">Company</div>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><a href="#about" className="footer-link">About Us</a></li>
              <li><a href="#team" className="footer-link">Our Team</a></li>
              <li><a href="#contact" className="footer-link">Contact</a></li>
              <li><span className="footer-link" style={{ cursor: 'default' }}>Privacy Policy</span></li>
            </ul>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="footer-section-title">Contact</div>
            <ul className="list-unstyled d-flex flex-column gap-2 small" style={{ color: '#9ca3af' }}>
              <li><i className="bi bi-envelope me-2" style={{ color: '#6366f1' }}></i>hello@kaamgar.com</li>
              <li><i className="bi bi-telephone me-2" style={{ color: '#6366f1' }}></i>+91 98765 43210</li>
              <li><i className="bi bi-geo-alt me-2" style={{ color: '#6366f1' }}></i>Bhopal, MP 462001</li>
              <li><i className="bi bi-clock me-2" style={{ color: '#6366f1' }}></i>Mon–Sat, 9am – 6pm IST</li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}></div>
        <div className="d-flex flex-wrap justify-content-between align-items-center py-4 gap-2" style={{ color: '#6b7280', fontSize: '.82rem' }}>
          <span>© 2025 Kaamgar Connect. All rights reserved.</span>
          <div className="d-flex gap-3">
            <span className="footer-link" style={{ cursor: 'default' }}>Terms</span>
            <span className="footer-link" style={{ cursor: 'default' }}>Privacy</span>
          </div>
          <span>Made with <span style={{ color: '#e11d48' }}>♥</span> in Bhopal, India</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
