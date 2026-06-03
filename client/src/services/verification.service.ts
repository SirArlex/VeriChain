import { apiClient } from './api';
import { VerificationResult } from '../types';

export const VerificationService = {
  async start(documentId: string): Promise<VerificationResult> {
    const res = await apiClient.post<{ success: boolean; data: VerificationResult }>(
      '/api/verifications/start',
      { documentId }
    );
    return res.data.data;
  },

  async getById(verificationId: string): Promise<VerificationResult> {
    const res = await apiClient.get<{ success: boolean; data: VerificationResult }>(
      `/api/verifications/${verificationId}`
    );
    return res.data.data;
  },

  async getByDocument(documentId: string): Promise<VerificationResult[]> {
    const res = await apiClient.get<{ success: boolean; data: VerificationResult[] }>(
      `/api/verifications/document/${documentId}`
    );
    return res.data.data;
  },

  async list(page = 1, limit = 20): Promise<VerificationResult[]> {
    const res = await apiClient.get<{
      success: boolean;
      data: { verifications: VerificationResult[]; pagination: any };
    }>('/api/verifications', { params: { page, limit } });
    return res.data.data.verifications;
  },
};
