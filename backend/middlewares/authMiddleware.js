const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) return res.status(401).json({ message: 'User not found' });
      if (!req.user.isActive) return res.status(401).json({ message: 'Account is not active. Please verify your email.' });
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}` });
  }
  next();
};

const requireStaff = (req, res, next) => {
  if (!req.user.isStaff && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

module.exports = { protect, requireRole, requireStaff, generateToken };
