const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const Application = require('../models/Application');
const Review = require('../models/Review');

const SKILL_CHOICES = [
  { value:'plumber',      label:'Plumber' },
  { value:'electrician',  label:'Electrician' },
  { value:'carpenter',    label:'Carpenter' },
  { value:'painter',      label:'Painter' },
  { value:'driver',       label:'Driver' },
  { value:'cook',         label:'Cook' },
  { value:'security',     label:'Security Guard' },
  { value:'cleaner',      label:'Cleaner' },
  { value:'mason',        label:'Mason' },
  { value:'welder',       label:'Welder' },
  { value:'ac_technician',label:'AC Technician' },
  { value:'tailor',       label:'Tailor' },
  { value:'other',        label:'Other' },
];

const getSkillLabel = (val) => SKILL_CHOICES.find(s => s.value === val)?.label || val;

const formatWorker = (user, wp) => ({
  _id:          user._id,
  username:     user.username,
  firstName:    user.firstName,
  lastName:     user.lastName,
  fullName:     `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
  profilePhoto: user.profilePhoto,
  city:         user.city,
  bio:          user.bio,
  phone:        user.phone,
  email:        user.email,
  createdAt:    user.createdAt,
  workerProfile: wp ? {
    _id:             wp._id,
    skills:          Array.isArray(wp.skills) ? wp.skills : [wp.skills].filter(Boolean),
    skillsLabels:    (Array.isArray(wp.skills) ? wp.skills : [wp.skills]).map(getSkillLabel),
    extraSkills:     wp.extraSkills,
    extraSkillsList: wp.extraSkills ? wp.extraSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
    experienceYears: wp.experienceYears,
    dailyRate:       wp.dailyRate,
    availability:    wp.availability,
    rating:          wp.rating,
    totalJobs:       wp.totalJobs,
    address:         wp.address,
    latitude:        wp.latitude,
    longitude:       wp.longitude,
    workingRadiusKm: wp.workingRadiusKm,
    resume:          wp.resume,
    aadharVerified:  wp.aadharVerified,
    portfolioUrl:    wp.portfolioUrl,
    languages:       wp.languages,
  } : null,
});

// @route GET /api/workers
const getWorkers = async (req, res) => {
  try {
    const { skills, search, available, min_rate, max_rate, min_exp, page = 1 } = req.query;

    let userQuery = { role: 'worker', isActive: true };
    if (search) {
      userQuery.$or = [
        { firstName:  { $regex: search, $options: 'i' } },
        { lastName:   { $regex: search, $options: 'i' } },
        { city:       { $regex: search, $options: 'i' } },
        { username:   { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(userQuery).select('-password');

    let wpQuery = { user: { $in: users.map(u => u._id) } };
    if (skills)     wpQuery.skills    = skills; // matches if array contains this value
    if (available === '1') wpQuery.availability = true;
    if (min_rate)   wpQuery.dailyRate       = { ...wpQuery.dailyRate,       $gte: parseFloat(min_rate) };
    if (max_rate)   wpQuery.dailyRate       = { ...wpQuery.dailyRate,       $lte: parseFloat(max_rate) };
    if (min_exp)    wpQuery.experienceYears = { $gte: parseInt(min_exp) };

    const profiles = await WorkerProfile.find(wpQuery).sort({ aadharVerified: -1, rating: -1 });
    const profileMap = {};
    profiles.forEach(p => { profileMap[p.user.toString()] = p; });

    // Only show workers who have a profile (or if no filters, include all workers)
    const hasFilters = skills || available || min_rate || max_rate || min_exp;
    let filteredUsers;
    if (hasFilters) {
      const validUserIds = new Set(profiles.map(p => p.user.toString()));
      filteredUsers = users.filter(u => validUserIds.has(u._id.toString()));
    } else {
      filteredUsers = users;
    }

    // Ensure every worker has a profile (upsert if missing)
    const workers = filteredUsers.map(u => {
      const wp = profileMap[u._id.toString()] || null;
      return formatWorker(u, wp);
    });

    // Pagination
    const pageSize = 12;
    const total = workers.length;
    const start = (parseInt(page) - 1) * pageSize;
    const pageWorkers = workers.slice(start, start + pageSize);

    res.json({
      workers: pageWorkers,
      total,
      page: parseInt(page),
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasNext: start + pageSize < total,
      skillChoices: SKILL_CHOICES,
      filters: { skills, search, available, min_rate, max_rate, min_exp },
    });
  } catch (err) {
    console.error('getWorkers error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/workers/:id
const getWorkerDetail = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'worker' }).select('-password');
    if (!user) return res.status(404).json({ message: 'Worker not found.' });

    // Upsert worker profile — never null
    const wp = await WorkerProfile.findOneAndUpdate(
      { user: user._id },
      { $setOnInsert: { user: user._id } },
      { upsert: true, new: true }
    );

    const workerReviews = await Review.find({ reviewee: user._id })
      .populate('reviewer', 'username firstName lastName profilePhoto city')
      .sort({ createdAt: -1 });

    const workerDetails = [
      { icon: 'person-fill-gear', label: 'Primary Skill',  value: (Array.isArray(wp.skills) ? wp.skills : [wp.skills]).map(getSkillLabel).join(', ') || '—' },
      { icon: 'calendar3',        label: 'Experience',     value: `${wp.experienceYears || 0} years` },
      { icon: 'currency-rupee',   label: 'Daily Rate',     value: wp.dailyRate ? `₹${wp.dailyRate}/day` : 'Not set' },
      { icon: 'check2-circle',    label: 'Jobs Done',      value: String(wp.totalJobs || 0) },
      { icon: 'star-fill',        label: 'Rating',         value: `${wp.rating || 0}/5.0` },
      { icon: 'translate',        label: 'Languages',      value: wp.languages || 'Hindi, English' },
      { icon: 'patch-check',      label: 'ID Verified',    value: wp.aadharVerified ? '✓ Verified' : 'Pending' },
      { icon: 'circle',           label: 'Availability',   value: wp.availability ? '✅ Available' : '❌ Unavailable' },
    ];

    res.json({ worker: formatWorker(user, wp), workerDetails, reviews: workerReviews });
  } catch (err) {
    console.error('getWorkerDetail error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getWorkers, getWorkerDetail, SKILL_CHOICES };
