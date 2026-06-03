import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ShieldX, FileText, Clock, ArrowRight } from 'lucide-react';
import { VerificationResult, RiskLevel } from '../../types';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

interface VerificationCardProps {
  verification: VerificationResult;
  index: number;
}

const riskConfig: Record<RiskLevel, {
  icon: typeof ShieldCheck;
  color: string;
  badge: 'green' | 'amber' | 'red';
  border: string;
}> = {
  LOW: { icon: ShieldCheck, color: 'text-green-400', badge: 'green', border: 'border-green-500/20' },
  MEDIUM: { icon: ShieldAlert, color: 'text-amber-400', badge: 'amber', border: 'border-amber-500/20' },
  HIGH: { icon: ShieldX, color: 'text-red-400', badge: 'red', border: 'border-red-500/20' },
  CRITICAL: { icon: ShieldX, color: 'text-red-500', badge: 'red', border: 'border-red-500/30' },
};

export default function VerificationCard({ verification, index }: VerificationCardProps) {
  const navigate = useNavigate();
  const config = riskConfig[verification.overallRiskLevel];
  const Icon = config.icon;

  const fraudFinding = verification.agentFindings?.find((f) => f.agentName === 'FRAUD_DETECTION');
  const complianceFinding = verification.agentFindings?.find((f) => f.agentName === 'COMPLIANCE');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlassCard
        className={`p-5 border ${config.border} cursor-pointer`}
        hover
        onClick={() => navigate(`/explorer/${verification.verificationId}`)}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left */}
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant={config.badge} size="sm">{verification.overallRiskLevel}</Badge>
                <Badge variant={verification.tokenizationReady ? 'green' : 'red'} size="sm">
                  {verification.tokenizationReady ? 'Tokenization Ready' : 'Review Required'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-3 h-3 text-white/30" />
                <p className="text-white/60 text-xs font-mono truncate">
                  {verification.documentHash?.slice(0, 20)}...
                </p>
              </div>
              <p className="text-white/30 text-xs line-clamp-2">
                {verification.aiExplanation?.slice(0, 120)}...
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`font-display text-2xl font-bold ${config.color}`}>
              {verification.overallRiskScore}
            </span>
            <span className="text-white/20 text-xs">/ 100</span>
            <div className="flex items-center gap-1 text-white/20 text-xs">
              <Clock className="w-3 h-3" />
              {new Date(verification.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Agent score strip */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {[
              { label: 'Fraud', score: fraudFinding?.score ?? 0 },
              { label: 'Compliance', score: complianceFinding?.score ?? 0 },
              { label: 'Flags', score: verification.fraudFlags?.length ?? 0 },
            ].map(({ label, score }) => (
              <div key={label} className="text-center">
                <p className="text-white/20 text-xs">{label}</p>
                <p className="text-white/60 text-sm font-mono font-medium">{score}</p>
              </div>
            ))}
          </div>
          <ArrowRight className="w-4 h-4 text-white/20" />
        </div>
      </GlassCard>
    </motion.div>
  );
}
