const Notification = require('../models/Notification');

// @route GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
    const notifs = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ notifications: notifs, unread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/notifications/mark-all-read
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNotifications, markAllRead, getUnreadCount };
