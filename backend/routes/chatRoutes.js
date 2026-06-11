const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getInbox, getRoom, sendMessage, pollMessages, startChat } = require('../controllers/chatController');

router.get('/inbox', protect, getInbox);
router.get('/room/:id', protect, getRoom);
router.post('/room/:id/send', protect, sendMessage);
router.get('/poll/:id', protect, pollMessages);
router.post('/start/:userId', protect, startChat);

module.exports = router;
