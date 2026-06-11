const mongoose = require('mongoose');

const reviewReplySchema = new mongoose.Schema({
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ReviewReply', reviewReplySchema);
