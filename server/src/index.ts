import path from 'path';
import fs from 'fs';
import { createApp } from './app';
import { connectDatabase } from './database/connection';
import { config } from './config/env';

async function bootstrap(): Promise<void> {
  console.log(`
╔══════════════════════════════════════════╗
║         VERICHAIN API SERVER             ║
║   AI Due-Diligence for Real World Assets ║
╚══════════════════════════════════════════╝
  `);
  console.log(`[BOOT] Environment: ${config.env}`);
  console.log(`[BOOT] Port: ${config.port}`);

  // Ensure uploads directory exists
  if (!fs.existsSync(config.upload.uploadDir)) {
    fs.mkdirSync(config.upload.uploadDir, { recursive: true });
    console.log(`[BOOT] Created uploads directory: ${config.upload.uploadDir}`);
  }

  // Connect to MongoDB
  try {
    await connectDatabase();
    console.log('[BOOT] Database connection established');
  } catch (err) {
    console.error('[BOOT] Failed to connect to MongoDB:', err);
    console.error('[BOOT] Ensure MongoDB is running at:', config.mongodb.uri);
    process.exit(1);
  }

  // Start Express server
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[BOOT] Server running at http://localhost:${config.port}`);
    console.log(`[BOOT] Health check: http://localhost:${config.port}/api/health`);
    console.log(`[BOOT] API ready ✓`);
  });
}

bootstrap().catch((err) => {
  console.error('[BOOT] Fatal startup error:', err);
  process.exit(1);
});
