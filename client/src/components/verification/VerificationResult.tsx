import { motion } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, Link } from 'lucide-react';
import { useState } from 'react';
import { VerificationResult as IVerificationResult } from '../../types';
import RiskScoreDisplay from './RiskScoreDisplay';
import AgentActivityFeed from './AgentActivityFeed';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

interface VerificationResultProps {
  result: IVerificationResult;
}

export default function VerificationResult({ result }: VerificationResultProps) {
  const [explanationExpanded, setExplanationExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Verification Complete</h3>
        <Badge variant="green" dot>All Agents Done</Badge>
      </div>

      {/* Risk Score */}
      <RiskScoreDisplay
        score={result.overallRiskScore}
        riskLevel={result.overallRiskLevel}
        tokenizationReady={result.tokenizationReady}
        fraudFlags={result.fraudFlags}
      />

      {/* AI Explanation */}
      <GlassCard className="p-4 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-purple-400" />
          <p className="text-purple-400 text-sm font-semibold">AI Risk Assessment</p>
        </div>
        <p className={`text-white/60 text-sm leading-relaxed ${!explanationExpanded ? 'line-clamp-3' : ''}`}>
          {result.aiExplanation}
        </p>
        {result.aiExplanation?.length > 200 && (
          <button
            onClick={() => setExplanationExpanded(!explanationExpanded)}
            className="flex items-center gap-1 mt-2 text-purple-400 text-xs font-mono"
          >
            {explanationExpanded
              ? <><ChevronUp className="w-3 h-3" /> Show less</>
              : <><ChevronDown className="w-3 h-3" /> Read full assessment</>
            }
          </button>
        )}
      </GlassCard>

      {/* Agent Feed */}
      <GlassCard className="p-4">
        <AgentActivityFeed findings={result.agentFindings} isRunning={false} />
      </GlassCard>

      {/* Verification ID */}
      <GlassCard className="p-4">
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-white/30">Verification ID</span>
            <span className="text-white/60">{result.verificationId.slice(0, 16)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/30">Document Hash</span>
            <span className="text-cyan-400">{result.documentHash.slice(0, 18)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/30">Status</span>
            <span className="text-green-400">{result.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/30">Completed</span>
            <span className="text-white/50">
              {result.completedAt ? new Date(result.completedAt).toLocaleString() : '—'}
            </span>
          </div>
        </div>

        {result.onChainTxHash && (
          <a
            href={`https://explorer.sepolia.mantle.xyz/tx/${result.onChainTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 text-blue-400 hover:text-blue-300 text-xs font-mono"
          >
            <Link className="w-3 h-3" />
            View on Mantle Explorer
          </a>
        )}
      </GlassCard>
    </motion.div>
  );
}
