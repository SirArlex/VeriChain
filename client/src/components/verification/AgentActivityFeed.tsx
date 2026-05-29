import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
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

        return (
          <AnimatePresence key={agentName}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5"
            >
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
                  {finding && (
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
                  </>
                )}
                {isPending && (
                  <span className="text-white/15 text-xs font-mono">—</span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        );
      })}
    </div>
  );
}
