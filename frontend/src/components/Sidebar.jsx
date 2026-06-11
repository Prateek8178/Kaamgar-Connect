import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ stats = {} }) => {
  const { user, logoutUser, unreadCount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm('Log out?')) { logoutUser(); navigate('/login'); }
  };

  const avatarInitial = (user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase();

  return (
    <aside className="kc-sidebar" id="sidebar">
      {/* Sidebar toggle button */}
      <button className="sidebar-toggle-btn" id="sidebarToggle" title="Collapse sidebar">
        <i className="bi bi-layout-sidebar-reverse"></i>
      </button>

      {/* User mini-card */}
      {user && (
        <div className="sidebar-user">
          <div className="kc-avatar kc-avatar-md">
            {user.profilePhoto
              ? <img src={`http://localhost:5000${user.profilePhoto}`} alt="avatar" />
              : avatarInitial}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{(user.fullName || user.username || '').substring(0, 18)}</div>
            <div className="sidebar-user-role">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''} · {user.city || 'No city'}</div>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>
        <Link to="/dashboard" className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}>
          <i className="bi bi-grid-1x2-fill"></i><span>Dashboard</span>
        </Link>
        <Link to="/jobs" className={`sidebar-link ${isActive('/jobs') && !isActive('/jobs/post') && !isActive('/jobs/my-jobs') ? 'active' : ''}`}>
          <i className="bi bi-briefcase-fill"></i><span>Browse Jobs</span>
        </Link>

        {user?.role === 'worker' && (
          <>
            <Link to="/applications" className={`sidebar-link ${isActive('/applications') ? 'active' : ''}`}>
              <i className="bi bi-file-earmark-text-fill"></i><span>My Applications</span>
              {stats.pending > 0 && <span className="sidebar-count">{stats.pending}</span>}
            </Link>
            <Link to="/jobs/saved" className={`sidebar-link ${isActive('/jobs/saved') ? 'active' : ''}`}>
              <i className="bi bi-bookmark-heart-fill"></i><span>Saved Jobs</span>
            </Link>
          </>
        )}

        {user?.role === 'employer' && (
          <>
            <Link to="/jobs/my-jobs" className={`sidebar-link ${isActive('/jobs/my-jobs') ? 'active' : ''}`}>
              <i className="bi bi-collection-fill"></i><span>My Jobs</span>
            </Link>
            <Link to="/jobs/post" className={`sidebar-link ${isActive('/jobs/post') ? 'active' : ''}`}>
              <i className="bi bi-plus-circle-fill"></i><span>Post a Job</span>
            </Link>
            <Link to="/workers" className={`sidebar-link ${isActive('/workers') ? 'active' : ''}`}>
              <i className="bi bi-people-fill"></i><span>Find Workers</span>
            </Link>
            <Link to="/analytics" className={`sidebar-link ${isActive('/analytics') ? 'active' : ''}`}>
              <i className="bi bi-bar-chart-fill"></i><span>Analytics</span>
            </Link>
          </>
        )}

        <div className="sidebar-section-label">Communication</div>
        <Link to="/chat" className={`sidebar-link ${isActive('/chat') ? 'active' : ''}`}>
          <i className="bi bi-chat-dots-fill"></i><span>Messages</span>
          {unreadCount > 0 && <span className="sidebar-count">{unreadCount}</span>}
        </Link>
        <Link to="/notifications" className={`sidebar-link ${isActive('/notifications') ? 'active' : ''}`}>
          <i className="bi bi-bell-fill"></i><span>Notifications</span>
        </Link>

        <div className="sidebar-section-label">Account</div>
        <Link to="/profile" className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}>
          <i className="bi bi-person-circle"></i><span>Profile</span>
        </Link>
        <Link to="/change-password" className={`sidebar-link ${isActive('/change-password') ? 'active' : ''}`}>
          <i className="bi bi-shield-lock-fill"></i><span>Security</span>
        </Link>

        {(user?.isStaff || user?.role === 'admin') && (
          <>
            <div className="sidebar-section-label">Admin</div>
            <Link to="/admin" className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}>
              <i className="bi bi-speedometer2"></i><span>Admin Panel</span>
            </Link>
          </>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <a href="#logout" className="sidebar-link" style={{ color: 'var(--danger)' }} onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i><span>Logout</span>
          </a>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
