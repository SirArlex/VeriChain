import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AgentFinding, AgentName } from '../../types';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

interface AgentDetailCardProps {
  finding: AgentFinding;
}

const AGENT_META: Record<AgentName, {
  label: string;
  description: string;
  color: 'cyan' | 'blue' | 'purple' | 'red' | 'green';
}> = {
  METADATA: { label: 'Metadata Agent', description: 'Tampering & structural anomaly detection', color: 'cyan' },
  OWNERSHIP: { label: 'Ownership Agent', description: 'Chain of title & party validation', color: 'blue' },
  COMPLIANCE: { label: 'Compliance Agent', description: 'Tokenization readiness assessment', color: 'purple' },
  FRAUD_DETECTION: { label: 'Fraud Detection Agent', description: 'Fraud pattern & risk analysis', color: 'red' },
  RISK_SCORING: { label: 'Risk Scoring Agent', description: 'Composite score aggregation', color: 'green' },
};

const colorMap = {
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', badge: 'cyan' as const },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', badge: 'blue' as const },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', badge: 'purple' as const },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', badge: 'red' as const },
  green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', badge: 'green' as const },
};

export default function AgentDetailCard({ finding }: AgentDetailCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = AGENT_META[finding.agentName];
  const c = colorMap[meta.color];

  const riskBadgeVariant = finding.riskLevel === 'LOW' ? 'green'
    : finding.riskLevel === 'MEDIUM' ? 'amber' : 'red';

  const rawOutput = finding.rawOutput as any;

  return (
    <GlassCard className={`border ${c.border}`}>
      {/* Header — always visible */}
      <button
        className="w-full p-4 flex items-center justify-between text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
            {finding.status === 'COMPLETED' ? (
              <CheckCircle className={`w-4 h-4 ${c.text}`} />
            ) : finding.status === 'FAILED' ? (
              <XCircle className="w-4 h-4 text-red-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-white/30" />
            )}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{meta.label}</p>
            <p className="text-white/30 text-xs">{meta.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`font-mono font-bold ${c.text}`}>{finding.score}/100</p>
            <Badge variant={riskBadgeVariant} size="sm">{finding.riskLevel}</Badge>
          </div>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-white/30" />
            : <ChevronDown className="w-4 h-4 text-white/30" />
          }
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">

              {/* AI Explanation */}
              <div>
                <p className={`text-xs font-mono uppercase tracking-wider ${c.text} mb-2`}>
                  Agent Analysis
                </p>
                <p className="text-white/60 text-sm leading-relaxed">
                  {finding.explanation}
                </p>
              </div>

              {/* Flags */}
              {finding.flags.length > 0 && (
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-white/30 mb-2">
                    Flags Raised ({finding.flags.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {finding.flags.map((flag) => (
                      <span
                        key={flag}
                        className="px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Agent-specific data */}
              {rawOutput?.partiesIdentified?.length > 0 && (
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-white/30 mb-2">Parties Identified</p>
                  <div className="space-y-1">
                    {rawOutput.partiesIdentified.map((p: string) => (
                      <p key={p} className="text-white/50 text-xs font-mono">{p}</p>
                    ))}
                  </div>
                </div>
              )}

              {rawOutput?.missingRequirements?.length > 0 && (
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-white/30 mb-2">Missing Requirements</p>
                  <div className="space-y-1">
                    {rawOutput.missingRequirements.map((r: string) => (
                      <div key={r} className="flex items-center gap-2">
                        <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <p className="text-white/50 text-xs">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rawOutput?.fraudIndicators?.length > 0 && (
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-white/30 mb-2">Fraud Indicators</p>
                  <div className="space-y-1">
                    {rawOutput.fraudIndicators.map((f: string) => (
                      <div key={f} className="flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <p className="text-white/50 text-xs">{f}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rawOutput?.keyRisks?.length > 0 && (
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-white/30 mb-2">Key Risks</p>
                  <div className="space-y-1">
                    {rawOutput.keyRisks.map((r: string) => (
                      <div key={r} className="flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <p className="text-white/50 text-xs">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rawOutput?.recommendations?.length > 0 && (
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-white/30 mb-2">Recommendations</p>
                  <div className="space-y-1">
                    {rawOutput.recommendations.map((r: string) => (
                      <div key={r} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                        <p className="text-white/50 text-xs">{r}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Execution time */}
              <p className="text-white/20 text-xs font-mono">
                Completed in {finding.executionTimeMs}ms · {new Date(finding.completedAt).toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
