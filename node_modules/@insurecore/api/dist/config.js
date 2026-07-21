"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env from workspace root
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'insurecore_jwt_secret_key_2026_super_secure_key',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'insurecore_jwt_refresh_secret_key_2026',
    uploadDir: path_1.default.resolve(__dirname, '../../uploads'),
};
