import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Loader2, CheckCircle, AlertCircle, ExternalLink, Shield, ShieldCheck } from 'lucide-react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { VerificationResult } from '../../types';
import { useStoreProof } from '../../hooks/useStoreProof';
import { isContractConfigured } from '../../utils/contract';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

interface StoreOnChainProps {
  result: VerificationResult;
  onStored?: (txHash: string) => void;
  /** When true, automatically stores the proof on-chain once a wallet is
   *  connected and the contract is configured (no button click needed). */
  autoStore?: boolean;
}

export default function StoreOnChain({ result, onStored, autoStore = false }: StoreOnChainProps) {
  const { isConnected } = useAccount();
  const { proofState, txHash, error, storeProof } = useStoreProof();
  const contractConfigured = isContractConfigured();

  const alreadyStored = !!result.onChainTxHash || proofState === 'confirmed';
  const displayTxHash = result.onChainTxHash || txHash;

  // Auto-store: fire once when conditions are met. A ref guards against
  // repeated triggers across re-renders.
  const autoTriggered = useRef(false);
  useEffect(() => {
    if (
      autoStore &&
      !autoTriggered.current &&
      isConnected &&
      contractConfigured &&
      !alreadyStored &&
      proofState === 'idle'
    ) {
      autoTriggered.current = true;
      void storeProof(result);
    }
  }, [autoStore, isConnected, contractConfigured, alreadyStored, proofState, result, storeProof]);

  const handleStore = async () => {
    await storeProof(result);
    if (txHash) onStored?.(txHash);
  };

  return (
    <GlassCard className={`p-5 border ${alreadyStored ? 'border-green-500/20' : 'border-blue-500/20'}`}>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-blue-400" />
        <h3 className="text-white font-semibold text-sm">Mantle Blockchain Proof</h3>
      </div>

      <AnimatePresence mode="wait">
        {alreadyStored && displayTxHash ? (
          <motion.div key="stored" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <Badge variant="green" dot>Stored on Mantle</Badge>
            </div>
            <div>
              <p className="text-white/30 text-xs font-mono mb-1">Transaction Hash</p>
              <p className="text-cyan-400 text-xs font-mono break-all">{displayTxHash}</p>
            </div>
            <a
              href={`https://explorer.sepolia.mantle.xyz/tx/${displayTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs font-mono transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View on Mantle Sepolia Explorer
            </a>
          </motion.div>
        ) : !contractConfigured ? (
          <motion.div key="no-contract" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-3">
              <p className="text-amber-400 text-xs font-semibold mb-1">Contract Not Deployed</p>
              <p className="text-white/40 text-xs">
                Deploy VeriChainRegistry to Mantle Sepolia first, then set VITE_CONTRACT_ADDRESS in .env
              </p>
            </div>
            <div className="text-white/20 text-xs font-mono space-y-1">
              <p>cd contracts</p>
              <p>forge script script/Deploy.s.sol --rpc-url https://rpc.sepolia.mantle.xyz --broadcast --legacy</p>
            </div>
          </motion.div>
        ) : !isConnected ? (
          <motion.div key="no-wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-white/40 text-sm">Connect your wallet to store this verification proof on Mantle blockchain.</p>
            <ConnectButton />
          </motion.div>
        ) : proofState === 'duplicate' ? (
          <motion.div key="duplicate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-start gap-2 text-amber-400 text-sm">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
              <span>This asset already has an on-chain verification proof. Re-tokenization is blocked to prevent double-tokenization.</span>
            </div>
            <p className="text-white/40 text-xs">VeriChain enforces one proof per document at the smart-contract level — the same real-world asset cannot be verified on-chain twice.</p>
          </motion.div>
        ) : proofState === 'error' ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <button onClick={handleStore} className="w-full py-2.5 rounded-lg border border-white/10 text-white/50 hover:text-white text-sm transition-colors">
              Try Again
            </button>
          </motion.div>
        ) : proofState === 'idle' ? (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="space-y-2 text-xs font-mono">
              {[
                { label: 'Document Hash', value: result.documentHash.slice(0, 22) + '...' },
                { label: 'Risk Score', value: `${result.overallRiskScore}/100` },
                { label: 'Risk Level', value: result.overallRiskLevel },
                { label: 'Network', value: 'Mantle Sepolia (5003)' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-white/30">{label}</span>
                  <span className="text-white/60">{value}</span>
                </div>
              ))}
            </div>
            <button onClick={handleStore} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm">
              <Link2 className="w-4 h-4" />
              Store Proof on Mantle
            </button>
            <p className="text-white/20 text-xs text-center">This will open your wallet to confirm the transaction</p>
          </motion.div>
        ) : (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <div>
                <p className="text-white font-medium text-sm">
                  {proofState === 'switching_chain' && 'Switching to Mantle Sepolia...'}
                  {proofState === 'confirming' && 'Confirm in your wallet...'}
                  {proofState === 'pending' && 'Transaction pending...'}
                </p>
                <p className="text-white/30 text-xs">
                  {proofState === 'confirming' && 'Check your wallet extension'}
                  {proofState === 'pending' && 'Waiting for block confirmation'}
                </p>
              </div>
            </div>
            {txHash && (
              <div>
                <p className="text-white/30 text-xs font-mono mb-1">Tx Hash</p>
                <p className="text-cyan-400 text-xs font-mono break-all">{txHash}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
