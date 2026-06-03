import { useState, useCallback } from 'react';
import { DocumentService, UploadedDocument } from '../services/document.service';
import { DocumentType } from '../types';

type UploadState = 'idle' | 'uploading' | 'extracting' | 'done' | 'error';

interface UseDocumentUploadReturn {
  uploadState: UploadState;
  uploadedDocument: UploadedDocument | null;
  error: string | null;
  uploadFile: (file: File, documentType?: DocumentType) => Promise<void>;
  reset: () => void;
}

export function useDocumentUpload(): UseDocumentUploadReturn {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File, documentType: DocumentType = 'OTHER') => {
    setUploadState('uploading');
    setError(null);
    setUploadedDocument(null);

    try {
      const result = await DocumentService.upload(file, documentType);
      setUploadState('extracting');
      await new Promise((r) => setTimeout(r, 800));
      setUploadedDocument(result);
      setUploadState('done');
    } catch (err: any) {
      const message =
        err?.response?.data?.error ?? err?.message ?? 'Upload failed. Please try again.';
      setError(message);
      setUploadState('error');
      console.error('[UPLOAD HOOK] Error:', err);
    }
  }, []);

  const reset = useCallback(() => {
    setUploadState('idle');
    setUploadedDocument(null);
    setError(null);
  }, []);

  return { uploadState, uploadedDocument, error, uploadFile, reset };
}
