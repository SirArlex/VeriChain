import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
<<<<<<< HEAD
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
=======
import { VERICHAIN_REGISTRY_ABI, CONTRACT_ADDRESS, MANTLE_SEPOLIA_CHAIN_ID, hexToBytes32, hashAgentOutputs } from '../utils/contract';
import { VerificationResult } from '../types';
import { apiClient } from '../services/api';

type ProofState = 'idle' | 'switching_chain' | 'confirming' | 'pending' | 'confirmed' | 'error';
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f

interface UseStoreProofReturn {
  proofState: ProofState;
  txHash: string | null;
  error: string | null;
  storeProof: (result: VerificationResult) => Promise<void>;
  reset: () => void;
}

<<<<<<< HEAD
=======
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
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
export function useStoreProof(): UseStoreProofReturn {
  const [proofState, setProofState] = useState<ProofState>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>();

  const chainId = useChainId();
<<<<<<< HEAD
  const { chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  useWaitForTransactionReceipt({
=======
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  // Wait for transaction receipt
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
    hash: pendingTxHash,
    confirmations: 1,
  });

  const storeProof = useCallback(async (result: VerificationResult) => {
    setProofState('idle');
    setError(null);
    setTxHash(null);
    setPendingTxHash(undefined);

    try {
<<<<<<< HEAD
      if (!isContractConfigured()) {
        throw new Error('Contract address not configured. Deploy the contract first and set VITE_CONTRACT_ADDRESS in .env');
      }

      // Switch chain if needed
      if (chainId !== MANTLE_SEPOLIA_CHAIN_ID) {
        setProofState('switching_chain');
=======
      // Validate contract is configured
      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '') {
        throw new Error('Contract address not configured. Deploy the contract first and set VITE_CONTRACT_ADDRESS in .env');
      }

      // Step 1: Ensure correct network
      if (chainId !== MANTLE_SEPOLIA_CHAIN_ID) {
        setProofState('switching_chain');
        console.log('[STORE PROOF] Switching to Mantle Sepolia...');
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
        await switchChainAsync({ chainId: MANTLE_SEPOLIA_CHAIN_ID });
      }

      setProofState('confirming');

<<<<<<< HEAD
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

=======
      // Step 2: Prepare contract arguments
      const documentHash = hexToBytes32(result.documentHash);
      const riskScore = Math.min(100, Math.max(0, result.overallRiskScore));
      const status = result.status === 'COMPLETED' ? 1 : result.status === 'FAILED' ? 2 : 0;

      // Hash all agent outputs together for the agentOutputsHash
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
      const agentOutputsString = JSON.stringify(
        result.agentFindings.map((f) => ({
          agent: f.agentName,
          score: f.score,
          flags: f.flags,
        }))
      );
      const agentOutputsHash = await hashAgentOutputs(agentOutputsString);

<<<<<<< HEAD
      const hash = await writeContractAsync({
        address: contractAddr,
=======
      console.log('[STORE PROOF] Calling storeVerification...');
      console.log('[STORE PROOF] Document hash:', documentHash);
      console.log('[STORE PROOF] Risk score:', riskScore);
      console.log('[STORE PROOF] Status:', status);

      // Step 3: Send transaction
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
        abi: VERICHAIN_REGISTRY_ABI,
        functionName: 'storeVerification',
        args: [
          documentHash,
          riskScore,
          status,
          agentOutputsHash,
          result.verificationId,
        ],
<<<<<<< HEAD
        chain: undefined,
        account: undefined,
      } as any);

=======
      });

      console.log('[STORE PROOF] Tx submitted:', hash);
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
      setPendingTxHash(hash);
      setTxHash(hash);
      setProofState('pending');

<<<<<<< HEAD
=======
      // Step 4: Notify backend of txHash
      // Backend updates the verification record in MongoDB
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
      await apiClient.patch(`/api/verifications/${result.verificationId}/onchain`, {
        txHash: hash,
      });

      setProofState('confirmed');
<<<<<<< HEAD
    } catch (err: any) {
      const message = err?.shortMessage ?? err?.message ?? 'Failed to store proof on-chain';
      // The contract reverts with DocumentAlreadyVerified if this document
      // already has an on-chain proof — surface that as a clean duplicate state.
      if (/DocumentAlreadyVerified|already/i.test(message)) {
        setProofState('duplicate');
        return;
      }
=======
      console.log('[STORE PROOF] Proof stored on Mantle! Tx:', hash);

    } catch (err: any) {
      const message = err?.shortMessage ?? err?.message ?? 'Failed to store proof on-chain';
      console.error('[STORE PROOF] Error:', message);
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
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
