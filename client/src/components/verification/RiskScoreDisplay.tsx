import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle } from 'lucide-react';
import { RiskLevel } from '../../types';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

interface RiskScoreDisplayProps {
  score: number;
  riskLevel: RiskLevel;
  tokenizationReady: boolean;
  fraudFlags: string[];
}

const riskConfig = {
  LOW: {
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    glow: 'shadow-glow-green',
    icon: ShieldCheck,
    label: 'Low Risk',
    badge: 'green' as const,
  },
  MEDIUM: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: '',
    icon: ShieldAlert,
    label: 'Medium Risk',
    badge: 'amber' as const,
  },
  HIGH: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    glow: 'shadow-glow-red',
    icon: ShieldX,
    label: 'High Risk',
    badge: 'red' as const,
  },
  CRITICAL: {
    color: 'text-red-500',
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
    glow: 'shadow-glow-red',
    icon: ShieldX,
    label: 'Critical Risk',
    badge: 'red' as const,
  },
};

export default function RiskScoreDisplay({
  score,
  riskLevel,
  tokenizationReady,
  fraudFlags,
}: RiskScoreDisplayProps) {
  const config = riskConfig[riskLevel];
  const Icon = config.icon;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Score circle */}
      <GlassCard className={`p-6 border ${config.border} ${config.glow}`}>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke={riskLevel === 'LOW' ? '#22c55e' : riskLevel === 'MEDIUM' ? '#eab308' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`font-display text-2xl font-bold ${config.color}`}>{score}</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-5 h-5 ${config.color}`} />
              <span className={`font-semibold ${config.color}`}>{config.label}</span>
            </div>
            <p className="text-white/40 text-sm mb-3">
              Risk Score: {score}/100
            </p>
            <Badge
              variant={tokenizationReady ? 'green' : 'red'}
              dot
              size="sm"
            >
              {tokenizationReady ? 'Tokenization Ready' : 'Review Required'}
            </Badge>
          </div>
        </div>
      </GlassCard>

      {/* Fraud flags */}
      {fraudFlags.length > 0 && (
        <GlassCard className="p-4 border border-red-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm font-semibold">
              {fraudFlags.length} Flag{fraudFlags.length > 1 ? 's' : ''} Raised
            </p>
          </div>
          <div className="space-y-1.5">
            {fraudFlags.map((flag) => (
              <div key={flag} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-red-400/60" />
                <span className="text-white/50 text-xs font-mono">{flag}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {fraudFlags.length === 0 && (
        <GlassCard className="p-4 border border-green-500/20">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <p className="text-green-400 text-sm font-semibold">No Fraud Flags Detected</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
