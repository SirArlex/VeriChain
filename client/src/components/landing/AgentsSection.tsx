import { Brain, FileSearch, Scale, AlertOctagon, TrendingUp } from 'lucide-react';
import AnimatedSection from '../ui/AnimatedSection';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

const agents = [
  {
    icon: FileSearch,
    name: 'Metadata Agent',
    id: 'METADATA',
    role: 'Tampering Detection',
    description: 'Scans document metadata for anomalies — creation dates, modification timestamps, author fields, and digital fingerprints that indicate tampering.',
    flags: ['Date inconsistencies', 'Modified metadata', 'Suspicious authoring tools'],
    color: 'cyan',
  },
  {
    icon: Scale,
    name: 'Ownership Agent',
    id: 'OWNERSHIP',
    role: 'Ownership Verification',
    description: 'Validates ownership chain consistency, cross-references registry alignment, and detects ownership transfer anomalies or gaps.',
    flags: ['Chain of title gaps', 'Registry mismatches', 'Undisclosed liens'],
    color: 'blue',
  },
  {
    icon: Brain,
    name: 'Compliance Agent',
    id: 'COMPLIANCE',
    role: 'Tokenization Readiness',
    description: 'Checks document completeness, regulatory compliance markers, and tokenization readiness based on jurisdiction-specific rules.',
    flags: ['Missing required fields', 'Regulatory gaps', 'Incomplete disclosures'],
    color: 'purple',
  },
  {
    icon: AlertOctagon,
    name: 'Fraud Detection Agent',
    id: 'FRAUD',
    role: 'Fraud Pattern Analysis',
    description: 'Detects suspicious document structures, duplicate patterns, AI-generated content markers, and known fraud templates.',
    flags: ['Duplicate document patterns', 'Forged signatures', 'AI-generated content'],
    color: 'red',
  },
  {
    icon: TrendingUp,
    name: 'Risk Scoring Agent',
    id: 'RISK',
    role: 'Score Aggregation',
    description: 'Aggregates all agent findings into a final composite risk score (0-100) with weighted inputs and confidence intervals.',
    flags: ['Final risk score', 'Confidence level', 'Tokenization verdict'],
    color: 'green',
  },
];

const colorMap: Record<string, { badge: 'cyan' | 'blue' | 'purple' | 'red' | 'green', bg: string, text: string, border: string }> = {
  cyan: { badge: 'cyan', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  blue: { badge: 'blue', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  purple: { badge: 'purple', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  red: { badge: 'red', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  green: { badge: 'green', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
};

export default function AgentsSection() {
  return (
    <section id="agents" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="purple" dot className="mb-4">AI Agent Ecosystem</Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            5 Specialized{' '}
            <span className="gradient-text">Verification Agents</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Each agent is purpose-built for a specific verification domain.
            They run in parallel and cross-validate each other's findings.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, i) => {
            const c = colorMap[agent.color];
            return (
              <AnimatedSection key={agent.id} delay={i * 0.08}>
                <GlassCard className={`p-6 h-full border ${c.border}`} hover glow={agent.color as any}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                      <agent.icon className={`w-5 h-5 ${c.text}`} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{agent.name}</h3>
                      <Badge variant={c.badge} size="sm">{agent.role}</Badge>
                    </div>
                  </div>

                  <p className="text-white/50 text-sm leading-relaxed mb-4">{agent.description}</p>

                  <div className="space-y-1.5">
                    {agent.flags.map((flag) => (
                      <div key={flag} className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full ${c.bg.replace('/10', '/60')}`} />
                        <span className="text-white/40 text-xs font-mono">{flag}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5">
                    <span className={`font-mono text-xs ${c.text} opacity-60`}>AGENT::{agent.id}</span>
                  </div>
                </GlassCard>
              </AnimatedSection>
            );
          })}

          {/* 5 agents, last card spans to fill */}
          <AnimatedSection delay={0.4} className="md:col-span-2 lg:col-span-1">
            <GlassCard className="p-6 h-full border border-white/5 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <span className="font-display text-2xl font-bold gradient-text">5</span>
              </div>
              <p className="text-white/60 font-semibold mb-1">Agents Running in Parallel</p>
              <p className="text-white/30 text-sm">Cross-validating findings for maximum accuracy</p>
            </GlassCard>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
