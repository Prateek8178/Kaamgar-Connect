const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const Application = require('../models/Application');

const SKILL_CHOICES = [
  { value:'plumber', label:'Plumber' }, { value:'electrician', label:'Electrician' },
  { value:'carpenter', label:'Carpenter' }, { value:'painter', label:'Painter' },
  { value:'driver', label:'Driver' }, { value:'cook', label:'Cook' },
  { value:'security', label:'Security Guard' }, { value:'cleaner', label:'Cleaner' },
  { value:'mason', label:'Mason' }, { value:'welder', label:'Welder' },
  { value:'ac_technician', label:'AC Technician' }, { value:'tailor', label:'Tailor' },
  { value:'other', label:'Other' },
];

const formatWorker = (user, wp) => ({
  _id: user._id,
  username: user.username,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
  profilePhoto: user.profilePhoto,
  city: user.city,
  bio: user.bio,
  phone: user.phone,
  email: user.email,
  createdAt: user.createdAt,
  workerProfile: wp ? {
    _id: wp._id,
    skills: wp.skills,
    skillsLabel: SKILL_CHOICES.find(s => s.value === wp.skills)?.label || wp.skills,
    extraSkills: wp.extraSkills,
    extraSkillsList: wp.extraSkills ? wp.extraSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
    experienceYears: wp.experienceYears,
    dailyRate: wp.dailyRate,
    availability: wp.availability,
    rating: wp.rating,
    totalJobs: wp.totalJobs,
    address: wp.address,
    latitude: wp.latitude,
    longitude: wp.longitude,
    workingRadiusKm: wp.workingRadiusKm,
    resume: wp.resume,
    aadharVerified: wp.aadharVerified,
    portfolioUrl: wp.portfolioUrl,
    languages: wp.languages,
  } : null,
});

// @route GET /api/workers
const getWorkers = async (req, res) => {
  try {
    const { skills, search, available, min_rate, max_rate, min_exp } = req.query;

    let userQuery = { role: 'worker' };
    if (search) {
      userQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(userQuery).select('-password');

    let wpQuery = { user: { $in: users.map(u => u._id) } };
    if (skills) wpQuery.skills = skills;
    if (available === '1') wpQuery.availability = true;
    if (min_rate) wpQuery.dailyRate = { ...wpQuery.dailyRate, $gte: parseFloat(min_rate) };
    if (max_rate) wpQuery.dailyRate = { ...wpQuery.dailyRate, $lte: parseFloat(max_rate) };
    if (min_exp) wpQuery.experienceYears = { $gte: parseInt(min_exp) };

    const profiles = await WorkerProfile.find(wpQuery).sort({ aadharVerified: -1, rating: -1 });
    const profileMap = {};
    profiles.forEach(p => { profileMap[p.user.toString()] = p; });

    const validUserIds = new Set(profiles.map(p => p.user.toString()));
    const filteredUsers = users.filter(u => validUserIds.has(u._id.toString()));

    const workers = filteredUsers.map(u => formatWorker(u, profileMap[u._id.toString()]));

    res.json({ workers, skillChoices: SKILL_CHOICES, filters: { skills, search, available, min_rate, max_rate, min_exp } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/workers/:id
const getWorkerDetail = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'worker' }).select('-password');
    if (!user) return res.status(404).json({ message: 'Worker not found.' });

    const wp = await WorkerProfile.findOneAndUpdate({ user: user._id }, { user: user._id }, { upsert: true, new: true });

    const reviews = await Application.find({ worker: user._id, status: 'accepted' })
      .populate('job', 'title category')
      .populate({ path: 'worker', select: 'username firstName lastName' })
      .sort({ createdAt: -1 });

    const Review = require('../models/Review');
    const workerReviews = await Review.find({ reviewee: user._id })
      .populate('reviewer', 'username firstName lastName profilePhoto city')
      .sort({ createdAt: -1 });

    const workerDetails = [
      { icon: 'person-fill-gear', label: 'Primary Skill', value: SKILL_CHOICES.find(s => s.value === wp.skills)?.label || wp.skills },
      { icon: 'calendar3', label: 'Experience', value: `${wp.experienceYears} years` },
      { icon: 'currency-rupee', label: 'Daily Rate', value: `₹${wp.dailyRate}/day` },
      { icon: 'check2-circle', label: 'Jobs Done', value: String(wp.totalJobs) },
      { icon: 'star-fill', label: 'Rating', value: `${wp.rating}/5.0` },
      { icon: 'translate', label: 'Languages', value: wp.languages || 'Hindi, English' },
      { icon: 'patch-check', label: 'ID Verified', value: wp.aadharVerified ? '✓ Verified' : 'Pending' },
      { icon: 'circle', label: 'Availability', value: wp.availability ? 'Available' : 'Unavailable' },
    ];

    res.json({ worker: formatWorker(user, wp), workerDetails, reviews: workerReviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getWorkers, getWorkerDetail, SKILL_CHOICES };
