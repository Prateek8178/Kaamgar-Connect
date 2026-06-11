const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getDashboard, getAnalytics } = require('../controllers/dashboardController');

router.get('/', protect, getDashboard);
router.get('/analytics', protect, getAnalytics);

module.exports = router;
