import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { VerificationResult } from '../../types';
import GlassCard from '../ui/GlassCard';

interface ComplianceChecklistProps {
  result: VerificationResult;
}

interface CheckItem {
  label: string;
  passed: boolean | null;
  detail: string;
}

export default function ComplianceChecklist({ result }: ComplianceChecklistProps) {
  const metadataFinding = result.agentFindings?.find((f) => f.agentName === 'METADATA');
  const ownershipFinding = result.agentFindings?.find((f) => f.agentName === 'OWNERSHIP');
  const complianceFinding = result.agentFindings?.find((f) => f.agentName === 'COMPLIANCE');
  const fraudFinding = result.agentFindings?.find((f) => f.agentName === 'FRAUD_DETECTION');

  const hasFlag = (flag: string) =>
    result.fraudFlags?.some((f) => f.includes(flag)) ||
    result.complianceFlags?.some((f) => f.includes(flag));

  const rawCompliance = complianceFinding?.rawOutput as any;
  const rawOwnership = ownershipFinding?.rawOutput as any;

  const checks: CheckItem[] = [
    {
      label: 'Document Text Extracted',
      passed: (metadataFinding?.score ?? 100) < 80,
      detail: 'OCR successfully extracted readable content',
    },
    {
      label: 'Valid Date References',
      passed: !hasFlag('SUSPICIOUS_DATE'),
      detail: 'All dates within valid historical range',
    },
    {
      label: 'Ownership Chain Present',
      passed: rawOwnership?.geminiAnalysis?.ownershipChainComplete ?? ownershipFinding?.score < 40,
      detail: 'Grantor and grantee clearly identified',
    },
    {
      label: 'Property Description',
      passed: !hasFlag('MISSING_PROPERTY'),
      detail: 'Legal property description included',
    },
    {
      label: 'Signatures Referenced',
      passed: !hasFlag('NO_SIGNATURE'),
      detail: 'Signature fields present in document',
    },
    {
      label: 'Notarization',
      passed: !hasFlag('NO_NOTARIZATION'),
      detail: 'Notary acknowledgment included',
    },
    {
      label: 'No Suspicious Patterns',
      passed: fraudFinding?.score !== undefined ? fraudFinding.score < 40 : null,
      detail: 'No fraud language patterns detected',
    },
    {
      label: 'Tokenization Ready',
      passed: result.tokenizationReady,
      detail: 'Document meets minimum tokenization requirements',
    },
  ];

  const passedCount = checks.filter((c) => c.passed === true).length;
  const totalCount = checks.length;

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Compliance Checklist</h3>
        <span className="font-mono text-sm text-white/50">
          {passedCount}/{totalCount} passed
        </span>
      </div>

      <div className="space-y-2">
        {checks.map((check, i) => (
          <motion.div
            key={check.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
          >
            {check.passed === true ? (
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
            ) : check.passed === false ? (
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${
                check.passed === true ? 'text-white' :
                check.passed === false ? 'text-white/50' : 'text-white/70'
              }`}>
                {check.label}
              </p>
              <p className="text-white/30 text-xs">{check.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Overall verdict */}
      <div className={`mt-4 p-3 rounded-lg border ${
        result.tokenizationReady
          ? 'bg-green-500/10 border-green-500/20'
          : 'bg-red-500/10 border-red-500/20'
      }`}>
        <p className={`text-sm font-semibold ${result.tokenizationReady ? 'text-green-400' : 'text-red-400'}`}>
          {result.tokenizationReady
            ? '✓ This document is ready for tokenization'
            : '✗ This document requires review before tokenization'}
        </p>
      </div>
    </GlassCard>
  );
}
