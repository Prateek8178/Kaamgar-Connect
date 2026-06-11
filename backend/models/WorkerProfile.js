const mongoose = require('mongoose');

const SKILL_CHOICES = ['plumber','electrician','carpenter','painter','driver','cook','security','cleaner','mason','welder','ac_technician','tailor','other'];

const workerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skills: { type: String, enum: SKILL_CHOICES, default: 'other' },
  extraSkills: { type: String, default: '' },
  experienceYears: { type: Number, default: 0 },
  dailyRate: { type: Number, default: 0 },
  availability: { type: Boolean, default: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalJobs: { type: Number, default: 0 },
  address: { type: String, default: '' },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  workingRadiusKm: { type: Number, default: 10 },
  resume: { type: String, default: '' },
  aadharVerified: { type: Boolean, default: false },
  portfolioUrl: { type: String, default: '' },
  languages: { type: String, default: 'Hindi, English' },
}, { timestamps: true });

workerProfileSchema.methods.completionPct = function(user) {
  const checks = [
    Boolean(user.firstName),
    Boolean(user.phone),
    Boolean(user.bio),
    Boolean(user.profilePhoto),
    Boolean(this.dailyRate),
    Boolean(this.experienceYears),
    Boolean(this.address),
    Boolean(this.resume),
    Boolean(this.aadharVerified),
    Boolean(this.extraSkills),
  ];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
};

workerProfileSchema.methods.distanceTo = function(otherLat, otherLon) {
  if (!this.latitude || !this.longitude || !otherLat || !otherLon) return null;
  const R = 6371;
  const dLat = toRad(otherLat - this.latitude);
  const dLon = toRad(otherLon - this.longitude);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(this.latitude)) * Math.cos(toRad(otherLat)) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 100) / 100;
};

function toRad(deg) { return deg * (Math.PI / 180); }

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);
