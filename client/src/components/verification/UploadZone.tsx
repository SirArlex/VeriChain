import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Image, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import { clsx } from 'clsx';
import { DocumentType } from '../../types';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
import { UploadedDocument } from '../../services/document.service';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'TITLE_DEED', label: 'Title Deed' },
  { value: 'PROPERTY_APPRAISAL', label: 'Property Appraisal' },
  { value: 'LEASE_AGREEMENT', label: 'Lease Agreement' },
  { value: 'MORTGAGE', label: 'Mortgage' },
  { value: 'OTHER', label: 'Other' },
];

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/tiff': ['.tiff', '.tif'],
  'image/webp': ['.webp'],
};

interface UploadZoneProps {
  onUploadComplete?: (doc: UploadedDocument) => void;
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [documentType, setDocumentType] = useState<DocumentType>('REAL_ESTATE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadState, uploadedDocument, error, uploadFile, reset } = useDocumentUpload();

  // Fire callback when upload completes with full document object
  useEffect(() => {
    if (uploadState === 'done' && uploadedDocument) {
      onUploadComplete?.(uploadedDocument);
    }
  }, [uploadState, uploadedDocument, onUploadComplete]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    disabled: uploadState === 'uploading' || uploadState === 'extracting',
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    await uploadFile(selectedFile, documentType);
  };

  const handleReset = () => {
    setSelectedFile(null);
    reset();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isProcessing = uploadState === 'uploading' || uploadState === 'extracting';
  const isDone = uploadState === 'done';
  const isError = uploadState === 'error';

  return (
    <div className="space-y-4">
      {/* Document Type Selector */}
      <div>
        <label className="text-white/50 text-xs font-mono uppercase tracking-wider mb-2 block">
          Document Type
        </label>
        <div className="flex flex-wrap gap-2">
          {DOCUMENT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setDocumentType(type.value)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200',
                documentType === type.value
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <AnimatePresence mode="wait">
        {!isDone ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              {...getRootProps()}
              className={clsx(
                'relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 cursor-pointer',
                isDragActive && !isDragReject && 'border-blue-500 bg-blue-500/10',
                isDragReject && 'border-red-500 bg-red-500/10',
                !isDragActive && !selectedFile && 'border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5',
                selectedFile && !isProcessing && 'border-blue-500/30 bg-blue-500/5',
                isProcessing && 'border-blue-500/50 bg-blue-500/10 cursor-not-allowed',
                isError && 'border-red-500/30 bg-red-500/5',
              )}
            >
              <input {...getInputProps()} />

              {isProcessing ? (
                <div className="space-y-3">
                  <Loader2 className="w-10 h-10 text-blue-400 mx-auto animate-spin" />
                  <p className="text-blue-400 font-medium">
                    {uploadState === 'uploading' ? 'Uploading document...' : 'Running OCR extraction...'}
                  </p>
                  <p className="text-white/30 text-sm">
                    {uploadState === 'extracting' && 'AI is reading your document'}
                  </p>
                </div>
              ) : selectedFile ? (
                <div className="space-y-3">
                  {selectedFile.type === 'application/pdf'
                    ? <FileText className="w-10 h-10 text-blue-400 mx-auto" />
                    : <Image className="w-10 h-10 text-blue-400 mx-auto" />
                  }
                  <div>
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-white/40 text-sm">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                    className="absolute top-3 right-3 text-white/30 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-10 h-10 text-white/20 mx-auto" />
                  <div>
                    <p className="text-white/60 font-medium">
                      {isDragActive ? 'Drop your document here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-white/30 text-sm mt-1">
                      PDF, JPEG, PNG, TIFF, WEBP — up to 50MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error message */}
            {isError && error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-3 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Upload Button */}
            {selectedFile && !isProcessing && !isError && (
              <motion.button
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleUpload}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Start Verification Pipeline
              </motion.button>
            )}

            {isError && (
              <button
                onClick={handleReset}
                className="w-full mt-3 py-2.5 rounded-lg border border-white/10 text-white/50 hover:text-white text-sm transition-colors"
              >
                Try Again
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <GlassCard className="p-6 border border-green-500/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-semibold">Document Processed</p>
                    {uploadedDocument?.isDuplicate && (
                      <Badge variant="amber" size="sm">Duplicate</Badge>
                    )}
                  </div>
                  <p className="text-white/50 text-sm truncate">
                    {uploadedDocument?.metadata.fileName}
                  </p>
                  <p className="text-white/30 text-xs font-mono mt-1 truncate">
                    {uploadedDocument?.documentHash}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                    <span>{uploadedDocument?.metadata.pageCount} page(s)</span>
                    <span>{uploadedDocument?.metadata.extractedText?.length ?? 0} chars extracted</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="mt-4 w-full py-2 rounded-lg border border-white/10 text-white/40 hover:text-white text-sm transition-colors"
              >
                Upload Another Document
              </button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
