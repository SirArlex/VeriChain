import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import RootLayout from '../layouts/RootLayout';
import AgentDetailCard from '../components/verification/AgentDetailCard';
import ComplianceChecklist from '../components/verification/ComplianceChecklist';
import RiskBreakdownChart from '../components/verification/RiskBreakdownChart';
import RiskScoreDisplay from '../components/verification/RiskScoreDisplay';
import { VerificationService } from '../services/verification.service';
import { VerificationResult } from '../types';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';

const AGENT_ORDER = ['METADATA', 'OWNERSHIP', 'COMPLIANCE', 'FRAUD_DETECTION', 'RISK_SCORING'];

export default function VerificationDetailPage() {
  const { verificationId } = useParams<{ verificationId: string }>();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!verificationId) return;
    VerificationService.getById(verificationId)
      .then(setResult)
      .catch((err) => setError(err?.response?.data?.error ?? 'Failed to load verification'))
      .finally(() => setLoading(false));
  }, [verificationId]);

  const handleCopyHash = () => {
    if (result?.documentHash) {
      navigator.clipboard.writeText(result.documentHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sortedFindings = result?.agentFindings
    ?.slice()
    .sort((a, b) => AGENT_ORDER.indexOf(a.agentName) - AGENT_ORDER.indexOf(b.agentName));

  if (loading) {
    return (
      <RootLayout>
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Shield className="w-8 h-8 text-blue-400 mx-auto animate-pulse" />
            <p className="text-white/40 text-sm">Loading verification...</p>
          </div>
        </div>
      </RootLayout>
    );
  }

  if (error || !result) {
    return (
      <RootLayout>
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-red-400">{error ?? 'Verification not found'}</p>
            <Link to="/explorer" className="text-blue-400 text-sm hover:text-blue-300">
              ← Back to Explorer
            </Link>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Link to="/explorer" className="flex items-center gap-2 text-white/30 hover:text-white text-sm mb-6 transition-colors w-fit">
              <ArrowLeft className="w-4 h-4" />
              Back to Explorer
            </Link>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h1 className="font-display text-2xl font-bold text-white">Verification Report</h1>
                </div>
                <p className="text-white/30 text-sm font-mono">{result.verificationId}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={result.tokenizationReady ? 'green' : 'red'} dot>
                  {result.tokenizationReady ? 'Tokenization Ready' : 'Review Required'}
                </Badge>
                <Badge variant="blue">
                  {new Date(result.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Top row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <RiskScoreDisplay
                score={result.overallRiskScore}
                riskLevel={result.overallRiskLevel}
                tokenizationReady={result.tokenizationReady}
                fraudFlags={result.fraudFlags ?? []}
              />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <RiskBreakdownChart result={result} />

              {/* Document hash */}
              <GlassCard className="p-4">
                <p className="text-white/30 text-xs font-mono uppercase tracking-wider mb-2">Document Hash (SHA-256)</p>
                <div className="flex items-center gap-2">
                  <p className="text-cyan-400 text-xs font-mono break-all flex-1">{result.documentHash}</p>
                  <button onClick={handleCopyHash} className="text-white/30 hover:text-white transition-colors flex-shrink-0">
                    {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {result.onChainTxHash && (
                  <a
                    href={`https://explorer.sepolia.mantle.xyz/tx/${result.onChainTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 mt-3 text-blue-400 hover:text-blue-300 text-xs font-mono transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Mantle Explorer
                  </a>
                )}
              </GlassCard>
            </div>
          </div>

          {/* AI Executive Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
            <GlassCard className="p-5 border border-purple-500/20">
              <p className="text-purple-400 text-xs font-mono uppercase tracking-wider mb-3">AI Executive Summary</p>
              <p className="text-white/70 text-sm leading-relaxed">{result.aiExplanation}</p>
            </GlassCard>
          </motion.div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Agent detail cards */}
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider text-white/40 mb-3">
                Agent Findings — Click to Expand
              </h2>
              {sortedFindings?.map((finding, i) => (
                <motion.div
                  key={finding.agentName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <AgentDetailCard finding={finding} />
                </motion.div>
              ))}
            </div>

            {/* Compliance checklist */}
            <div className="space-y-4">
              <ComplianceChecklist result={result} />
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
