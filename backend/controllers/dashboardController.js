const Application = require('../models/Application');
const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');

// @route GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const user = req.user;

    if (user.role === 'worker') {
      const wp = await WorkerProfile.findOneAndUpdate({ user: user._id }, { user: user._id }, { upsert: true, new: true });
      const allApps = await Application.find({ worker: user._id }).populate({ path: 'job', populate: { path: 'employer', select: 'username firstName lastName profilePhoto city' } });
      const saves = await SavedJob.countDocuments({ user: user._id });
      const rooms = await ChatRoom.find({ worker: user._id });
      const unread = await Message.countDocuments({ room: { $in: rooms.map(r => r._id) }, isRead: false, sender: { $ne: user._id } });

      let recommended = await Job.find({ isActive: true, category: wp.skills, _id: { $nin: allApps.map(a => a.job?._id).filter(Boolean) } })
        .populate('employer', 'username firstName lastName profilePhoto city')
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(6);

      if (!recommended.length) {
        recommended = await Job.find({ isActive: true, _id: { $nin: allApps.map(a => a.job?._id).filter(Boolean) } })
          .populate('employer', 'username firstName lastName profilePhoto city')
          .sort({ isFeatured: -1, createdAt: -1 })
          .limit(6);
      }

      const checklist = [
        { label: 'Full Name', done: Boolean(user.firstName) },
        { label: 'Phone Number', done: Boolean(user.phone) },
        { label: 'Profile Photo', done: Boolean(user.profilePhoto) },
        { label: 'Bio', done: Boolean(user.bio) },
        { label: 'Daily Rate', done: Boolean(wp.dailyRate) },
        { label: 'Work Address', done: Boolean(wp.address) },
        { label: 'Resume', done: Boolean(wp.resume) },
        { label: 'ID Verified', done: Boolean(wp.aadharVerified) },
        { label: 'Extra Skills', done: Boolean(wp.extraSkills) },
        { label: 'Experience', done: Boolean(wp.experienceYears) },
      ];
      const completion = Math.round(checklist.filter(c => c.done).length / checklist.length * 100);

      const stats = {
        totalApplications: allApps.length,
        accepted: allApps.filter(a => a.status === 'accepted').length,
        pending: allApps.filter(a => a.status === 'pending').length,
        shortlisted: allApps.filter(a => a.status === 'shortlisted').length,
        availableJobs: await Job.countDocuments({ isActive: true }),
        savedJobs: saves,
        unreadMessages: unread,
        completion,
      };

      const JOB_CATEGORY_LABELS = { construction:'Construction',electrical:'Electrical',plumbing:'Plumbing',carpentry:'Carpentry',painting:'Painting',driving:'Driving',cooking:'Cooking',cleaning:'Cleaning',security:'Security',welding:'Welding',ac_tech:'AC Technician',tailoring:'Tailoring',other:'Other' };
      const CATEGORY_ICONS = { construction:'🏗️',electrical:'⚡',plumbing:'🔧',carpentry:'🪚',painting:'🎨',driving:'🚗',cooking:'👨‍🍳',cleaning:'🧹',security:'🛡️',welding:'⚒️',ac_tech:'❄️',tailoring:'🧵',other:'💼' };

      return res.json({
        role: 'worker',
        workerProfile: wp,
        recentApplications: allApps.slice(0, 6).map(a => ({
          _id: a._id,
          status: a.status,
          createdAt: a.createdAt,
          job: a.job ? { _id: a.job._id, title: a.job.title, location: a.job.location, category: a.job.category, salaryMin: a.job.salaryMin, salaryMax: a.job.salaryMax, employer: a.job.employer } : null,
        })),
        recommendedJobs: recommended.map(j => ({
          _id: j._id, title: j.title, location: j.location, category: j.category,
          categoryLabel: JOB_CATEGORY_LABELS[j.category],
          categoryIcon: CATEGORY_ICONS[j.category] || '💼',
          jobType: j.jobType, salaryMin: j.salaryMin, salaryMax: j.salaryMax,
          openings: j.openings, isFeatured: j.isFeatured, createdAt: j.createdAt,
          employer: j.employer,
        })),
        stats,
        checklist,
        completion,
      });
    } else {
      // Employer dashboard
      const myJobs = await Job.find({ employer: user._id }).sort({ createdAt: -1 });
      const rooms = await ChatRoom.find({ employer: user._id });
      const unread = await Message.countDocuments({ room: { $in: rooms.map(r => r._id) }, isRead: false, sender: { $ne: user._id } });
      const totalApps = await Application.find({ job: { $in: myJobs.map(j => j._id) } });
      const topWorkers = await User.find({ role: 'worker' })
        .select('username firstName lastName profilePhoto city')
        .limit(5);
      const topWorkerProfiles = await WorkerProfile.find({ user: { $in: topWorkers.map(u => u._id) } }).sort({ rating: -1 });
      const profileMap = {};
      topWorkerProfiles.forEach(p => { profileMap[p.user.toString()] = p; });

      const recentApps = await Application.find({ job: { $in: myJobs.map(j => j._id) } })
        .populate('worker', 'username firstName lastName profilePhoto city')
        .populate('job', 'title location category')
        .sort({ createdAt: -1 })
        .limit(6);

      const stats = {
        activeJobs: myJobs.filter(j => j.isActive).length,
        totalApplicants: totalApps.length,
        hired: totalApps.filter(a => a.status === 'accepted').length,
        pendingApps: totalApps.filter(a => a.status === 'pending').length,
        unreadMessages: unread,
        totalJobs: myJobs.length,
        totalViews: myJobs.reduce((s, j) => s + j.views, 0),
      };

      return res.json({
        role: 'employer',
        myJobs: myJobs.filter(j => j.isActive).slice(0, 5).map(j => ({
          _id: j._id, title: j.title, location: j.location, category: j.category,
          isActive: j.isActive, isFeatured: j.isFeatured, views: j.views, createdAt: j.createdAt,
          salaryMin: j.salaryMin, salaryMax: j.salaryMax, openings: j.openings,
        })),
        allMyJobsCount: myJobs.length,
        recentApplicants: recentApps.map(a => ({
          _id: a._id, status: a.status, createdAt: a.createdAt,
          worker: a.worker, job: a.job,
        })),
        topWorkers: topWorkers.map(u => ({ ...u.toObject(), workerProfile: profileMap[u._id.toString()] || null })),
        stats,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/dashboard/analytics
const getAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'employer') return res.status(403).json({ message: 'Employers only.' });

    const jobs = await Job.find({ employer: req.user._id });
    const jobIds = jobs.map(j => j._id);
    const apps = await Application.find({ job: { $in: jobIds } });

    const byCat = {};
    jobs.forEach(j => { byCat[j.category] = (byCat[j.category] || 0) + 1; });
    const appsByCategory = Object.entries(byCat).map(([k, v]) => ({ category: k, count: v })).sort((a, b) => b.count - a.count);

    const byStatus = {};
    apps.forEach(a => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
    const appsByStatus = Object.entries(byStatus).map(([k, v]) => ({ status: k, count: v })).sort((a, b) => b.count - a.count);

    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const count = apps.filter(a => {
        const ad = new Date(a.createdAt);
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
      }).length;
      monthly.push({ label: d.toLocaleString('default', { month: 'short' }), count });
    }

    res.json({
      jobs, appsByStatus, appsByCategory, monthly,
      totalViews: jobs.reduce((s, j) => s + j.views, 0),
      totalApps: apps.length,
      hired: apps.filter(a => a.status === 'accepted').length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboard, getAnalytics };
