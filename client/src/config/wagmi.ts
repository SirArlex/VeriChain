import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mantleSepolia, mantleMainnet } from '../utils/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'verichain_dev';

/**
 * wagmi config — connects RainbowKit to Mantle network.
 * Supports both Mantle Sepolia (testnet) and Mainnet.
 * WalletConnect projectId comes from environment variable.
 */
export const wagmiConfig = getDefaultConfig({
  appName: 'VeriChain',
  projectId,
  chains: [mantleSepolia, mantleMainnet],
  ssr: false,
});
