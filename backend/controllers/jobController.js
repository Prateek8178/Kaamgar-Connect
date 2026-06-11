const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const Application = require('../models/Application');
const WorkerProfile = require('../models/WorkerProfile');
const { notifyNewApplication } = require('../utils/helpers');

const JOB_CATEGORY_CHOICES = ['construction','electrical','plumbing','carpentry','painting','driving','cooking','cleaning','security','welding','ac_tech','tailoring','other'];
const JOB_CATEGORY_LABELS = { construction:'Construction',electrical:'Electrical',plumbing:'Plumbing',carpentry:'Carpentry',painting:'Painting',driving:'Driving',cooking:'Cooking',cleaning:'Cleaning',security:'Security',welding:'Welding',ac_tech:'AC Technician',tailoring:'Tailoring',other:'Other' };
const JOB_TYPE_LABELS = { full_time:'Full Time',part_time:'Part Time',contract:'Contract',daily:'Daily Wage',internship:'Internship' };
const EXPERIENCE_LABELS = { fresher:'Fresher (0 yrs)','1_2':'1–2 Years','3_5':'3–5 Years','5_plus':'5+ Years','10_plus':'10+ Years' };
const CATEGORY_ICONS = { construction:'🏗️',electrical:'⚡',plumbing:'🔧',carpentry:'🪚',painting:'🎨',driving:'🚗',cooking:'👨‍🍳',cleaning:'🧹',security:'🛡️',welding:'⚒️',ac_tech:'❄️',tailoring:'🧵',other:'💼' };

const formatJob = (job, savedIds = new Set(), userId = null) => ({
  _id: job._id,
  title: job.title,
  titleHi: job.titleHi,
  category: job.category,
  categoryLabel: JOB_CATEGORY_LABELS[job.category] || job.category,
  categoryIcon: CATEGORY_ICONS[job.category] || '💼',
  jobType: job.jobType,
  jobTypeLabel: JOB_TYPE_LABELS[job.jobType] || job.jobType,
  experienceReq: job.experienceReq,
  experienceLabel: EXPERIENCE_LABELS[job.experienceReq] || job.experienceReq,
  skillsRequired: job.skillsRequired,
  skillsList: job.skillsRequired ? job.skillsRequired.split(',').map(s => s.trim()).filter(Boolean) : [],
  description: job.description,
  descriptionHi: job.descriptionHi,
  location: job.location,
  latitude: job.latitude,
  longitude: job.longitude,
  salaryMin: job.salaryMin,
  salaryMax: job.salaryMax,
  openings: job.openings,
  isActive: job.isActive,
  isFeatured: job.isFeatured,
  views: job.views,
  deadline: job.deadline,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
  employer: job.employer ? {
    _id: job.employer._id,
    username: job.employer.username,
    firstName: job.employer.firstName,
    lastName: job.employer.lastName,
    fullName: `${job.employer.firstName || ''} ${job.employer.lastName || ''}`.trim() || job.employer.username,
    profilePhoto: job.employer.profilePhoto,
    city: job.employer.city,
  } : null,
  isSaved: savedIds.has(job._id.toString()),
  applicationsCount: job.applicationsCount || 0,
  distance: job.distance,
});

