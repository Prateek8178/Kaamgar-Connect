const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { uploadProfilePhoto, uploadResume } = require('../middlewares/uploadMiddleware');
const { register, verifyOtp, resendOtp, login, getMe, updateProfile, changePassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadProfilePhoto, updateProfile);
router.put('/profile/resume', protect, uploadResume, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
