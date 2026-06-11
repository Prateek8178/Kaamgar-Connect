const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getNotifications, markAllRead, getUnreadCount } = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.post('/mark-all-read', protect, markAllRead);
router.get('/unread-count', protect, getUnreadCount);

module.exports = router;
