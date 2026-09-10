const Application = require('../models/Application');
const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');

const JOB_CATEGORY_LABELS = { construction:'Construction',electrical:'Electrical',plumbing:'Plumbing',carpentry:'Carpentry',painting:'Painting',driving:'Driving',cooking:'Cooking',cleaning:'Cleaning',security:'Security',welding:'Welding',ac_tech:'AC Technician',tailoring:'Tailoring',other:'Other' };
const CATEGORY_ICONS = { construction:'🏗️',electrical:'⚡',plumbing:'🔧',carpentry:'🪚',painting:'🎨',driving:'🚗',cooking:'👨‍🍳',cleaning:'🧹',security:'🛡️',welding:'⚒️',ac_tech:'❄️',tailoring:'🧵',other:'💼' };

// @route GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const user = req.user;

    if (user.role === 'worker') {
      // Ensure worker profile always exists
      const wp = await WorkerProfile.findOneAndUpdate(
        { user: user._id },
        { $setOnInsert: { user: user._id } },
        { upsert: true, new: true }
      );

      const allApps = await Application.find({ worker: user._id })
        .populate({ path: 'job', populate: { path: 'employer', select: 'username firstName lastName profilePhoto city' } });

      const saves = await SavedJob.countDocuments({ user: user._id });

      const rooms = await ChatRoom.find({ worker: user._id });
      const unread = rooms.length
        ? await Message.countDocuments({ room: { $in: rooms.map(r => r._id) }, isRead: false, sender: { $ne: user._id } })
        : 0;

      // Recommended jobs based on skills, excluding already-applied
      const appliedJobIds = allApps.map(a => a.job?._id).filter(Boolean);
      const workerSkills = Array.isArray(wp.skills) ? wp.skills : [wp.skills].filter(Boolean);

      let recommended = await Job.find({
        isActive: true,
        _id: { $nin: appliedJobIds },
        ...(workerSkills.length ? { category: { $in: workerSkills } } : {}),
      })
        .populate('employer', 'username firstName lastName profilePhoto city')
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(6);

      // Fallback: any active jobs
      if (!recommended.length) {
        recommended = await Job.find({ isActive: true, _id: { $nin: appliedJobIds } })
          .populate('employer', 'username firstName lastName profilePhoto city')
          .sort({ isFeatured: -1, createdAt: -1 })
          .limit(6);
      }

      const checklist = [
        { label: 'Full Name',      done: Boolean(user.firstName) },
        { label: 'Phone Number',   done: Boolean(user.phone) },
        { label: 'Profile Photo',  done: Boolean(user.profilePhoto) },
        { label: 'Bio',            done: Boolean(user.bio) },
        { label: 'Daily Rate',     done: Boolean(wp.dailyRate) },
        { label: 'Work Address',   done: Boolean(wp.address) },
        { label: 'Resume',         done: Boolean(wp.resume) },
        { label: 'Extra Skills',   done: Boolean(wp.extraSkills) },
        { label: 'Experience',     done: Boolean(wp.experienceYears) },
        { label: 'Availability',   done: Boolean(wp.availability) },
      ];
      const completion = Math.round(checklist.filter(c => c.done).length / checklist.length * 100);

      const stats = {
        totalApplications: allApps.length,
        accepted:          allApps.filter(a => a.status === 'accepted').length,
        pending:           allApps.filter(a => a.status === 'pending').length,
        shortlisted:       allApps.filter(a => a.status === 'shortlisted').length,
        availableJobs:     await Job.countDocuments({ isActive: true }),
        savedJobs:         saves,
        unreadMessages:    unread,
        completion,
      };

      return res.json({
        role: 'worker',
        workerProfile: wp,
        recentApplications: allApps.slice(0, 6).map(a => ({
          _id:       a._id,
          status:    a.status,
          createdAt: a.createdAt,
          job: a.job ? {
            _id:       a.job._id,
            title:     a.job.title,
            location:  a.job.location,
            category:  a.job.category,
            salaryMin: a.job.salaryMin,
            salaryMax: a.job.salaryMax,
            employer:  a.job.employer,
          } : null,
        })),
        recommendedJobs: recommended.map(j => ({
          _id:           j._id,
          title:         j.title,
          location:      j.location,
          category:      j.category,
          categoryLabel: JOB_CATEGORY_LABELS[j.category] || j.category,
          categoryIcon:  CATEGORY_ICONS[j.category]       || '💼',
          jobType:       j.jobType,
          salaryMin:     j.salaryMin,
          salaryMax:     j.salaryMax,
          openings:      j.openings,
          isFeatured:    j.isFeatured,
          createdAt:     j.createdAt,
          employer:      j.employer,
        })),
        stats,
        checklist,
        completion,
      });

    } else {
      // ── Employer Dashboard ──────────────────────────────────────────────
      const myJobs = await Job.find({ employer: user._id }).sort({ createdAt: -1 });
      const jobIds = myJobs.map(j => j._id);

      const rooms  = await ChatRoom.find({ employer: user._id });
      const unread = rooms.length
        ? await Message.countDocuments({ room: { $in: rooms.map(r => r._id) }, isRead: false, sender: { $ne: user._id } })
        : 0;

      const totalApps = jobIds.length
        ? await Application.find({ job: { $in: jobIds } })
        : [];

      const recentApps = jobIds.length
        ? await Application.find({ job: { $in: jobIds } })
            .populate('worker', 'username firstName lastName profilePhoto city')
            .populate('job',    'title location category')
            .sort({ createdAt: -1 })
            .limit(6)
        : [];

      // Top available workers
      const topWorkerProfiles = await WorkerProfile.find({ availability: true })
        .sort({ rating: -1, totalJobs: -1 })
        .limit(6);

      const topWorkerUsers = await User.find({ _id: { $in: topWorkerProfiles.map(p => p.user) }, isActive: true })
        .select('username firstName lastName profilePhoto city');

      const profileMap = {};
      topWorkerProfiles.forEach(p => { profileMap[p.user.toString()] = p; });

      const stats = {
        activeJobs:     myJobs.filter(j => j.isActive).length,
        totalApplicants:totalApps.length,
        hired:          totalApps.filter(a => a.status === 'accepted').length,
        pendingApps:    totalApps.filter(a => a.status === 'pending').length,
        unreadMessages: unread,
        totalJobs:      myJobs.length,
        totalViews:     myJobs.reduce((s, j) => s + (j.views || 0), 0),
      };

      return res.json({
        role: 'employer',
        myJobs: myJobs.filter(j => j.isActive).slice(0, 5).map(j => ({
          _id:       j._id,
          title:     j.title,
          location:  j.location,
          category:  j.category,
          isActive:  j.isActive,
          isFeatured:j.isFeatured,
          views:     j.views,
          createdAt: j.createdAt,
          salaryMin: j.salaryMin,
          salaryMax: j.salaryMax,
          openings:  j.openings,
        })),
        allMyJobsCount: myJobs.length,
        recentApplicants: recentApps.map(a => ({
          _id:       a._id,
          status:    a.status,
          createdAt: a.createdAt,
          worker:    a.worker,
          job:       a.job,
        })),
        topWorkers: topWorkerUsers.map(u => ({
          ...u.toObject(),
          workerProfile: profileMap[u._id.toString()] || null,
        })),
        stats,
      });
    }
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboard };
