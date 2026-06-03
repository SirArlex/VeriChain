import axios from 'axios';

/**
 * Central axios instance for all VeriChain API calls.
 * Base URL comes from Vite env — proxied to localhost:3001 in dev.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  timeout: 60000, // 60s — AI agent calls can be slow
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach wallet address to every request if available
apiClient.interceptors.request.use((config) => {
  const address = localStorage.getItem('walletAddress');
  if (address) {
    config.headers['x-wallet-address'] = address;
  }
  return config;
});

// Global error logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.error ?? error.message,
    });
    return Promise.reject(error);
  }
);

// Health check — use this to verify server is reachable
export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await apiClient.get('/api/health');
    return res.data?.data?.database?.connected === true;
  } catch {
    return false;
  }
}
