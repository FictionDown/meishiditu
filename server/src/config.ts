import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  amapKey: process.env.AMAP_KEY || '',
  uploadDir: path.join(__dirname, '..', 'uploads'),
  maxFileSize: 5 * 1024 * 1024, // 5MB
  dbPath: path.join(__dirname, '..', 'data', 'meishiditu.db'),
};
