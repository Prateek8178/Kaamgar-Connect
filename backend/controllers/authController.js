const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const { generateToken } = require('../middlewares/authMiddleware');
const { sendOtpEmail, sendPasswordResetEmail } = require('../services/emailService');

// @desc   Register new user
// @route  POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Username, email and password are required.' });

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });

    if (await User.findOne({ username })) return res.status(400).json({ message: 'Username already exists.' });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered.' });

    const user = await User.create({ username, email, password, role: role || 'worker', isActive: false });
    const otp = user.generateOtp();
    await user.save();

    console.log(`✅ User registered: ${username} (${email}) [${user.role}]`);

    // OTP email bhejo — fail hone par bhi registration continue karo
    let emailSent = false;
    try {
      emailSent = await sendOtpEmail(user, otp, 'register');
    } catch (emailErr) {
      console.error('⚠️  OTP email service error:', emailErr.message);
    }

    if (!emailSent) {
      console.warn(`⚠️  OTP email failed for ${user.email} — OTP: ${otp} (check console)`);
    }

    res.status(201).json({
      message: 'Registration started. Please verify your OTP.',
      pendingUserId: user._id,
      email: user.email,
      emailSent, // frontend ko bata sako agar email nahi gayi
    });
  } catch (err) {
    console.error('❌ Register error:', err.name, '|', err.message);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `${field === 'email' ? 'Email' : 'Username'} already exists.` });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc   Verify OTP
// @route  POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId).select('+password +otp +otpCreatedAt +otpVerified');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!user.verifyOtp(otp)) return res.status(400).json({ message: 'Invalid or expired OTP.' });

    if (!user.isActive) { user.isActive = true; }
    await user.save();

    // Create worker profile if worker — wrapped in try-catch so it doesn't block login
    if (user.role === 'worker') {
      try {
        await WorkerProfile.findOneAndUpdate({ user: user._id }, { user: user._id }, { upsert: true, new: true });
      } catch (profileErr) {
        console.error('⚠️  WorkerProfile creation error (non-fatal):', profileErr.message);
      }
    }

    const token = generateToken(user._id, user.role);
    res.json({
      message: `Welcome ${user.username}! Email verified successfully.`,
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// @desc   Resend OTP
// @route  POST /api/auth/resend-otp
const resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).select('+otp +otpCreatedAt +otpVerified');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const otp = user.generateOtp();
    await user.save();
    await sendOtpEmail(user, otp, 'resend');

    res.json({ message: 'New OTP sent successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Login
// @route  POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required.' });

    const user = await User.findOne({ username }).select('+password +otp +otpCreatedAt +otpVerified');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    if (!user.otpVerified) {
      const otp = user.generateOtp();
      await user.save();
      await sendOtpEmail(user, otp, 'login');
      return res.status(200).json({
        requiresOtp: true,
        pendingUserId: user._id,
        email: user.email,
        message: 'OTP sent to your email. Please verify.',
      });
    }

    if (!user.isActive) return res.status(403).json({ message: 'Your account has been deactivated.' });

    const token = generateToken(user._id, user.role);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get current user
// @route  GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let workerProfile = null;
    if (user.role === 'worker') {
      workerProfile = await WorkerProfile.findOne({ user: user._id });
    }
    res.json({ user: sanitizeUser(user), workerProfile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Update profile
// @route  PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { firstName, lastName, phone, city, bio, language, latitude, longitude } = req.body;

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (bio !== undefined) user.bio = bio;
    if (language !== undefined) user.language = language;
    if (latitude !== undefined) user.latitude = parseFloat(latitude) || null;
    if (longitude !== undefined) user.longitude = parseFloat(longitude) || null;

    if (req.file) {
      user.profilePhoto = `/uploads/profiles/${req.file.filename}`;
    }

    await user.save();

    // Update worker profile if applicable
    if (user.role === 'worker') {
      const { skills, extraSkills, experienceYears, dailyRate, availability, address, workingRadiusKm, portfolioUrl, languages, aadharVerified } = req.body;
      const update = {};
      if (skills !== undefined) update.skills = skills;
      if (extraSkills !== undefined) update.extraSkills = extraSkills;
      if (experienceYears !== undefined) update.experienceYears = parseInt(experienceYears) || 0;
      if (dailyRate !== undefined) update.dailyRate = parseFloat(dailyRate) || 0;
      if (availability !== undefined) update.availability = availability === 'true' || availability === true;
      if (address !== undefined) update.address = address;
      if (workingRadiusKm !== undefined) update.workingRadiusKm = parseInt(workingRadiusKm) || 10;
      if (portfolioUrl !== undefined) update.portfolioUrl = portfolioUrl;
      if (languages !== undefined) update.languages = languages;
      if (aadharVerified !== undefined) update.aadharVerified = aadharVerified === 'true' || aadharVerified === true;
      if (latitude !== undefined) update.latitude = parseFloat(latitude) || null;
      if (longitude !== undefined) update.longitude = parseFloat(longitude) || null;
      if (req.file && req.file.fieldname === 'resume') update.resume = `/uploads/resumes/${req.file.filename}`;

      await WorkerProfile.findOneAndUpdate({ user: user._id }, update, { upsert: true, new: true });
    }

    const updatedUser = await User.findById(user._id);
    const workerProfile = user.role === 'worker' ? await WorkerProfile.findOne({ user: user._id }) : null;

    res.json({ message: 'Profile updated successfully.', user: sanitizeUser(updatedUser), workerProfile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// @desc   Change password
// @route  PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters.' });

    const user = await User.findById(req.user._id).select('+password');
    if (currentPassword) {
      const match = await user.matchPassword(currentPassword);
      if (!match) return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id, user.role);
    res.json({ message: 'Password changed successfully.', token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
  role: user.role,
  phone: user.phone,
  city: user.city,
  bio: user.bio,
  language: user.language,
  profilePhoto: user.profilePhoto,
  latitude: user.latitude,
  longitude: user.longitude,
  isActive: user.isActive,
  isStaff: user.isStaff,
  otpVerified: user.otpVerified,
  createdAt: user.createdAt,
});

// @desc   Forgot Password — email se OTP bhejo
// @route  POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+otp +otpCreatedAt +otpVerified');
    // Security: always return success even if user not found
    if (!user) {
      return res.json({ message: 'If this email is registered, you will receive an OTP shortly.', pendingUserId: null });
    }

    const otp = user.generateOtp();
    await user.save();

    let emailSent = false;
    try {
      emailSent = await sendPasswordResetEmail(user, otp);
    } catch (e) {
      console.error('Password reset email error:', e.message);
    }

    if (!emailSent) {
      console.warn(`⚠️  Password Reset OTP for ${user.email}: ${otp}`);
    }

    res.json({
      message: 'OTP sent to your email. Please check your inbox.',
      pendingUserId: user._id,
      email: user.email,
      emailSent,
    });
  } catch (err) {
    console.error('forgotPassword error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc   Reset Password — OTP verify karke naaya password set karo
// @route  POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    if (!userId || !otp || !newPassword) {
      return res.status(400).json({ message: 'User ID, OTP and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findById(userId).select('+password +otp +otpCreatedAt +otpVerified');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!user.verifyOtp(otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
    }

    user.password = newPassword;
    if (!user.isActive) user.isActive = true;
    await user.save();

    const token = generateToken(user._id, user.role);
    res.json({
      message: 'Password reset successfully! You are now logged in.',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('resetPassword error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = { register, verifyOtp, resendOtp, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword };
