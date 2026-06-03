import dotenv from 'dotenv';
import path from 'path';

// Load .env from root of monorepo
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string = ''): string {
  return process.env[key] ?? fallback;
}

export const config = {
  env: optionalEnv('NODE_ENV', 'development'),
  port: parseInt(optionalEnv('PORT', '3001'), 10),
  
  mongodb: {
    uri: optionalEnv('MONGODB_URI', 'mongodb://localhost:27017/verichain'),
  },
  
  gemini: {
    apiKey: optionalEnv('GEMINI_API_KEY', ''),
  },
  
  mantle: {
    rpcUrl: optionalEnv('MANTLE_RPC_URL', 'https://rpc.sepolia.mantle.xyz'),
    chainId: parseInt(optionalEnv('MANTLE_CHAIN_ID', '5003'), 10),
    contractAddress: optionalEnv('VERICHAIN_CONTRACT_ADDRESS', ''),
  },
  
  upload: {
    maxFileSizeMb: 50,
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'image/webp',
    ],
    uploadDir: path.resolve(__dirname, '../../uploads'),
  },
  
  isDev: optionalEnv('NODE_ENV', 'development') === 'development',
  isProd: optionalEnv('NODE_ENV', 'development') === 'production',
};
