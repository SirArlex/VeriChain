import { Zap, Users, Building, Globe } from 'lucide-react';
import AnimatedSection from '../ui/AnimatedSection';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

const audiences = [
  {
    icon: Building,
    title: 'RWA Tokenization Platforms',
    description: 'Integrate VeriChain as a mandatory pre-tokenization verification gate. Ship with built-in trust.',
    benefit: 'Reduce fraud liability by 90%',
  },
  {
    icon: Users,
    title: 'Institutional Investors',
    description: 'Get objective, on-chain risk scores before allocating capital to tokenized real estate.',
    benefit: 'Data-driven investment decisions',
  },
  {
    icon: Globe,
    title: 'Regulators & Auditors',
    description: 'Access immutable verification trails for any tokenized asset. Compliance verification in seconds.',
    benefit: 'Full audit trail on-chain',
  },
  {
    icon: Zap,
    title: 'DeFi Protocols',
    description: 'Use VeriChain risk scores as collateral quality signals for RWA-backed lending protocols.',
    benefit: 'Programmatic risk assessment',
  },
];

export default function WhyVeriChainSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="green" dot className="mb-4">Why VeriChain</Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Built for the{' '}
            <span className="gradient-text">Entire RWA Ecosystem</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            VeriChain is not a product for one user type. It is infrastructure
            that every participant in the RWA ecosystem depends on.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {audiences.map((a, i) => (
            <AnimatedSection key={a.title} delay={i * 0.1}>
              <GlassCard className="p-6 h-full" hover glow="blue">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <a.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-2">{a.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-3">{a.description}</p>
                    <Badge variant="green" size="sm">{a.benefit}</Badge>
                  </div>
                </div>
              </GlassCard>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
