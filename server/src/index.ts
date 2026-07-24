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

async function bootstrap() {
  // Initialize database and run migrations
  await getDb();
  await runMigrations();

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Static file serving for uploads
  app.use('/uploads', express.static(config.uploadDir));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/shops', shopRoutes);
  app.use('/api/share', shareRoutes);
  app.use('/api/upload', uploadRoutes);
app.use('/api/geocode', geocodeRoutes);

  // Error handler
  app.use(errorHandler);

  // Serve static client in production
  if (process.env.NODE_ENV === 'production') {
    const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });

  return app;
}

bootstrap().catch(console.error);

export default bootstrap;
