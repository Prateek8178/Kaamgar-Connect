const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

chatRoomSchema.index({ worker: 1, employer: 1 }, { unique: true });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
