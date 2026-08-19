import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { getDb } from './db/connection';
import { runMigrations } from './db/migrate';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import shopRoutes from './routes/shops';
import shareRoutes from './routes/share';
import uploadRoutes from './routes/upload';
import geocodeRoutes from './routes/geocode';
import categoryRoutes from './routes/categories';
import addressRoutes from './routes/address';

// Lazy DB init: sql.js is async, so we initialize once on first request
// that needs the database. Cached so subsequent requests skip it.
let dbInitialized: Promise<void> | null = null;
function ensureDb(): Promise<void> {
  if (!dbInitialized) {
    dbInitialized = (async () => {
      await getDb();
      await runMigrations();
    })();
  }
  return dbInitialized;
}

// Build the Express app without listening. Used by both the local server
// (bootstrap) and the Vercel serverless entry (api/server.ts).
export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Static file serving for uploads (no DB needed)
  app.use('/uploads', express.static(config.uploadDir));

  // Health check (no DB needed)
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Ensure DB is ready before handling any other API route
  app.use(async (_req, _res, next) => {
    await ensureDb();
    next();
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/shops', shopRoutes);
  app.use('/api/share', shareRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/geocode', geocodeRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/address', addressRoutes);

  // Error handler
  app.use(errorHandler);

  // Serve static client in production (traditional hosting only — on Vercel
  // the platform serves the client build directly, so skip this).
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  return app;
}

async function bootstrap() {
  await ensureDb();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
  return app;
}

// Only start the long-running server when running locally (npm dev/start).
// On Vercel the function imports createApp() instead.
if (!process.env.VERCEL) {
  bootstrap().catch(console.error);
}

export default bootstrap;
