"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const config_1 = require("../config");
const getSafeUploadDir = () => {
    if (process.env.VERCEL) {
        return os_1.default.tmpdir();
    }
    try {
        if (!fs_1.default.existsSync(config_1.config.uploadDir)) {
            fs_1.default.mkdirSync(config_1.config.uploadDir, { recursive: true });
        }
        return config_1.config.uploadDir;
    }
    catch (err) {
        console.warn('Failed to create local upload directory, using OS tmpdir fallback:', err);
        return os_1.default.tmpdir();
    }
};
const safeUploadDir = getSafeUploadDir();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, safeUploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF, JPG, PNG, and WEBP files are allowed'));
        }
    },
});
