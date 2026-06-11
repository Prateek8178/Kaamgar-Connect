const mongoose = require('mongoose');

const JOB_CATEGORY_CHOICES = ['construction','electrical','plumbing','carpentry','painting','driving','cooking','cleaning','security','welding','ac_tech','tailoring','other'];
const JOB_TYPE_CHOICES = ['full_time','part_time','contract','daily','internship'];
const EXPERIENCE_CHOICES = ['fresher','1_2','3_5','5_plus','10_plus'];

const jobSchema = new mongoose.Schema({
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 200 },
  titleHi: { type: String, default: '' },
  category: { type: String, enum: JOB_CATEGORY_CHOICES, required: true },
  jobType: { type: String, enum: JOB_TYPE_CHOICES, default: 'full_time' },
  experienceReq: { type: String, enum: EXPERIENCE_CHOICES, default: 'fresher' },
  skillsRequired: { type: String, default: '' },
  description: { type: String, required: true },
  descriptionHi: { type: String, default: '' },
  location: { type: String, required: true },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  salaryMin: { type: Number, default: 0 },
  salaryMax: { type: Number, default: 0 },
  openings: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  deadline: { type: Date, default: null },
}, { timestamps: true });

jobSchema.index({ isActive: 1, isFeatured: -1, createdAt: -1 });

jobSchema.methods.skillsList = function() {
  return this.skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
};

jobSchema.methods.categoryIcon = function() {
  const icons = { construction:'🏗️', electrical:'⚡', plumbing:'🔧', carpentry:'🪚', painting:'🎨', driving:'🚗', cooking:'👨🍳', cleaning:'🧹', security:'🛡️', welding:'⚒️', ac_tech:'❄️', tailoring:'🧵', other:'💼' };
  return icons[this.category] || '💼';
};

jobSchema.methods.distanceTo = function(otherLat, otherLon) {
  if (!this.latitude || !this.longitude) return null;
  const R = 6371;
  const dLat = toRad(otherLat - this.latitude);
  const dLon = toRad(otherLon - this.longitude);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(this.latitude)) * Math.cos(toRad(otherLat)) * Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 100) / 100;
};

function toRad(deg) { return deg * (Math.PI / 180); }

jobSchema.statics.JOB_CATEGORY_CHOICES = JOB_CATEGORY_CHOICES;
jobSchema.statics.JOB_TYPE_CHOICES = JOB_TYPE_CHOICES;
jobSchema.statics.EXPERIENCE_CHOICES = EXPERIENCE_CHOICES;

const JOB_CATEGORY_LABELS = { construction:'Construction', electrical:'Electrical', plumbing:'Plumbing', carpentry:'Carpentry', painting:'Painting', driving:'Driving', cooking:'Cooking', cleaning:'Cleaning', security:'Security', welding:'Welding', ac_tech:'AC Technician', tailoring:'Tailoring', other:'Other' };
const JOB_TYPE_LABELS = { full_time:'Full Time', part_time:'Part Time', contract:'Contract', daily:'Daily Wage', internship:'Internship' };
const EXPERIENCE_LABELS = { fresher:'Fresher (0 yrs)', '1_2':'1–2 Years', '3_5':'3–5 Years', '5_plus':'5+ Years', '10_plus':'10+ Years' };

jobSchema.statics.JOB_CATEGORY_LABELS = JOB_CATEGORY_LABELS;
jobSchema.statics.JOB_TYPE_LABELS = JOB_TYPE_LABELS;
jobSchema.statics.EXPERIENCE_LABELS = EXPERIENCE_LABELS;

module.exports = mongoose.model('Job', jobSchema);
