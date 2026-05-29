import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import apiRoutes from './routes/index';
import { config } from './config/env';

export function createApp() {
  const app = express();

  // ── Security Middleware ─────────────────────────────────────────
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: config.isDev
      ? ['http://localhost:5173', 'http://localhost:3000']
      : process.env.ALLOWED_ORIGINS?.split(',') ?? [],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-wallet-address'],
  }));

  // ── Rate Limiting ───────────────────────────────────────────────
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' },
  });
  app.use('/api', limiter);

  // ── Body Parsing ────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── Logging ─────────────────────────────────────────────────────
  app.use(requestLogger);

  // ── Static Uploads ───────────────────────────────────────────────
  // Uploads served at /uploads/<filename>
  app.use('/uploads', express.static(config.upload.uploadDir));

  // ── API Routes ──────────────────────────────────────────────────
  app.use('/api', apiRoutes);

  // ── Error Handling (must be last) ───────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
