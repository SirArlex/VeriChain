import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Lock } from 'lucide-react';
import Badge from '../ui/Badge';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 bg-radial-glow" />

      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <Badge variant="blue" dot size="md">Mantle Turing Test Hackathon 2026</Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
        >
          AI-Powered Trust <span className="gradient-text">Infrastructure</span>
          <br />for Real World Assets
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Autonomous AI agents analyze real estate documents, detect fraud, compute risk scores,
          and store tamper-proof verification proofs on Mantle blockchain before tokenization.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={() => document.querySelector('#cta')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary flex items-center gap-2 px-8 py-3.5"
          >
            Start Verification <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3.5 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-all duration-200 font-semibold"
          >
            See How It Works
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
        >
          {[
            { icon: Shield, label: '5 AI Agents', sub: 'Specialized' },
            { icon: Zap, label: 'Real-time', sub: 'Analysis' },
            { icon: Lock, label: 'On-chain', sub: 'Proof Storage' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="glass-card p-4 text-center">
              <Icon className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-white font-semibold text-sm">{label}</p>
              <p className="text-white/40 text-xs">{sub}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
