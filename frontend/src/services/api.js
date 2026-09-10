import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('kc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kc_token');
      localStorage.removeItem('kc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── AUTH ─────────────────────────────────────────────
export const register = (data) => API.post('/auth/register', data);
export const verifyOtp = (data) => API.post('/auth/verify-otp', data);
export const resendOtp = (data) => API.post('/auth/resend-otp', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (formData) => API.put('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateResume = (formData) => API.put('/auth/profile/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const changePassword = (data) => API.put('/auth/change-password', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);

// ── JOBS ─────────────────────────────────────────────
export const getJobs = (params) => API.get('/jobs', { params });
export const getJobDetail = (id) => API.get(`/jobs/${id}`);
export const postJob = (data) => API.post('/jobs', data);
export const editJob = (id, data) => API.put(`/jobs/${id}`, data);
export const deleteJob = (id) => API.delete(`/jobs/${id}`);
export const getMyJobs = () => API.get('/jobs/my-jobs');
export const toggleSaveJob = (id) => API.post(`/jobs/${id}/save`);
export const getSavedJobs = () => API.get('/jobs/saved');
export const toggleJob = (id) => API.patch(`/jobs/${id}/toggle`);
export const getApplicants = (id, params) => API.get(`/jobs/${id}/applicants`, { params });
export const updateApplicationStatus = (jobId, appId, data) => API.patch(`/jobs/${jobId}/applicants/${appId}`, data);

// ── WORKERS ──────────────────────────────────────────
export const getWorkers = (params) => API.get('/workers', { params });
export const getWorkerDetail = (id) => API.get(`/workers/${id}`);

// ── APPLICATIONS ─────────────────────────────────────
export const applyForJob = (jobId, formData) => API.post(`/applications/${jobId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getMyApplications = (params) => API.get('/applications', { params });
export const withdrawApplication = (id) => API.delete(`/applications/${id}`);
export const reviewWorker = (jobId, workerId, data) => API.post(`/applications/review/${jobId}/${workerId}`, data);

// ── CHAT ─────────────────────────────────────────────
export const getChatInbox = () => API.get('/chat/inbox');
export const getChatRoom = (id) => API.get(`/chat/room/${id}`);
export const sendMessage = (id, data) => API.post(`/chat/room/${id}/send`, data);
export const pollMessages = (id, afterId) => API.get(`/chat/poll/${id}`, { params: { after: afterId } });
export const startChat = (userId) => API.post(`/chat/start/${userId}`);

// ── NOTIFICATIONS ─────────────────────────────────────
export const getNotifications = () => API.get('/notifications');
export const markAllRead = () => API.post('/notifications/mark-all-read');
export const getUnreadCount = () => API.get('/notifications/unread-count');

// ── DASHBOARD ─────────────────────────────────────────
export const getDashboard = () => API.get('/dashboard');
export const getAnalytics = () => API.get('/dashboard/analytics');

// ── REVIEWS ──────────────────────────────────────────
export const createReview = (data) => API.post('/reviews', data);
export const getUserReviews = (userId) => API.get(`/reviews/user/${userId}`);

// ── ADMIN ─────────────────────────────────────────────
export const getAdminDashboard = () => API.get('/admin/dashboard');
export const getAdminUsers = (params) => API.get('/admin/users', { params });
export const toggleAdminUser = (id) => API.patch(`/admin/users/${id}/toggle`);
export const getAdminJobs = () => API.get('/admin/jobs');
export const toggleJobFeatured = (id) => API.patch(`/admin/jobs/${id}/feature`);
export const verifyWorker = (id) => API.patch(`/admin/workers/${id}/verify`);

export default API;
