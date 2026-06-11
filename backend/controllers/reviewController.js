const Review = require('../models/Review');
const ReviewReply = require('../models/ReviewReply');
const WorkerProfile = require('../models/WorkerProfile');

// @route POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { revieweeId, jobId, rating, title, comment, qualityRating, punctuality, communication, professionalism } = req.body;
    const review = await Review.create({
      reviewer: req.user._id, reviewee: revieweeId, job: jobId || null,
      rating: parseInt(rating), title: title || '', comment: comment || '',
      qualityRating: parseInt(qualityRating) || 5,
      punctuality: parseInt(punctuality) || 5,
      communication: parseInt(communication) || 5,
      professionalism: parseInt(professionalism) || 5,
    });

    // Update worker rating
    const allReviews = await Review.find({ reviewee: revieweeId });
    if (allReviews.length > 0) {
      const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
      await WorkerProfile.findOneAndUpdate({ user: revieweeId }, { rating: Math.round(avg * 10) / 10, totalJobs: allReviews.length });
    }

    res.status(201).json({ message: 'Review submitted.', review });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You have already reviewed this user.' });
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/reviews/user/:userId
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'username firstName lastName profilePhoto city')
      .populate('job', 'title')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReview, getUserReviews };
