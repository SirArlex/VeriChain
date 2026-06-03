import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Shield, CheckCircle, Link, TrendingUp, AlertTriangle } from 'lucide-react';
import { SystemStats } from '../../types/reputation';
import GlassCard from '../ui/GlassCard';

interface VerificationStatsProps {
  stats: SystemStats;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-700 border border-white/10 rounded-lg px-3 py-2 text-xs">
      <p className="text-white/60">{label}</p>
      <p className="text-white font-semibold">{payload[0].value} verification{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

export default function VerificationStats({ stats }: VerificationStatsProps) {
  const statCards = [
    {
      icon: Shield,
      label: 'Total Verifications',
      value: stats.totalVerifications,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: CheckCircle,
      label: 'Tokenization Ready',
      value: stats.tokenizationReadyCount,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      icon: Link,
      label: 'On-Chain Proofs',
      value: stats.onChainProofsCount,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Avg Risk Score',
      value: `${stats.averageRiskScore}/100`,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];

  const riskData = [
    { name: 'LOW', value: stats.riskDistribution.low, color: '#22c55e' },
    { name: 'MEDIUM', value: stats.riskDistribution.medium, color: '#eab308' },
    { name: 'HIGH', value: stats.riskDistribution.high, color: '#f97316' },
    { name: 'CRITICAL', value: stats.riskDistribution.critical, color: '#ef4444' },
  ];

  const chartData = stats.verificationsByDay.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: d.count,
  }));

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="p-4">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-white/30 text-xs mt-1">{label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verifications by day */}
        <GlassCard className="p-5">
          <h3 className="text-white font-semibold mb-4">Verifications — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" fill="#0066ff" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Risk distribution */}
        <GlassCard className="p-5">
          <h3 className="text-white font-semibold mb-4">Risk Level Distribution</h3>
          <div className="space-y-3">
            {riskData.map(({ name, value, color }) => {
              const pct = stats.completedVerifications > 0
                ? Math.round((value / stats.completedVerifications) * 100)
                : 0;
              return (
                <div key={name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-white/50 text-xs font-mono">{name}</span>
                    <span className="text-white/50 text-xs font-mono">{value} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Failed verifications warning */}
          {stats.failedVerifications > 0 && (
            <div className="mt-4 flex items-center gap-2 text-amber-400/70 text-xs">
              <AlertTriangle className="w-3 h-3" />
              <span>{stats.failedVerifications} failed verification{stats.failedVerifications > 1 ? 's' : ''}</span>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
