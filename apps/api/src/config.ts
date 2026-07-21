import dotenv from 'dotenv';
import path from 'path';

// Load .env from workspace root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'insurecore_jwt_secret_key_2026_super_secure_key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'insurecore_jwt_refresh_secret_key_2026',
  uploadDir: path.resolve(__dirname, '../../uploads'),
};
