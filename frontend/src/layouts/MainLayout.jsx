import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const MobileOffcanvas = () => {
  const { user, isAuthenticated, logoutUser, unreadCount } = useAuth();
  const navigate = useNavigate();
  const avatarInitial = (user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase();

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm('Log out?')) { logoutUser(); navigate('/login'); }
  };

  return (
    <div className="offcanvas offcanvas-start kc-offcanvas" id="mobileMenu" tabIndex="-1">
      <div className="offcanvas-header">
        <div className="d-flex align-items-center gap-2">
          <div className="brand-icon" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>K</div>
          <span className="fw-700" style={{ fontFamily: 'var(--font-display)' }}>Kaamgar Connect</span>
        </div>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div className="offcanvas-body">
        {isAuthenticated && user && (
          <div className="kc-user-pill mb-1">
            <div className="kc-avatar kc-avatar-sm">{avatarInitial}</div>
            <div>
              <div className="fw-700 small">{user.fullName || user.username}</div>
              <div className="text-muted" style={{ fontSize: '.72rem', textTransform: 'capitalize' }}>{user.role} Account</div>
            </div>
          </div>
        )}
        <div className="sidebar-section-label">Navigation</div>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="kc-sidebar-link" data-bs-dismiss="offcanvas"><i className="bi bi-grid-1x2"></i> Dashboard</Link>
            <Link to="/jobs" className="kc-sidebar-link" data-bs-dismiss="offcanvas"><i className="bi bi-briefcase"></i> Browse Jobs</Link>
            {user?.role === 'employer' ? (
              <>
                <Link to="/jobs/post" className="kc-sidebar-link" data-bs-dismiss="offcanvas"><i className="bi bi-plus-circle"></i> Post Job</Link>
                <Link to="/jobs/my-jobs" className="kc-sidebar-link" data-bs-dismiss="offcanvas"><i className="bi bi-collection-fill"></i> My Jobs</Link>
              </>
            ) : (
              <Link to="/applications" className="kc-sidebar-link" data-bs-dismiss="offcanvas"><i className="bi bi-file-earmark-text"></i> Applications</Link>
            )}
            <Link to="/workers" className="kc-sidebar-link" data-bs-dismiss="offcanvas"><i className="bi bi-people"></i> Workers</Link>
            <Link to="/chat" className="kc-sidebar-link" data-bs-dismiss="offcanvas"><i className="bi bi-chat-dots"></i> Messages</Link>
            <div className="sidebar-section-label mt-2">Account</div>
            <Link to="/profile" className="kc-sidebar-link" data-bs-dismiss="offcanvas"><i className="bi bi-person-circle"></i> Profile</Link>
            <Link to="/notifications" className="kc-sidebar-link" data-bs-dismiss="offcanvas">
              <i className="bi bi-bell"></i> Notifications {unreadCount > 0 && <span className="sidebar-notif">{unreadCount}</span>}
            </Link>
          </>
        ) : (
          <>
            <Link to="/" className="kc-sidebar-link" data-bs-dismiss="offcanvas"><i className="bi bi-house"></i> Home</Link>
            <Link to="/jobs" className="kc-sidebar-link" data-bs-dismiss="offcanvas"><i className="bi bi-briefcase"></i> Jobs</Link>
            <Link to="/workers" className="kc-sidebar-link" data-bs-dismiss="offcanvas"><i className="bi bi-people"></i> Workers</Link>
            <div className="sidebar-section-label mt-2">Account</div>
            <Link to="/login" className="kc-sidebar-link" data-bs-dismiss="offcanvas"><i className="bi bi-key"></i> Login</Link>
            <Link to="/register" className="kc-sidebar-link fw-600" style={{ color: 'var(--p)' }} data-bs-dismiss="offcanvas"><i className="bi bi-stars"></i> Register Free</Link>
          </>
        )}
        <hr style={{ borderColor: 'var(--border)', margin: '1rem 0' }} />
        {isAuthenticated && (
          <a href="#logout" className="kc-sidebar-link" style={{ color: 'var(--danger)' }} onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </a>
        )}
      </div>
    </div>
  );
};

// Main layout with sidebar (for authenticated pages)
const MainLayout = ({ children, showSidebar = true, stats }) => {
  useEffect(() => {
    document.body.classList.add('loaded');
    document.documentElement.style.visibility = 'visible';
  }, []);

  return (
    <>
      <Navbar />
      <MobileOffcanvas />
      <div className="kc-layout" id="mainLayout">
        {showSidebar && <Sidebar stats={stats} />}
        <main className="kc-main" id="mainContent">
          <div className="kc-page">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

// Full-width layout (no sidebar — for landing, auth pages etc.)
export const FullLayout = ({ children }) => {
  useEffect(() => {
    document.body.classList.add('loaded');
    document.documentElement.style.visibility = 'visible';
  }, []);

  return (
    <>
      <Navbar />
      <MobileOffcanvas />
      {children}
      <Footer />
    </>
  );
};

export default MainLayout;
