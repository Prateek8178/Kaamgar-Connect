const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.username}`);

    socket.on('join-room', async (roomId) => {
      try {
        const room = await ChatRoom.findById(roomId);
        if (!room) return;
        const userId = socket.user._id.toString();
        if (room.worker.toString() !== userId && room.employer.toString() !== userId) return;
        socket.join(roomId);
        // Mark messages as read
        await Message.updateMany({ room: roomId, isRead: false, sender: { $ne: socket.user._id } }, { isRead: true });
      } catch (err) {
        console.error('join-room error:', err.message);
      }
    });

    socket.on('send-message', async ({ roomId, text }) => {
      try {
        if (!text || !text.trim()) return;
        const room = await ChatRoom.findById(roomId);
        if (!room) return;
        const userId = socket.user._id.toString();
        if (room.worker.toString() !== userId && room.employer.toString() !== userId) return;

        const msg = await Message.create({ room: roomId, sender: socket.user._id, text: text.trim() });

        const populatedMsg = await Message.findById(msg._id).populate('sender', 'firstName lastName username profilePhoto');

        io.to(roomId).emit('new-message', {
          id: populatedMsg._id,
          text: populatedMsg.text,
          senderId: populatedMsg.sender._id,
          senderName: populatedMsg.sender.firstName || populatedMsg.sender.username,
          initial: (populatedMsg.sender.firstName?.[0] || populatedMsg.sender.username?.[0] || 'U').toUpperCase(),
          time: populatedMsg.createdAt.toISOString(),
          isRead: false,
        });
      } catch (err) {
        console.error('send-message error:', err.message);
      }
    });

    socket.on('typing', ({ roomId }) => {
      socket.to(roomId).emit('user-typing', { userId: socket.user._id, username: socket.user.username });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.username}`);
    });
  });
};

module.exports = { initSocket };
