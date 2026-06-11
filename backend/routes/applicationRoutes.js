const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { uploadResume } = require('../middlewares/uploadMiddleware');
const { applyForJob, getMyApplications, withdrawApplication, reviewWorker } = require('../controllers/applicationController');

router.get('/', protect, getMyApplications);
router.post('/:jobId', protect, uploadResume, applyForJob);
router.delete('/:id', protect, withdrawApplication);
router.post('/review/:jobId/:workerId', protect, reviewWorker);

module.exports = router;
