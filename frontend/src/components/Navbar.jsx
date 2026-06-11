import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logoutUser, unreadCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (namespace) => location.pathname.startsWith(namespace);

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to logout?')) {
      logoutUser();
      navigate('/login');
    }
  };

  const avatarInitial = (user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase();

  return (
    <nav className="kc-navbar navbar navbar-expand-lg" id="mainNavbar">
      <div className="container-fluid px-4">

        {/* Brand */}
        <Link className="navbar-brand" to={isAuthenticated ? '/dashboard' : '/'}>
          <div className="brand-icon">K</div>
          <span className="brand-text d-none d-sm-inline">Kaamgar Connect</span>
        </Link>

        {/* Mobile: notification + hamburger */}
        <div className="d-flex align-items-center gap-2 d-lg-none">
          {isAuthenticated && (
            <Link to="/notifications" className="kc-icon-btn" style={{ textDecoration: 'none' }}>
              <i className="bi bi-bell"></i>
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </Link>
          )}
          <button className="btn kc-icon-btn" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu">
            <i className="bi bi-list fs-5"></i>
          </button>
        </div>

        {/* Desktop nav */}
        <div className="collapse navbar-collapse" id="navbarMain">
          {/* Search */}
          <div className="navbar-search ms-3 d-none d-xl-flex">
            <i className="bi bi-search"></i>
            <input
              type="text"
              id="navSearchInput"
              placeholder="Search jobs, skills…"
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/jobs?search=${e.target.value}`);
              }}
            />
          </div>

          <ul className="navbar-nav me-auto ps-2 gap-1">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className={`kc-nav-link nav-link ${isActive('/dashboard') ? 'active' : ''}`} to="/dashboard">
                    <i className="bi bi-grid-1x2"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`kc-nav-link nav-link ${isActive('/jobs') ? 'active' : ''}`} to="/jobs">
                    <i className="bi bi-briefcase"></i> Jobs
                  </Link>
                </li>
                {user?.role === 'employer' ? (
                  <>
                    <li className="nav-item">
                      <Link className="kc-nav-link nav-link" to="/jobs/post">
                        <i className="bi bi-plus-circle"></i> Post Job
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="kc-nav-link nav-link" to="/jobs/my-jobs">
                        <i className="bi bi-collection-fill"></i> My Jobs
                      </Link>
                    </li>
                  </>
                ) : (
                  <li className="nav-item">
                    <Link className={`kc-nav-link nav-link ${isActive('/applications') ? 'active' : ''}`} to="/applications">
                      <i className="bi bi-file-earmark-text"></i> Applications
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className={`kc-nav-link nav-link ${isActive('/workers') ? 'active' : ''}`} to="/workers">
                    <i className="bi bi-people"></i> Workers
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`kc-nav-link nav-link ${isActive('/chat') ? 'active' : ''}`} to="/chat">
                    <i className="bi bi-chat-dots"></i> Messages
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="kc-nav-link nav-link" to="/"><i className="bi bi-house"></i> Home</Link></li>
                <li className="nav-item"><Link className="kc-nav-link nav-link" to="/jobs"><i className="bi bi-briefcase"></i> Jobs</Link></li>
                <li className="nav-item"><Link className="kc-nav-link nav-link" to="/workers"><i className="bi bi-people"></i> Workers</Link></li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notification bell */}
                <Link to="/notifications" className="kc-icon-btn position-relative" style={{ textDecoration: 'none' }} title="Notifications">
                  <i className="bi bi-bell"></i>
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </Link>

                {/* Avatar dropdown */}
                <div className="dropdown">
                  <button className="kc-avatar-btn dropdown-toggle border-0 bg-transparent p-0" data-bs-toggle="dropdown" data-bs-offset="0,6">
                    <div className="kc-avatar kc-avatar-sm">
                      {user?.profilePhoto
                        ? <img src={`http://localhost:5000${user.profilePhoto}`} alt={user.username} />
                        : avatarInitial}
                    </div>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end kc-dropdown">
                    <div className="user-header">
                      <div className="d-flex align-items-center gap-2">
                        <div className="kc-avatar kc-avatar-sm">{avatarInitial}</div>
                        <div>
                          <div className="user-name">{user?.fullName || user?.username}</div>
                          <div className="user-role">{user?.role} · {user?.city || 'No city'}</div>
                        </div>
                      </div>
                    </div>
                    <li><Link className="dropdown-item" to="/profile"><i className="bi bi-person-circle"></i> My Profile</Link></li>
                    <li><Link className="dropdown-item" to="/dashboard"><i className="bi bi-grid-1x2"></i> Dashboard</Link></li>
                    <li>
                      <Link className="dropdown-item" to="/notifications">
                        <i className="bi bi-bell"></i> Notifications
                        {unreadCount > 0 && <span className="badge bg-danger ms-auto">{unreadCount}</span>}
                      </Link>
                    </li>
                    <li><Link className="dropdown-item" to="/change-password"><i className="bi bi-shield-lock"></i> Change Password</Link></li>
                    {(user?.isStaff || user?.role === 'admin') && (
                      <li><Link className="dropdown-item" to="/admin"><i className="bi bi-speedometer2"></i> Admin Panel</Link></li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <a className="dropdown-item text-danger" href="#logout" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i> Logout
                      </a>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm btn-pill px-4">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
