import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { AgentFinding, AgentName } from '../../types';
import Badge from '../ui/Badge';

interface AgentActivityFeedProps {
  findings: AgentFinding[];
  isRunning: boolean;
}

const AGENT_META: Record<AgentName, { label: string; color: 'cyan' | 'blue' | 'purple' | 'red' | 'green' }> = {
  METADATA: { label: 'Metadata Agent', color: 'cyan' },
  OWNERSHIP: { label: 'Ownership Agent', color: 'blue' },
  COMPLIANCE: { label: 'Compliance Agent', color: 'purple' },
  FRAUD_DETECTION: { label: 'Fraud Detection Agent', color: 'red' },
  RISK_SCORING: { label: 'Risk Scoring Agent', color: 'green' },
};

const AGENT_ORDER: AgentName[] = ['METADATA', 'OWNERSHIP', 'COMPLIANCE', 'FRAUD_DETECTION', 'RISK_SCORING'];

export default function AgentActivityFeed({ findings, isRunning }: AgentActivityFeedProps) {
  const findingMap = new Map(findings.map((f) => [f.agentName, f]));
  const [expandedAgent, setExpandedAgent] = useState<AgentName | null>(null);

  return (
    <div className="space-y-2">
      <p className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">
        Agent Activity Feed
      </p>
      {AGENT_ORDER.map((agentName, i) => {
        const meta = AGENT_META[agentName];
        const finding = findingMap.get(agentName);
        const isActive = isRunning && !finding && i <= findings.length;
        const isPending = !finding && !isActive;
        const isExpanded = expandedAgent === agentName;

        return (
          <AnimatePresence key={agentName}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-lg bg-white/[0.02] border border-white/5 overflow-hidden transition-colors ${finding ? 'cursor-pointer hover:bg-white/[0.04]' : ''}`}
              onClick={() => finding && setExpandedAgent(isExpanded ? null : agentName)}
            >
              {/* Always-visible row */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  {finding?.status === 'COMPLETED' ? (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : finding?.status === 'FAILED' ? (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-white/20 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${finding ? 'text-white' : isActive ? 'text-blue-400' : 'text-white/30'}`}>
                      {meta.label}
                    </p>
                    {finding && !isExpanded && (
                      <p className="text-white/30 text-xs mt-0.5 line-clamp-1">
                        {finding.explanation?.slice(0, 80)}...
                      </p>
                    )}
                    {isActive && (
                      <p className="text-blue-400/60 text-xs mt-0.5">Analyzing...</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {finding && (
                    <>
                      <Badge
                        variant={
                          finding.riskLevel === 'LOW' ? 'green' :
                          finding.riskLevel === 'MEDIUM' ? 'amber' :
                          finding.riskLevel === 'HIGH' ? 'red' : 'red'
                        }
                        size="sm"
                      >
                        {finding.riskLevel}
                      </Badge>
                      <span className="text-white/40 text-xs font-mono w-10 text-right">
                        {finding.score}/100
                      </span>
                      {isExpanded
                        ? <ChevronUp className="w-3.5 h-3.5 text-white/30" />
                        : <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                      }
                    </>
                  )}
                  {isPending && (
                    <span className="text-white/15 text-xs font-mono">—</span>
                  )}
                </div>
              </div>

              {/* Expanded: full explanation + flags */}
              {finding && isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3"
                >
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-white/30 mb-1.5">
                      Agent Analysis
                    </p>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {finding.explanation}
                    </p>
                  </div>

                  {finding.flags.length > 0 && (
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-white/30 mb-1.5">
                        Flags ({finding.flags.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {finding.flags.map((flag) => (
                          <span
                            key={flag}
                            className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-white/20 text-xs font-mono">
                    Completed in {finding.executionTimeMs}ms · {new Date(finding.completedAt).toLocaleTimeString()}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        );
      })}
    </div>
  );
}
