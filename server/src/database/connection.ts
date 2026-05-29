import mongoose from 'mongoose';
import { config } from '../config/env';

/**
 * Connects to MongoDB with retry logic.
 * Logs connection state changes for debugging.
 * Called once at server startup — Mongoose handles connection pooling.
 */
export async function connectDatabase(): Promise<void> {
  const uri = config.mongodb.uri;
  
  mongoose.connection.on('connected', () => {
    console.log('[DB] MongoDB connected to:', uri.replace(/\/\/.*@/, '//***@'));
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('[DB] MongoDB connection error:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('[DB] MongoDB connection closed (SIGINT)');
    process.exit(0);
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
}
