import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Flag, TrendingUp } from 'lucide-react';
import { AgentReputationScore } from '../../types/reputation';
import { AgentName } from '../../types';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

interface AgentReputationCardProps {
  reputation: AgentReputationScore;
  index: number;
}

const AGENT_META: Record<AgentName, {
  label: string;
  color: 'cyan' | 'blue' | 'purple' | 'red' | 'green';
  description: string;
}> = {
  METADATA: { label: 'Metadata Agent', color: 'cyan', description: 'Tampering & structural detection' },
  OWNERSHIP: { label: 'Ownership Agent', color: 'blue', description: 'Chain of title validation' },
  COMPLIANCE: { label: 'Compliance Agent', color: 'purple', description: 'Tokenization readiness' },
  FRAUD_DETECTION: { label: 'Fraud Detection Agent', color: 'red', description: 'Fraud pattern analysis' },
  RISK_SCORING: { label: 'Risk Scoring Agent', color: 'green', description: 'Composite score aggregation' },
};

const colorMap = {
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', badge: 'cyan' as const },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', badge: 'blue' as const },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', badge: 'purple' as const },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', badge: 'red' as const },
  green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', badge: 'green' as const },
};

export default function AgentReputationCard({ reputation, index }: AgentReputationCardProps) {
  const meta = AGENT_META[reputation.agentName];
  const c = colorMap[meta.color];

  const successRateColor = reputation.successRate >= 90 ? 'text-green-400'
    : reputation.successRate >= 70 ? 'text-amber-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <GlassCard className={`p-5 border ${c.border} h-full`} hover>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono border mb-2 ${c.bg} ${c.text} ${c.border}`}>
              {reputation.agentName}
            </div>
            <h3 className="text-white font-semibold">{meta.label}</h3>
            <p className="text-white/30 text-xs">{meta.description}</p>
          </div>
          <div className="text-right">
            <p className={`font-display text-2xl font-bold ${successRateColor}`}>
              {reputation.successRate}%
            </p>
            <p className="text-white/30 text-xs">success rate</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/[0.02] rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-white/30" />
              <p className="text-white/30 text-xs">Total Runs</p>
            </div>
            <p className="text-white font-mono font-semibold">{reputation.totalRuns}</p>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3 h-3 text-white/30" />
              <p className="text-white/30 text-xs">Avg Time</p>
            </div>
            <p className="text-white font-mono font-semibold">
              {reputation.averageExecutionTimeMs >= 1000
                ? `${(reputation.averageExecutionTimeMs / 1000).toFixed(1)}s`
                : `${reputation.averageExecutionTimeMs}ms`}
            </p>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle className="w-3 h-3 text-green-400/50" />
              <p className="text-white/30 text-xs">Passed</p>
            </div>
            <p className="text-green-400 font-mono font-semibold">{reputation.successfulRuns}</p>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Flag className="w-3 h-3 text-amber-400/50" />
              <p className="text-white/30 text-xs">Avg Flags</p>
            </div>
            <p className="text-amber-400 font-mono font-semibold">{reputation.averageFlagsPerRun}</p>
          </div>
        </div>

        {/* Score distribution bar */}
        <div>
          <p className="text-white/30 text-xs mb-2">Score Distribution</p>
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            {reputation.totalRuns > 0 ? (
              <>
                {reputation.scoreDistribution.low > 0 && (
                  <div
                    className="bg-green-400 rounded-full"
                    style={{ width: `${(reputation.scoreDistribution.low / reputation.totalRuns) * 100}%` }}
                  />
                )}
                {reputation.scoreDistribution.medium > 0 && (
                  <div
                    className="bg-amber-400 rounded-full"
                    style={{ width: `${(reputation.scoreDistribution.medium / reputation.totalRuns) * 100}%` }}
                  />
                )}
                {reputation.scoreDistribution.high > 0 && (
                  <div
                    className="bg-orange-400 rounded-full"
                    style={{ width: `${(reputation.scoreDistribution.high / reputation.totalRuns) * 100}%` }}
                  />
                )}
                {reputation.scoreDistribution.critical > 0 && (
                  <div
                    className="bg-red-400 rounded-full"
                    style={{ width: `${(reputation.scoreDistribution.critical / reputation.totalRuns) * 100}%` }}
                  />
                )}
              </>
            ) : (
              <div className="bg-white/10 rounded-full w-full" />
            )}
          </div>
          <div className="flex justify-between mt-1 text-xs text-white/20 font-mono">
            <span>LOW</span>
            <span>CRITICAL</span>
          </div>
        </div>

        {/* Failed runs warning */}
        {reputation.failedRuns > 0 && (
          <div className="mt-3 flex items-center gap-2 text-red-400/70 text-xs">
            <XCircle className="w-3 h-3" />
            <span>{reputation.failedRuns} failed run{reputation.failedRuns > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Last active */}
        {reputation.lastActiveAt && (
          <p className="mt-2 text-white/20 text-xs font-mono">
            Last active: {new Date(reputation.lastActiveAt).toLocaleDateString()}
          </p>
        )}
      </GlassCard>
    </motion.div>
  );
}
