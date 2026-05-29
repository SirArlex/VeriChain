import { Link, Shield, Eye, Clock } from 'lucide-react';
import AnimatedSection from '../ui/AnimatedSection';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

const features = [
  {
    icon: Shield,
    title: 'Tamper-Proof Proofs',
    description: 'Document hash + risk score + agent outputs stored permanently. Nobody can alter a verification record after it is written.',
  },
  {
    icon: Eye,
    title: 'Publicly Verifiable',
    description: 'Any investor, regulator, or platform can independently verify a document\'s due diligence status on-chain — no trust required.',
  },
  {
    icon: Clock,
    title: 'Timestamped Forever',
    description: 'Every verification is timestamped at the block level. The exact moment of verification is permanently recorded.',
  },
  {
    icon: Link,
    title: 'Mantle Explorer',
    description: 'Every transaction is visible on the Mantle Sepolia explorer. Full transparency for all verification proofs.',
  },
];

export default function OnChainSection() {
  return (
    <section id="onchain" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="cyan" dot className="mb-4">On-Chain Transparency</Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Verification Proofs Stored on{' '}
            <span className="gradient-text">Mantle</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            AI outputs are not kept in a black box. Every verification proof is
            written on-chain — permanently, publicly, and immutably.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.1}>
                <GlassCard className="p-5 h-full" hover>
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                    <f.icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-2">{f.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{f.description}</p>
                </GlassCard>
              </AnimatedSection>
            ))}
          </div>

          {/* Right: mock transaction card */}
          <AnimatedSection direction="left" delay={0.2}>
            <GlassCard className="p-6 border border-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="green" dot>Confirmed on Mantle</Badge>
                <span className="text-white/30 text-xs font-mono">Block #4829103</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {[
                  { label: 'Tx Hash', value: '0x3f8a...c92d', color: 'text-blue-400' },
                  { label: 'Document Hash', value: '0xab12...ef90', color: 'text-cyan-400' },
                  { label: 'Risk Score', value: '23 / 100 (LOW)', color: 'text-green-400' },
                  { label: 'Status', value: 'VERIFIED', color: 'text-green-400' },
                  { label: 'Agent Hash', value: '0x7c3d...1a2b', color: 'text-purple-400' },
                  { label: 'Timestamp', value: '2026-05-23 14:32:11 UTC', color: 'text-white/60' },
                  { label: 'Network', value: 'Mantle Sepolia (5003)', color: 'text-amber-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-white/30">{label}</span>
                    <span className={color}>{value}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://explorer.sepolia.mantle.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs font-mono transition-colors"
              >
                <Link className="w-3 h-3" />
                View on Mantle Explorer
              </a>
            </GlassCard>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
