const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const WorkerProfile = require('../models/WorkerProfile');

// @route GET /api/admin/dashboard
const getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      totalUsers: await User.countDocuments(),
      totalWorkers: await User.countDocuments({ role: 'worker' }),
      totalEmployers: await User.countDocuments({ role: 'employer' }),
      totalJobs: await Job.countDocuments(),
      activeJobs: await Job.countDocuments({ isActive: true }),
      totalApps: await Application.countDocuments(),
      newUsersWeek: await User.countDocuments({ createdAt: { $gte: weekAgo } }),
      newJobsMonth: await Job.countDocuments({ createdAt: { $gte: monthAgo } }),
      pendingApps: await Application.countDocuments({ status: 'pending' }),
      acceptedApps: await Application.countDocuments({ status: 'accepted' }),
      verifiedWorkers: await WorkerProfile.countDocuments({ aadharVerified: true }),
    };

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select('-password');
    const recentJobs = await Job.find().populate('employer', 'username firstName lastName').sort({ createdAt: -1 }).limit(10);
    const pendingVerifications = await WorkerProfile.find({ aadharVerified: false })
      .populate('user', 'username firstName lastName email city createdAt')
      .limit(10);

    res.json({ stats, recentUsers, recentJobs, pendingVerifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/admin/users
const manageUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
    ];
    const users = await User.find(query).sort({ createdAt: -1 }).select('-password');
    res.json({ users, role, search });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/admin/users/:id/toggle
const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/admin/jobs
const manageJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('employer', 'username firstName lastName').sort({ createdAt: -1 });
    const jobsWithCounts = await Promise.all(jobs.map(async j => ({
      ...j.toObject(),
      applicationsCount: await Application.countDocuments({ job: j._id }),
    })));
    res.json({ jobs: jobsWithCounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/admin/jobs/:id/feature
const toggleJobFeatured = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    job.isFeatured = !job.isFeatured;
    await job.save();
    res.json({ message: `Job ${job.isFeatured ? 'featured' : 'unfeatured'}.`, isFeatured: job.isFeatured });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/admin/workers/:id/verify
const verifyWorker = async (req, res) => {
  try {
    const wp = await WorkerProfile.findOneAndUpdate({ user: req.params.id }, { aadharVerified: true }, { new: true }).populate('user', 'username firstName lastName');
    if (!wp) return res.status(404).json({ message: 'Worker profile not found.' });
    res.json({ message: `${wp.user.firstName || wp.user.username} verified successfully!`, workerProfile: wp });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAdminDashboard, manageUsers, toggleUser, manageJobs, toggleJobFeatured, verifyWorker };
