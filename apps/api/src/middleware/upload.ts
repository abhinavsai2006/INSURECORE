import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { config } from '../config';

const getSafeUploadDir = () => {
  if (process.env.VERCEL) {
    return os.tmpdir();
  }
  try {
    if (!fs.existsSync(config.uploadDir)) {
      fs.mkdirSync(config.uploadDir, { recursive: true });
    }
    return config.uploadDir;
  } catch (err) {
    console.warn('Failed to create local upload directory, using OS tmpdir fallback:', err);
    return os.tmpdir();
  }
};

const safeUploadDir = getSafeUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, safeUploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, PNG, and WEBP files are allowed'));
    }
  },
});
