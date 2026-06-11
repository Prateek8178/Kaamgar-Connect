const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');
const { notifyNewMessage } = require('../utils/helpers');

const formatRoom = (room, currentUserId) => {
  const isWorker = room.worker?._id?.toString() === currentUserId.toString();
  const other = isWorker ? room.employer : room.worker;
  return {
    _id: room._id,
    otherUser: other ? {
      _id: other._id,
      username: other.username,
      fullName: `${other.firstName || ''} ${other.lastName || ''}`.trim() || other.username,
      profilePhoto: other.profilePhoto,
      role: other.role,
      city: other.city,
    } : null,
    lastMessage: room.lastMessage,
    unreadCount: room.unreadCount || 0,
    createdAt: room.createdAt,
  };
};

// @route GET /api/chat/inbox
const getInbox = async (req, res) => {
  try {
    const user = req.user;
    const query = user.role === 'worker' ? { worker: user._id } : { employer: user._id };
    const rooms = await ChatRoom.find(query)
      .populate('worker', 'username firstName lastName profilePhoto city role')
      .populate('employer', 'username firstName lastName profilePhoto city role')
      .sort({ updatedAt: -1 });

    const roomsWithLastMsg = await Promise.all(rooms.map(async (room) => {
      const lastMsg = await Message.findOne({ room: room._id }).sort({ createdAt: -1 });
      const unreadCount = await Message.countDocuments({ room: room._id, isRead: false, sender: { $ne: user._id } });
      return { ...room.toObject(), lastMessage: lastMsg, unreadCount };
    }));

    res.json({ rooms: roomsWithLastMsg.map(r => formatRoom(r, user._id)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/chat/room/:id
const getRoom = async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.id)
      .populate('worker', 'username firstName lastName profilePhoto city role')
      .populate('employer', 'username firstName lastName profilePhoto city role');
    if (!room) return res.status(404).json({ message: 'Chat room not found.' });

    const userId = req.user._id.toString();
    if (room.worker._id.toString() !== userId && room.employer._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Mark messages as read
    await Message.updateMany({ room: room._id, isRead: false, sender: { $ne: req.user._id } }, { isRead: true });

    const messages = await Message.find({ room: room._id })
      .populate('sender', 'username firstName lastName profilePhoto')
      .sort({ createdAt: 1 });

    const isWorker = room.worker._id.toString() === userId;
    const otherUser = isWorker ? room.employer : room.worker;

    // Get all rooms for sidebar
    const allRoomsQuery = req.user.role === 'worker' ? { worker: req.user._id } : { employer: req.user._id };
    const allRooms = await ChatRoom.find(allRoomsQuery)
      .populate('worker', 'username firstName lastName profilePhoto city role')
      .populate('employer', 'username firstName lastName profilePhoto city role')
      .sort({ updatedAt: -1 });

    const allRoomsWithMeta = await Promise.all(allRooms.map(async (r) => {
      const lastMsg = await Message.findOne({ room: r._id }).sort({ createdAt: -1 });
      const unreadCount = await Message.countDocuments({ room: r._id, isRead: false, sender: { $ne: req.user._id } });
      return { ...r.toObject(), lastMessage: lastMsg, unreadCount };
    }));

    res.json({
      room: { _id: room._id, worker: room.worker, employer: room.employer },
      otherUser,
      messages: messages.map(m => ({
        _id: m._id,
        text: m.text,
        mine: m.sender._id.toString() === userId,
        senderId: m.sender._id,
        initial: (m.sender.firstName?.[0] || m.sender.username?.[0] || 'U').toUpperCase(),
        time: m.createdAt,
        isRead: m.isRead,
      })),
      allRooms: allRoomsWithMeta.map(r => formatRoom(r, req.user._id)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/chat/room/:id/send
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Message text required.' });

    const room = await ChatRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    const userId = req.user._id.toString();
    if (room.worker.toString() !== userId && room.employer.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const msg = await Message.create({ room: room._id, sender: req.user._id, text: text.trim() });
    const otherId = room.worker.toString() === userId ? room.employer : room.worker;
    await notifyNewMessage(otherId, req.user);

    res.json({ status: 'ok', message: { _id: msg._id, text: msg.text, time: msg.createdAt } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/chat/poll/:id
const pollMessages = async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    const userId = req.user._id.toString();
    if (room.worker.toString() !== userId && room.employer.toString() !== userId) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const afterId = req.query.after;
    let query = { room: room._id };
    if (afterId) query._id = { $gt: afterId };

    const msgs = await Message.find(query)
      .populate('sender', 'firstName username profilePhoto')
      .sort({ createdAt: 1 });

    await Message.updateMany({ room: room._id, isRead: false, sender: { $ne: req.user._id } }, { isRead: true });

    res.json({
      messages: msgs.map(m => ({
        id: m._id,
        text: m.text,
        mine: m.sender._id.toString() === userId,
        time: m.createdAt,
        initial: (m.sender.firstName?.[0] || m.sender.username?.[0] || 'U').toUpperCase(),
        isRead: m.isRead,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/chat/start/:userId
const startChat = async (req, res) => {
  try {
    const other = await User.findById(req.params.userId);
    if (!other) return res.status(404).json({ message: 'User not found.' });
    if (other._id.toString() === req.user._id.toString()) return res.status(400).json({ message: 'Cannot chat with yourself.' });

    let worker, employer;
    if (req.user.role === 'worker' && other.role === 'employer') { worker = req.user; employer = other; }
    else if (req.user.role === 'employer' && other.role === 'worker') { worker = other; employer = req.user; }
    else return res.status(400).json({ message: 'Cannot start a chat between two users of the same role.' });

    const room = await ChatRoom.findOneAndUpdate(
      { worker: worker._id, employer: employer._id },
      { worker: worker._id, employer: employer._id },
      { upsert: true, new: true }
    );

    res.json({ roomId: room._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getInbox, getRoom, sendMessage, pollMessages, startChat };
