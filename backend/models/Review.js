const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '' },
  comment: { type: String, default: '' },
  qualityRating: { type: Number, default: 5, min: 1, max: 5 },
  punctuality: { type: Number, default: 5, min: 1, max: 5 },
  communication: { type: Number, default: 5, min: 1, max: 5 },
  professionalism: { type: Number, default: 5, min: 1, max: 5 },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },
}, { timestamps: true });

reviewSchema.index({ reviewer: 1, reviewee: 1, job: 1 }, { unique: true, sparse: true });
reviewSchema.index({ reviewee: 1, createdAt: -1 });

reviewSchema.virtual('averageRating').get(function () {
  return Math.round((this.qualityRating + this.punctuality + this.communication + this.professionalism) / 4 * 10) / 10;
});

module.exports = mongoose.model('Review', reviewSchema);
