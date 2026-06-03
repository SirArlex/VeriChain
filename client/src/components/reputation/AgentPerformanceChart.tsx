import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { AgentReputationScore } from '../../types/reputation';
import { AgentName } from '../../types';
import GlassCard from '../ui/GlassCard';

interface AgentPerformanceChartProps {
  reputations: AgentReputationScore[];
}

const AGENT_LABELS: Record<AgentName, string> = {
  METADATA: 'Metadata',
  OWNERSHIP: 'Ownership',
  COMPLIANCE: 'Compliance',
  FRAUD_DETECTION: 'Fraud',
  RISK_SCORING: 'Risk',
};

const AGENT_COLORS: Record<AgentName, string> = {
  METADATA: '#22d3ee',
  OWNERSHIP: '#60a5fa',
  COMPLIANCE: '#a78bfa',
  FRAUD_DETECTION: '#f87171',
  RISK_SCORING: '#4ade80',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-700 border border-white/10 rounded-lg px-3 py-2 text-xs space-y-1">
      <p className="text-white font-semibold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value >= 1000
            ? `${(p.value / 1000).toFixed(1)}s`
            : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AgentPerformanceChart({ reputations }: AgentPerformanceChartProps) {
  const successData = reputations.map((r) => ({
    name: AGENT_LABELS[r.agentName],
    'Success Rate': r.successRate,
    'Avg Score': r.averageScore,
    fill: AGENT_COLORS[r.agentName],
  }));

  const speedData = reputations.map((r) => ({
    name: AGENT_LABELS[r.agentName],
    'Avg Time (ms)': r.averageExecutionTimeMs,
    fill: AGENT_COLORS[r.agentName],
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Success Rate Chart */}
      <GlassCard className="p-5">
        <h3 className="text-white font-semibold mb-4">Success Rate by Agent</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={successData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="Success Rate" radius={[4, 4, 0, 0]} fill="#60a5fa" fillOpacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Execution Time Chart */}
      <GlassCard className="p-5">
        <h3 className="text-white font-semibold mb-4">Average Execution Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={speedData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="Avg Time (ms)" radius={[4, 4, 0, 0]} fill="#a78bfa" fillOpacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}
