import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Hash, Calendar, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { UploadedDocument } from '../../services/document.service';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

interface DocumentPreviewProps {
  document: UploadedDocument;
}

/**
 * DocumentPreview — displays document metadata and extracted text
 * after a successful upload.
 *
 * Shows:
 * - Document hash (what gets stored on-chain)
 * - File metadata
 * - Extracted text with expand/collapse
 *
 * The extracted text preview is critical — it shows users
 * exactly what the AI agents will analyze.
 */
export default function DocumentPreview({ document }: DocumentPreviewProps) {
  const [textExpanded, setTextExpanded] = useState(false);
  const { metadata, documentHash } = document;
  const textPreview = metadata.extractedText?.slice(0, 500) ?? '';
  const hasMoreText = (metadata.extractedText?.length ?? 0) > 500;

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-white font-semibold">Document Analysis Ready</h3>
        <Badge variant="green" dot>OCR Complete</Badge>
      </div>

      {/* Metadata grid */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white/30 text-xs mb-0.5">File Name</p>
              <p className="text-white text-sm font-medium truncate max-w-[150px]">
                {metadata.fileName}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Layers className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white/30 text-xs mb-0.5">Pages / Size</p>
              <p className="text-white text-sm font-medium">
                {metadata.pageCount}p · {formatSize(metadata.fileSize)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 col-span-2">
            <Hash className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-white/30 text-xs mb-0.5">Document Hash (SHA-256)</p>
              <p className="text-cyan-400 text-xs font-mono break-all">{documentHash}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white/30 text-xs mb-0.5">Uploaded At</p>
              <p className="text-white text-sm">
                {new Date(metadata.uploadedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white/30 text-xs mb-0.5">Text Extracted</p>
              <p className="text-white text-sm">
                {metadata.extractedText?.length ?? 0} characters
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Extracted text */}
      {metadata.extractedText && metadata.extractedText.length > 0 ? (
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/50 text-xs font-mono uppercase tracking-wider">
              Extracted Text (OCR Output)
            </p>
            <Badge variant="cyan" size="sm">{metadata.extractedText.length} chars</Badge>
          </div>
          <div className="relative">
            <pre className="text-white/60 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words bg-black/20 rounded-lg p-3 max-h-48 overflow-y-auto">
              {textExpanded ? metadata.extractedText : textPreview}
              {!textExpanded && hasMoreText && '...'}
            </pre>
            {hasMoreText && (
              <button
                onClick={() => setTextExpanded(!textExpanded)}
                className="flex items-center gap-1 mt-2 text-blue-400 hover:text-blue-300 text-xs font-mono transition-colors"
              >
                {textExpanded ? (
                  <><ChevronUp className="w-3 h-3" /> Show less</>
                ) : (
                  <><ChevronDown className="w-3 h-3" /> Show full text ({metadata.extractedText.length} chars)</>
                )}
              </button>
            )}
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-4 border border-amber-500/20">
          <p className="text-amber-400 text-sm">
            No text could be extracted from this document. The AI agents will analyze
            the document structure and metadata instead.
          </p>
        </GlassCard>
      )}
    </motion.div>
  );
}
