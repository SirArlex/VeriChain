import morgan from 'morgan';
import { config } from '../config/env';

/**
 * HTTP request logger.
 * Dev: colorized, verbose.
 * Prod: structured JSON-like combined format.
 */
export const requestLogger = morgan(config.isDev ? 'dev' : 'combined');
