import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import VerifyOTP from '../pages/VerifyOTP';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import ChangePassword from '../pages/ChangePassword';
import JobList from '../pages/JobList';
import JobDetail from '../pages/JobDetail';
import PostJob from '../pages/PostJob';
import MyJobs from '../pages/MyJobs';
import JobApplicants from '../pages/JobApplicants';
import SavedJobs from '../pages/SavedJobs';
import WorkerList from '../pages/WorkerList';
import WorkerDetail from '../pages/WorkerDetail';
import MyApplications from '../pages/MyApplications';
import ChatInbox from '../pages/ChatInbox';
import ChatRoom from '../pages/ChatRoom';
import NotificationList from '../pages/NotificationList';
import Analytics from '../pages/Analytics';
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';
import AdminJobs from '../pages/AdminJobs';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/jobs" element={<JobList />} />
      <Route path="/workers" element={<WorkerList />} />
      <Route path="/workers/:id" element={<WorkerDetail />} />

      {/* Protected — any authenticated */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatInbox /></ProtectedRoute>} />
      <Route path="/chat/:id" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationList /></ProtectedRoute>} />
      {/* Static job routes MUST come before dynamic /jobs/:id */}
      <Route path="/jobs/saved" element={<ProtectedRoute><SavedJobs /></ProtectedRoute>} />
      <Route path="/jobs/:id" element={<JobDetail />} />

      {/* Worker only */}
      <Route path="/applications" element={<ProtectedRoute roles={['worker']}><MyApplications /></ProtectedRoute>} />

      {/* Employer only */}
      <Route path="/jobs/post" element={<ProtectedRoute roles={['employer']}><PostJob /></ProtectedRoute>} />
      <Route path="/jobs/edit/:id" element={<ProtectedRoute roles={['employer']}><PostJob /></ProtectedRoute>} />
      <Route path="/jobs/my-jobs" element={<ProtectedRoute roles={['employer']}><MyJobs /></ProtectedRoute>} />
      <Route path="/jobs/:id/applicants" element={<ProtectedRoute roles={['employer']}><JobApplicants /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute roles={['employer']}><Analytics /></ProtectedRoute>} />

      {/* Admin only */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute roles={['admin']}><AdminJobs /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