// @route GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const { category, location, job_type, experience, salary_min, search, distance, page = 1 } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (job_type) query.jobType = job_type;
    if (experience) query.experienceReq = experience;
    if (salary_min) query.salaryMin = { $gte: parseFloat(salary_min) };
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { skillsRequired: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];

    let jobs = await Job.find(query).populate('employer', 'username firstName lastName profilePhoto city').sort({ isFeatured: -1, createdAt: -1 });

    // Apply distance filter
    if (req.user) {
      try {
        const wp = await WorkerProfile.findOne({ user: req.user._id });
        if (wp && wp.latitude) {
          const distKm = parseInt(distance) || wp.workingRadiusKm;
          jobs = jobs.map(j => {
            if (j.latitude && j.longitude) {
              const d = haversine(wp.latitude, wp.longitude, j.latitude, j.longitude);
              j.distance = d;
              return { ...j._doc, distance: d };
            }
            return j;
          }).filter(j => !distance || !j.latitude || j.distance <= distKm);
        }
      } catch (_) {}
    }

    // Saved jobs
    let savedIds = new Set();
    if (req.user) {
      const saves = await SavedJob.find({ user: req.user._id }).select('job');
      savedIds = new Set(saves.map(s => s.job.toString()));
    }

    // Pagination
    const pageSize = 12;
    const total = jobs.length;
    const start = (parseInt(page) - 1) * pageSize;
    const pageJobs = jobs.slice(start, start + pageSize);

    res.json({
      jobs: pageJobs.map(j => formatJob(j, savedIds)),
      total,
      page: parseInt(page),
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasNext: start + pageSize < total,
      categories: JOB_CATEGORY_CHOICES.map(v => ({ value: v, label: JOB_CATEGORY_LABELS[v], icon: CATEGORY_ICONS[v] })),
      jobTypes: Object.entries(JOB_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })),
      expChoices: Object.entries(EXPERIENCE_LABELS).map(([v, l]) => ({ value: v, label: l })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/jobs/:id
const getJobDetail = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate({ _id: req.params.id, isActive: true }, { $inc: { views: 1 } }, { new: true }).populate('employer', 'username firstName lastName profilePhoto city');
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    let alreadyApplied = false, isSaved = false;
    if (req.user && req.user.role === 'worker') {
      alreadyApplied = !!(await Application.findOne({ job: job._id, worker: req.user._id }));
      isSaved = !!(await SavedJob.findOne({ user: req.user._id, job: job._id }));
    }

    const relatedJobs = await Job.find({ category: job.category, isActive: true, _id: { $ne: job._id } }).populate('employer', 'username firstName lastName').limit(4);

    res.json({ job: formatJob(job, new Set([isSaved ? job._id.toString() : '']), req.user?._id), alreadyApplied, relatedJobs: relatedJobs.map(j => formatJob(j)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/jobs
const postJob = async (req, res) => {
  try {
    const { title, titleHi, category, jobType, experienceReq, skillsRequired, description, descriptionHi, location, latitude, longitude, salaryMin, salaryMax, openings, deadline } = req.body;
    if (!title || !category || !description || !location) return res.status(400).json({ message: 'Title, category, description and location are required.' });

    const job = await Job.create({
      employer: req.user._id,
      title, titleHi: titleHi || '', category,
      jobType: jobType || 'full_time',
      experienceReq: experienceReq || 'fresher',
      skillsRequired: skillsRequired || '',
      description, descriptionHi: descriptionHi || '',
      location,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      salaryMin: parseFloat(salaryMin) || 0,
      salaryMax: parseFloat(salaryMax) || 0,
      openings: parseInt(openings) || 1,
      deadline: deadline ? new Date(deadline) : null,
    });

    // Notify matching workers
    try {
      const { notify } = require('../utils/helpers');
      const User = require('../models/User');
      const matching = await User.find({ role: 'worker' }).limit(50);
      for (const w of matching) {
        await notify(w._id, 'job', `New ${JOB_CATEGORY_LABELS[category] || category} job: ${title}`,
          `Salary: ₹${salaryMin}–${salaryMax}/mo · ${location}`, `/jobs/${job._id}`);
      }
    } catch (_) {}

    const populated = await Job.findById(job._id).populate('employer', 'username firstName lastName profilePhoto city');
    res.status(201).json({ message: `Job "${title}" posted successfully! 🎉`, job: formatJob(populated) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/jobs/:id
const editJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const fields = ['title','titleHi','category','jobType','experienceReq','skillsRequired','description','descriptionHi','location'];
    fields.forEach(f => { if (req.body[f] !== undefined) job[f] = req.body[f]; });
    if (req.body.salaryMin !== undefined) job.salaryMin = parseFloat(req.body.salaryMin) || 0;
    if (req.body.salaryMax !== undefined) job.salaryMax = parseFloat(req.body.salaryMax) || 0;
    if (req.body.openings !== undefined) job.openings = parseInt(req.body.openings) || 1;
    if (req.body.deadline !== undefined) job.deadline = req.body.deadline ? new Date(req.body.deadline) : null;
    if (req.body.latitude !== undefined) job.latitude = parseFloat(req.body.latitude) || null;
    if (req.body.longitude !== undefined) job.longitude = parseFloat(req.body.longitude) || null;

    await job.save();
    const populated = await Job.findById(job._id).populate('employer', 'username firstName lastName profilePhoto');
    res.json({ message: 'Job updated successfully!', job: formatJob(populated) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/jobs/my-jobs
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 }).populate('employer', 'username firstName lastName profilePhoto');
    const activeCount = jobs.filter(j => j.isActive).length;
    const appCounts = await Promise.all(jobs.map(j => Application.countDocuments({ job: j._id })));
    const totalApps = appCounts.reduce((a, b) => a + b, 0);
    const totalViews = jobs.reduce((a, j) => a + j.views, 0);

    const jobsWithCounts = jobs.map((j, i) => ({ ...formatJob(j), applicationsCount: appCounts[i] }));

    res.json({ jobs: jobsWithCounts, activeCount, totalApps, totalViews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/jobs/:id/applicants
const getApplicants = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const { status } = req.query;
    let query = { job: job._id };
    if (status) query.status = status;

    const apps = await Application.find(query)
      .populate('worker', 'username firstName lastName profilePhoto city phone email')
      .populate({ path: 'worker', populate: { path: 'worker_profile', model: 'WorkerProfile' } })
      .sort({ createdAt: -1 });

    const workerIds = apps.map(a => a.worker._id);
    const workerProfiles = await WorkerProfile.find({ user: { $in: workerIds } });
    const profileMap = {};
    workerProfiles.forEach(p => { profileMap[p.user.toString()] = p; });

    const counts = {
      all: await Application.countDocuments({ job: job._id }),
      pending: await Application.countDocuments({ job: job._id, status: 'pending' }),
      reviewed: await Application.countDocuments({ job: job._id, status: 'reviewed' }),
      shortlisted: await Application.countDocuments({ job: job._id, status: 'shortlisted' }),
      accepted: await Application.countDocuments({ job: job._id, status: 'accepted' }),
      rejected: await Application.countDocuments({ job: job._id, status: 'rejected' }),
    };

    res.json({
      job: formatJob(job),
      applications: apps.map(a => ({
        _id: a._id,
        status: a.status,
        coverNote: a.coverNote,
        resume: a.resume,
        createdAt: a.createdAt,
        worker: {
          _id: a.worker._id,
          username: a.worker.username,
          fullName: `${a.worker.firstName || ''} ${a.worker.lastName || ''}`.trim() || a.worker.username,
          profilePhoto: a.worker.profilePhoto,
          city: a.worker.city,
          phone: a.worker.phone,
          email: a.worker.email,
          workerProfile: profileMap[a.worker._id.toString()] || null,
        },
      })),
      counts,
      statusFilter: status || '',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/jobs/:id/applicants/:appId
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending','reviewed','shortlisted','accepted','rejected'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status.' });

    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const app = await Application.findOneAndUpdate({ _id: req.params.appId, job: job._id }, { status }, { new: true });
    if (!app) return res.status(404).json({ message: 'Application not found.' });

    const { notifyStatusChange } = require('../utils/helpers');
    await notifyStatusChange(app.worker, job, status);

    res.json({ message: 'Application status updated.', application: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/jobs/:id/save
const toggleSaveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const existing = await SavedJob.findOne({ user: req.user._id, job: job._id });
    if (existing) {
      await existing.deleteOne();
      return res.json({ saved: false, message: 'Job removed from saved jobs.' });
    }
    await SavedJob.create({ user: req.user._id, job: job._id });
    res.json({ saved: true, message: 'Job saved successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/jobs/saved
const getSavedJobs = async (req, res) => {
  try {
    const saves = await SavedJob.find({ user: req.user._id })
      .populate({ path: 'job', populate: { path: 'employer', select: 'username firstName lastName profilePhoto city' } })
      .sort({ createdAt: -1 });
    const savedIds = new Set(saves.map(s => s.job?._id?.toString()));
    res.json({ saves: saves.filter(s => s.job).map(s => ({ ...formatJob(s.job, savedIds), savedAt: s.createdAt })) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/jobs/:id/toggle
const toggleJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    job.isActive = !job.isActive;
    await job.save();
    res.json({ message: `Job "${job.isActive ? 'activated' : 'paused'}".`, isActive: job.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employer: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    const title = job.title;
    await job.deleteOne();
    res.json({ message: `Job "${title}" deleted.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 100) / 100;
}
function toRad(d) { return d * Math.PI / 180; }

module.exports = { getJobs, getJobDetail, postJob, editJob, getMyJobs, getApplicants, updateApplicationStatus, toggleSaveJob, getSavedJobs, toggleJob, deleteJob };
