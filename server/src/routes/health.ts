import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET /api/health
 * Returns server status, DB connection state, and timestamp.
 * Use this to verify the server is running before testing other routes.
 */
router.get('/', async (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const dbStateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    success: true,
    data: {
      status: 'operational',
      timestamp: new Date().toISOString(),
      database: {
        state: dbStateMap[dbState] ?? 'unknown',
        connected: dbState === 1,
      },
      version: '1.0.0',
      service: 'VeriChain API',
    },
  });
});

export default router;
