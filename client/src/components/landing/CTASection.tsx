import { ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AnimatedSection from '../ui/AnimatedSection';
import Badge from '../ui/Badge';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section id="cta" className="py-24 relative overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-[600px] h-[600px] bg-blue-600 rounded-full blur-[150px]" />
      </motion.div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <AnimatedSection>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-glow-blue">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <Badge variant="blue" dot size="md" className="mb-6">Now Live on Mantle Sepolia</Badge>

          <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
            Verify Before You <span className="gradient-text">Tokenize</span>
          </h2>

          <p className="text-white/50 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Upload your first real estate document and see VeriChain's AI agents
            analyze it in real time. Free to try. No wallet required to explore.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary flex items-center gap-2 px-10 py-4 text-base"
            >
              Launch Verification Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="https://explorer.sepolia.mantle.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all duration-200 font-semibold text-base"
            >
              View on Mantle Explorer
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-white/25 text-xs font-mono">
            <span>✓ No mock data</span>
            <span>✓ Real Gemini AI</span>
            <span>✓ Real Mantle transactions</span>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
