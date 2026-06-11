const Application = require('../models/Application');
const Job = require('../models/Job');
const WorkerProfile = require('../models/WorkerProfile');
const Review = require('../models/Review');
const { notifyNewApplication } = require('../utils/helpers');

// @route POST /api/applications/:jobId
const applyForJob = async (req, res) => {
  try {
    if (req.user.role !== 'worker') return res.status(403).json({ message: 'Only workers can apply.' });

    const job = await Job.findOne({ _id: req.params.jobId, isActive: true });
    if (!job) return res.status(404).json({ message: 'Job not found or no longer active.' });

    const existing = await Application.findOne({ job: job._id, worker: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already applied to this job.' });

    const app = await Application.create({
      job: job._id,
      worker: req.user._id,
      coverNote: req.body.coverNote?.trim() || '',
      resume: req.file ? `/uploads/resumes/${req.file.filename}` : '',
    });

    await notifyNewApplication(job.employer, req.user, job);

    res.status(201).json({ message: `✅ Applied to "${job.title}" successfully!`, application: app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/applications
const getMyApplications = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { worker: req.user._id };
    if (status) query.status = status;

    const apps = await Application.find(query)
      .populate({ path: 'job', populate: { path: 'employer', select: 'username firstName lastName profilePhoto city' } })
      .sort({ createdAt: -1 });

    const allApps = await Application.find({ worker: req.user._id });
    const counts = {
      all: allApps.length,
      pending: allApps.filter(a => a.status === 'pending').length,
      reviewed: allApps.filter(a => a.status === 'reviewed').length,
      shortlisted: allApps.filter(a => a.status === 'shortlisted').length,
      accepted: allApps.filter(a => a.status === 'accepted').length,
      rejected: allApps.filter(a => a.status === 'rejected').length,
    };

    const statusColors = { pending:'amber', reviewed:'blue', shortlisted:'purple', accepted:'green', rejected:'red' };

    res.json({
      applications: apps.map(a => ({
        _id: a._id,
        status: a.status,
        statusColor: statusColors[a.status] || 'gray',
        coverNote: a.coverNote,
        resume: a.resume,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        job: a.job ? {
          _id: a.job._id,
          title: a.job.title,
          location: a.job.location,
          category: a.job.category,
          jobType: a.job.jobType,
          salaryMin: a.job.salaryMin,
          salaryMax: a.job.salaryMax,
          employer: a.job.employer,
        } : null,
      })),
      counts,
      statusFilter: status || '',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/applications/:id
const withdrawApplication = async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, worker: req.user._id });
    if (!app) return res.status(404).json({ message: 'Application not found.' });

    if (app.status !== 'pending') return res.status(400).json({ message: 'Cannot withdraw after it has been reviewed.' });

    await app.deleteOne();
    res.json({ message: 'Application withdrawn.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/applications/review/:jobId/:workerId
const reviewWorker = async (req, res) => {
  try {
    if (req.user.role !== 'employer') return res.status(403).json({ message: 'Only employers can review workers.' });

    const { jobId, workerId } = req.params;
    const { rating, review } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    await Review.create({
      reviewer: req.user._id,
      reviewee: workerId,
      job: jobId,
      rating: parseInt(rating),
      comment: review || '',
    });

    // Update worker profile rating
    const allReviews = await Review.find({ reviewee: workerId });
    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await WorkerProfile.findOneAndUpdate(
        { user: workerId },
        { rating: Math.round(avgRating * 10) / 10, totalJobs: allReviews.length }
      );
    }

    res.json({ message: '⭐ Review submitted successfully' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You have already reviewed this worker for this job.' });
    res.status(500).json({ message: err.message });
  }
};

module.exports = { applyForJob, getMyApplications, withdrawApplication, reviewWorker };
