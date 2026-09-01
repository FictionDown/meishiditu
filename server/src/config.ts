import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Vercel serverless: read-only filesystem except /tmp.
// Render/traditional hosting: use DATA_DIR for persistent disk mount.
const isVercel = !!process.env.VERCEL;

function resolveDataRoot(): string {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  if (isVercel) return '/tmp';
  return path.join(__dirname, '..', 'data');
}

const dataRoot = resolveDataRoot();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  amapKey: process.env.AMAP_KEY || '',
  uploadDir: isVercel ? '/tmp/uploads' : path.join(dataRoot, 'uploads'),
  maxFileSize: 5 * 1024 * 1024, // 5MB
  dbPath: isVercel ? '/tmp/meishiditu.db' : path.join(dataRoot, 'meishiditu.db'),
};
