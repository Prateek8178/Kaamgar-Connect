const mongoose = require('mongoose');

const NOTIFICATION_TYPES = ['application', 'status', 'message', 'review', 'job'];

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ntype: { type: String, enum: NOTIFICATION_TYPES, required: true },
  title: { type: String, required: true, maxlength: 200 },
  body: { type: String, default: '' },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
