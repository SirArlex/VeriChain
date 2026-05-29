import { Upload, Cpu, BarChart3, Link, CheckCircle } from 'lucide-react';
import AnimatedSection from '../ui/AnimatedSection';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Document',
    description: 'User uploads a real estate document (PDF or image). The file is hashed and stored securely.',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/10',
  },
  {
    step: '02',
    icon: Cpu,
    title: 'OCR + AI Extraction',
    description: 'Tesseract OCR extracts all text. Gemini AI reads and understands the document structure and content.',
    color: 'text-cyan-400',
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/10',
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'Multi-Agent Analysis',
    description: '5 specialized AI agents run in parallel: Metadata, Ownership, Compliance, Fraud Detection, and Risk Scoring.',
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/10',
  },
  {
    step: '04',
    icon: CheckCircle,
    title: 'Risk Score + Verdict',
    description: 'Agents aggregate findings into a final risk score (0-100), fraud flags, and compliance readiness status.',
    color: 'text-green-400',
    border: 'border-green-500/20',
    bg: 'bg-green-500/10',
  },
  {
    step: '05',
    icon: Link,
    title: 'On-Chain Proof',
    description: 'The verification proof (hash, score, agent outputs) is stored permanently on Mantle blockchain.',
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="blue" dot className="mb-4">How It Works</Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            End-to-End Verification{' '}
            <span className="gradient-text">Pipeline</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            From raw document to tamper-proof blockchain proof in minutes, not days.
          </p>
        </AnimatedSection>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-blue-500/0 via-blue-500/30 to-blue-500/0 -translate-x-1/2" />

          <div className="space-y-6">
            {steps.map((step, i) => (
              <AnimatedSection key={step.step} delay={i * 0.1} direction={i % 2 === 0 ? 'left' : 'right'}>
                <div className={`flex items-start gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <GlassCard className={`p-6 flex-1 border ${step.border}`} hover>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg ${step.bg} flex items-center justify-center flex-shrink-0`}>
                        <step.icon className={`w-5 h-5 ${step.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-mono text-xs font-bold ${step.color}`}>STEP {step.step}</span>
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                        <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </GlassCard>
                  <div className="hidden md:flex w-12 h-12 rounded-full bg-surface-700 border border-white/10 items-center justify-center flex-shrink-0 mt-3 z-10">
                    <span className={`font-mono text-xs font-bold ${step.color}`}>{step.step}</span>
                  </div>
                  <div className="flex-1 hidden md:block" />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
