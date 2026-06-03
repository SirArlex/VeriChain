import { useState, useCallback } from 'react';
import { VerificationService } from '../services/verification.service';
import { VerificationResult } from '../types';

type VerificationState = 'idle' | 'running' | 'completed' | 'error';

interface UseVerificationReturn {
  verificationState: VerificationState;
  verificationResult: VerificationResult | null;
  error: string | null;
  startVerification: (documentId: string) => Promise<void>;
  reset: () => void;
}

export function useVerification(): UseVerificationReturn {
  const [verificationState, setVerificationState] = useState<VerificationState>('idle');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startVerification = useCallback(async (documentId: string) => {
    setVerificationState('running');
    setError(null);
    setVerificationResult(null);

    try {
      const result = await VerificationService.start(documentId);
      setVerificationResult(result);
      setVerificationState('completed');
    } catch (err: any) {
      const message = err?.response?.data?.error ?? err?.message ?? 'Verification failed';
      setError(message);
      setVerificationState('error');
    }
  }, []);

  const reset = useCallback(() => {
    setVerificationState('idle');
    setVerificationResult(null);
    setError(null);
  }, []);

  return { verificationState, verificationResult, error, startVerification, reset };
}
