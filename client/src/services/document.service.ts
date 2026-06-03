import { apiClient } from './api';
import { DocumentType } from '../types';

export interface UploadedDocument {
  documentId: string;
  documentHash: string;
  isDuplicate: boolean;
  message: string;
  metadata: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    documentType: DocumentType;
    uploadedAt: string;
    extractedText: string;
    pageCount: number;
  };
}

export interface DocumentListItem {
  documentId: string;
  documentHash: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  uploadedAt: string;
  pageCount: number;
}

/**
 * DocumentService — all document API calls.
 *
 * upload(): sends file as multipart/form-data
 * getById(): fetches full document with extractedText
 * list(): fetches paginated document list
 */
export const DocumentService = {
  async upload(file: File, documentType: DocumentType = 'OTHER'): Promise<UploadedDocument> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    const res = await apiClient.post<{ success: boolean; data: UploadedDocument }>(
      '/api/documents/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Track upload progress
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1));
          console.log(`[UPLOAD] Progress: ${percent}%`);
        },
      }
    );

    return res.data.data;
  },

  async getById(documentId: string): Promise<UploadedDocument> {
    const res = await apiClient.get<{ success: boolean; data: UploadedDocument }>(
      `/api/documents/${documentId}`
    );
    return res.data.data;
  },

  async list(page = 1, limit = 10): Promise<{ documents: DocumentListItem[]; pagination: any }> {
    const res = await apiClient.get('/api/documents', { params: { page, limit } });
    return res.data.data;
  },
};
