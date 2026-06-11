const Notification = require('../models/Notification');

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 100) / 100;
};

const toRad = (deg) => deg * (Math.PI / 180);

const notify = async (userId, ntype, title, body = '', link = '') => {
  try {
    await Notification.create({ user: userId, ntype, title, body, link });
  } catch (err) {
    console.error('Notify error:', err.message);
  }
};

const notifyNewApplication = async (employerId, worker, job) => {
  await notify(employerId, 'application',
    `New application: ${worker.firstName || worker.username}`,
    `${worker.firstName || worker.username} applied for "${job.title}"`,
    `/jobs/${job._id}/applicants`
  );
};

const notifyStatusChange = async (workerId, job, status) => {
  const msgs = { reviewed: 'under review', shortlisted: 'shortlisted', accepted: 'accepted! 🎉', rejected: 'rejected' };
  await notify(workerId, 'status',
    `Application ${msgs[status] || status}`,
    `Your application for "${job.title}" has been ${msgs[status] || status}.`,
    `/applications`
  );
};

const notifyNewMessage = async (recipientId, sender) => {
  await notify(recipientId, 'message',
    `New message from ${sender.firstName || sender.username}`,
    `${sender.firstName || sender.username} sent you a message.`,
    `/chat`
  );
};

const paginateArray = (array, page = 1, pageSize = 12) => {
  const total = array.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = array.slice(start, end);
  return {
    items,
    total,
    page: parseInt(page),
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasNext: end < total,
    hasPrev: start > 0,
  };
};

module.exports = { haversineDistance, notify, notifyNewApplication, notifyStatusChange, notifyNewMessage, paginateArray };
