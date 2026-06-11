const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/profiles');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${req.user._id}_${Date.now()}${ext}`);
  }
});

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/resumes');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume_${req.user._id}_${Date.now()}${ext}`);
  }
});

const fileFilter = (allowedTypes) => (req, file, cb) => {
  const allowed = allowedTypes.includes(file.mimetype);
  cb(allowed ? null : new Error('Invalid file type'), allowed);
};

const imageFilter = fileFilter(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);
const resumeFilter = fileFilter(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']);

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

exports.uploadProfilePhoto = multer({ storage: profileStorage, fileFilter: imageFilter, limits: { fileSize: MAX_SIZE } }).single('profilePhoto');
exports.uploadResume = multer({ storage: resumeStorage, fileFilter: resumeFilter, limits: { fileSize: MAX_SIZE } }).single('resume');
