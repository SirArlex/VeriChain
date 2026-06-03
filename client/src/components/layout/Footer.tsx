import { Shield, Github, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface-900 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-white">
              Veri<span className="gradient-text">Chain</span>
            </span>
          </div>
          <p className="text-white/30 text-sm text-center">
            AI Due-Diligence Infrastructure for Real World Assets · Built for Mantle Turing Test Hackathon 2026
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs font-mono">© 2026 VeriChain. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="text-white/20 text-xs font-mono">Powered by</span>
            <span className="text-blue-400 text-xs font-mono font-semibold">Mantle Network</span>
            <span className="text-white/20 text-xs font-mono">+</span>
            <span className="text-purple-400 text-xs font-mono font-semibold">Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
