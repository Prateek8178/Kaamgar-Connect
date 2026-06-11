const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  role: { type: String, enum: ['worker', 'employer', 'admin'], default: 'worker' },
  phone: { type: String, default: '' },
  otp: { type: String, default: '' },
  otpVerified: { type: Boolean, default: false },
  otpCreatedAt: { type: Date, default: null },
  language: { type: String, enum: ['en', 'hi'], default: 'en' },
  profilePhoto: { type: String, default: '' },
  city: { type: String, default: '' },
  bio: { type: String, default: '' },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  isActive: { type: Boolean, default: false },
  isStaff: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim() || this.username;
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateOtp = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpCreatedAt = new Date();
  this.otpVerified = false;
  return otp;
};

userSchema.methods.verifyOtp = function(inputOtp) {
  if (this.otp !== inputOtp) return false;
  if (!this.otpCreatedAt) return false;
  const fiveMinutes = 5 * 60 * 1000;
  if (Date.now() - this.otpCreatedAt.getTime() > fiveMinutes) return false;
  this.otpVerified = true;
  this.otp = '';
  return true;
};

module.exports = mongoose.model('User', userSchema);
