import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Vercel serverless functions have a read-only filesystem except /tmp.
// SQLite DB and uploaded files live in /tmp so they persist across warm
// invocations (but are wiped on cold start — demo-only behavior).
const isVercel = !!process.env.VERCEL;

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  amapKey: process.env.AMAP_KEY || '',
  uploadDir: isVercel ? '/tmp/uploads' : path.join(__dirname, '..', 'uploads'),
  maxFileSize: 5 * 1024 * 1024, // 5MB
  dbPath: isVercel ? '/tmp/meishiditu.db' : path.join(__dirname, '..', 'data', 'meishiditu.db'),
};
