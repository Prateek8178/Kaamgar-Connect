const express = require('express');
const router = express.Router();
const { protect, requireStaff } = require('../middlewares/authMiddleware');
const { getAdminDashboard, manageUsers, toggleUser, manageJobs, toggleJobFeatured, verifyWorker } = require('../controllers/adminController');

router.use(protect, requireStaff);

router.get('/dashboard', getAdminDashboard);
router.get('/users', manageUsers);
router.patch('/users/:id/toggle', toggleUser);
router.get('/jobs', manageJobs);
router.patch('/jobs/:id/feature', toggleJobFeatured);
router.patch('/workers/:id/verify', verifyWorker);

module.exports = router;
