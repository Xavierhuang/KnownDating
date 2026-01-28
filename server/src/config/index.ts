import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3002', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  databasePath: process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite'),
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
};

