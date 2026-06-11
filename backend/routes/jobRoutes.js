const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middlewares/authMiddleware');
const { uploadResume } = require('../middlewares/uploadMiddleware');
const {
  getJobs, getJobDetail, postJob, editJob, getMyJobs,
  getApplicants, updateApplicationStatus, toggleSaveJob,
  getSavedJobs, toggleJob, deleteJob
} = require('../controllers/jobController');

// Public
router.get('/', getJobs);
router.get('/saved', protect, getSavedJobs);
router.get('/my-jobs', protect, requireRole('employer'), getMyJobs);
router.get('/:id', getJobDetail);
router.get('/:id/applicants', protect, requireRole('employer'), getApplicants);

// Protected
router.post('/', protect, requireRole('employer'), postJob);
router.put('/:id', protect, requireRole('employer'), editJob);
router.delete('/:id', protect, requireRole('employer'), deleteJob);
router.patch('/:id/toggle', protect, requireRole('employer'), toggleJob);
router.post('/:id/save', protect, toggleSaveJob);
router.patch('/:id/applicants/:appId', protect, requireRole('employer'), updateApplicationStatus);

module.exports = router;
