require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/chatSocket');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Trust proxy (fixes express-rate-limit X-Forwarded-For warning)
app.set('trust proxy', 1);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
initSocket(io);

// ──── MIDDLEWARE ────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Auth-specific stricter limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ──── ROUTES ─────────────────────────────────────────
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/jobs',          require('./routes/jobRoutes'));
app.use('/api/workers',       require('./routes/workerRoutes'));
app.use('/api/applications',  require('./routes/applicationRoutes'));
app.use('/api/chat',          require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard',     require('./routes/dashboardRoutes'));
app.use('/api/reviews',       require('./routes/reviewRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Kaamgar Connect API running', timestamp: new Date() });
});

// ──── ERROR HANDLER ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ──── START ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Kaamgar Connect API running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready`);
});
