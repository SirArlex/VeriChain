import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { VERICHAIN_REGISTRY_ABI, CONTRACT_ADDRESS, MANTLE_SEPOLIA_CHAIN_ID, hexToBytes32, hashAgentOutputs } from '../utils/contract';
import { VerificationResult } from '../types';
import { apiClient } from '../services/api';

type ProofState = 'idle' | 'switching_chain' | 'confirming' | 'pending' | 'confirmed' | 'error';

interface UseStoreProofReturn {
  proofState: ProofState;
  txHash: string | null;
  error: string | null;
  storeProof: (result: VerificationResult) => Promise<void>;
  reset: () => void;
}

/**
 * useStoreProof — handles the full on-chain proof storage flow.
 *
 * Flow:
 * 1. Check wallet is on Mantle Sepolia — switch chain if needed
 * 2. Hash agent outputs to bytes32
 * 3. Call storeVerification() on VeriChainRegistry
 * 4. Wait for transaction confirmation
 * 5. POST txHash to backend — backend updates MongoDB record
 *
 * Backend is NEVER involved in signing or sending transactions.
 * It only records the txHash after the frontend confirms it.
 */
export function useStoreProof(): UseStoreProofReturn {
  const [proofState, setProofState] = useState<ProofState>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>();

  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  // Wait for transaction receipt
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
    confirmations: 1,
  });

  const storeProof = useCallback(async (result: VerificationResult) => {
    setProofState('idle');
    setError(null);
    setTxHash(null);
    setPendingTxHash(undefined);

    try {
      // Validate contract is configured
      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '') {
        throw new Error('Contract address not configured. Deploy the contract first and set VITE_CONTRACT_ADDRESS in .env');
      }

      // Step 1: Ensure correct network
      if (chainId !== MANTLE_SEPOLIA_CHAIN_ID) {
        setProofState('switching_chain');
        console.log('[STORE PROOF] Switching to Mantle Sepolia...');
        await switchChainAsync({ chainId: MANTLE_SEPOLIA_CHAIN_ID });
      }

      setProofState('confirming');

      // Step 2: Prepare contract arguments
      const documentHash = hexToBytes32(result.documentHash);
      const riskScore = Math.min(100, Math.max(0, result.overallRiskScore));
      const status = result.status === 'COMPLETED' ? 1 : result.status === 'FAILED' ? 2 : 0;

      // Hash all agent outputs together for the agentOutputsHash
      const agentOutputsString = JSON.stringify(
        result.agentFindings.map((f) => ({
          agent: f.agentName,
          score: f.score,
          flags: f.flags,
        }))
      );
      const agentOutputsHash = await hashAgentOutputs(agentOutputsString);

      console.log('[STORE PROOF] Calling storeVerification...');
      console.log('[STORE PROOF] Document hash:', documentHash);
      console.log('[STORE PROOF] Risk score:', riskScore);
      console.log('[STORE PROOF] Status:', status);

      // Step 3: Send transaction
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: VERICHAIN_REGISTRY_ABI,
        functionName: 'storeVerification',
        args: [
          documentHash,
          riskScore,
          status,
          agentOutputsHash,
          result.verificationId,
        ],
      });

      console.log('[STORE PROOF] Tx submitted:', hash);
      setPendingTxHash(hash);
      setTxHash(hash);
      setProofState('pending');

      // Step 4: Notify backend of txHash
      // Backend updates the verification record in MongoDB
      await apiClient.patch(`/api/verifications/${result.verificationId}/onchain`, {
        txHash: hash,
      });

      setProofState('confirmed');
      console.log('[STORE PROOF] Proof stored on Mantle! Tx:', hash);

    } catch (err: any) {
      const message = err?.shortMessage ?? err?.message ?? 'Failed to store proof on-chain';
      console.error('[STORE PROOF] Error:', message);
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
