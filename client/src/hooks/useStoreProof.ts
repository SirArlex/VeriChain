import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { useAccount } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { wagmiConfig } from '../config/wagmi';
import {
  VERICHAIN_REGISTRY_ABI,
  getContractAddress,
  isContractConfigured,
  MANTLE_SEPOLIA_CHAIN_ID,
  hexToBytes32,
  hashAgentOutputs,
} from '../utils/contract';
import { VerificationResult } from '../types';
import { apiClient } from '../services/api';

type ProofState = 'idle' | 'switching_chain' | 'confirming' | 'pending' | 'confirmed' | 'error' | 'duplicate';

interface UseStoreProofReturn {
  proofState: ProofState;
  txHash: string | null;
  error: string | null;
  storeProof: (result: VerificationResult) => Promise<void>;
  reset: () => void;
}

export function useStoreProof(): UseStoreProofReturn {
  const [proofState, setProofState] = useState<ProofState>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>();

  const chainId = useChainId();
  const { chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  useWaitForTransactionReceipt({
    hash: pendingTxHash,
    confirmations: 1,
  });

  const storeProof = useCallback(async (result: VerificationResult) => {
    setProofState('idle');
    setError(null);
    setTxHash(null);
    setPendingTxHash(undefined);

    try {
      if (!isContractConfigured()) {
        throw new Error('Contract address not configured. Deploy the contract first and set VITE_CONTRACT_ADDRESS in .env');
      }

      // Switch chain if needed
      if (chainId !== MANTLE_SEPOLIA_CHAIN_ID) {
        setProofState('switching_chain');
        await switchChainAsync({ chainId: MANTLE_SEPOLIA_CHAIN_ID });
      }

      setProofState('confirming');

      const documentHash = hexToBytes32(result.documentHash);

      // Pre-flight: block re-tokenization of an already-verified asset BEFORE
      // prompting the wallet, so the user sees a clean state, not a revert.
      const contractAddr = getContractAddress();
      try {
        const alreadyVerified = await readContract(wagmiConfig, {
          address: contractAddr,
          abi: VERICHAIN_REGISTRY_ABI,
          functionName: 'isDocumentVerified',
          args: [documentHash],
        } as any);
        if (alreadyVerified) {
          setProofState('duplicate');
          return;
        }
      } catch {
        // If the read fails (e.g. RPC hiccup), fall through and let the
        // contract enforce the rule; the revert is handled below.
      }

      const riskScore = Math.min(100, Math.max(0, result.overallRiskScore));
      const status = result.status === 'COMPLETED' ? 1 : result.status === 'FAILED' ? 2 : 0;

      const agentOutputsString = JSON.stringify(
        result.agentFindings.map((f) => ({
          agent: f.agentName,
          score: f.score,
          flags: f.flags,
        }))
      );
      const agentOutputsHash = await hashAgentOutputs(agentOutputsString);

      const hash = await writeContractAsync({
        address: contractAddr,
        abi: VERICHAIN_REGISTRY_ABI,
        functionName: 'storeVerification',
        args: [
          documentHash,
          riskScore,
          status,
          agentOutputsHash,
          result.verificationId,
        ],
        chain: undefined,
        account: undefined,
      } as any);

      setPendingTxHash(hash);
      setTxHash(hash);
      setProofState('pending');

      await apiClient.patch(`/api/verifications/${result.verificationId}/onchain`, {
        txHash: hash,
      });

      setProofState('confirmed');
    } catch (err: any) {
      const message = err?.shortMessage ?? err?.message ?? 'Failed to store proof on-chain';
      // The contract reverts with DocumentAlreadyVerified if this document
      // already has an on-chain proof — surface that as a clean duplicate state.
      if (/DocumentAlreadyVerified|already/i.test(message)) {
        setProofState('duplicate');
        return;
      }
      setError(message);
      setProofState('error');
    }
  }, [chainId, switchChainAsync, writeContractAsync]);

  const reset = useCallback(() => {
    setProofState('idle');
    setTxHash(null);
    setError(null);
    setPendingTxHash(undefined);
  }, []);

  return { proofState, txHash, error, storeProof, reset };
}
