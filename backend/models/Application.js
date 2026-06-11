const mongoose = require('mongoose');

const STATUS_CHOICES = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'];

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: STATUS_CHOICES, default: 'pending' },
  coverNote: { type: String, default: '' },
  resume: { type: String, default: '' },
}, { timestamps: true });

applicationSchema.index({ job: 1, worker: 1 }, { unique: true });
applicationSchema.index({ worker: 1, createdAt: -1 });

applicationSchema.methods.statusColor = function() {
  const colors = { pending:'amber', reviewed:'blue', shortlisted:'purple', accepted:'green', rejected:'red' };
  return colors[this.status] || 'gray';
};

module.exports = mongoose.model('Application', applicationSchema);
