import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { VerificationResult } from '../../types';
import GlassCard from '../ui/GlassCard';

interface RiskBreakdownChartProps {
  result: VerificationResult;
}

const AGENT_LABELS: Record<string, string> = {
  METADATA: 'Metadata',
  OWNERSHIP: 'Ownership',
  COMPLIANCE: 'Compliance',
  FRAUD_DETECTION: 'Fraud',
  RISK_SCORING: 'Overall',
};

function scoreToColor(score: number): string {
  if (score < 25) return '#22c55e';
  if (score < 50) return '#eab308';
  if (score < 75) return '#f97316';
  return '#ef4444';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-700 border border-white/10 rounded-lg px-3 py-2 text-xs">
      <p className="text-white font-semibold mb-1">{label}</p>
      <p className="text-white/60">Score: <span className="text-white font-mono">{payload[0].value}/100</span></p>
    </div>
  );
};

export default function RiskBreakdownChart({ result }: RiskBreakdownChartProps) {
  const data = result.agentFindings?.map((f) => ({
    name: AGENT_LABELS[f.agentName] ?? f.agentName,
    score: f.score,
    color: scoreToColor(f.score),
  })) ?? [];

  return (
    <GlassCard className="p-5">
      <h3 className="text-white font-semibold mb-4">Agent Risk Breakdown</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 justify-center">
        {[
          { label: 'Low (0-24)', color: '#22c55e' },
          { label: 'Medium (25-49)', color: '#eab308' },
          { label: 'High (50-74)', color: '#f97316' },
          { label: 'Critical (75+)', color: '#ef4444' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-white/30 text-xs">{label}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
