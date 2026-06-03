import { AlertTriangle, FileX, TrendingDown, Globe } from 'lucide-react';
import AnimatedSection from '../ui/AnimatedSection';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

const problems = [
  {
    icon: FileX,
    title: 'Unverified Documents',
    description: 'RWA tokenization relies on paper documents that are trivially forged, altered, or misrepresented — with no automated verification layer.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    icon: AlertTriangle,
    title: 'Fraud at Scale',
    description: 'Title deed fraud, duplicate property listings, and ownership spoofing cost the global real estate market billions annually.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: TrendingDown,
    title: 'No Standardized Risk Scoring',
    description: 'Investors tokenizing RWAs have no objective, on-chain risk score to reference — due diligence is manual, slow, and inconsistent.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Globe,
    title: 'Trust Deficit',
    description: 'Without transparent, tamper-proof verification records, institutional confidence in RWA tokenization remains critically low.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="red" dot className="mb-4">The Problem</Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            RWA Tokenization Has a{' '}
            <span className="text-red-400">Trust Crisis</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Trillions in real-world assets are being tokenized with little to no
            automated verification infrastructure. This is a systemic risk.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((problem, i) => (
            <AnimatedSection key={problem.title} delay={i * 0.1}>
              <GlassCard className="p-6 h-full" hover glow="none">
                <div className={`w-10 h-10 rounded-lg ${problem.bg} flex items-center justify-center mb-4`}>
                  <problem.icon className={`w-5 h-5 ${problem.color}`} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{problem.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{problem.description}</p>
              </GlassCard>
            </AnimatedSection>
          ))}
        </div>

        {/* Stats bar */}
        <AnimatedSection delay={0.4} className="mt-12">
          <GlassCard className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '$16T', label: 'RWA market by 2030' },
                { value: '68%', label: 'Lack verification standards' },
                { value: '$3.1B', label: 'Lost to deed fraud annually' },
                { value: '0', label: 'On-chain AI verification systems' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display text-3xl font-bold gradient-text mb-1">{value}</p>
                  <p className="text-white/40 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </AnimatedSection>
      </div>
    </section>
  );
}
