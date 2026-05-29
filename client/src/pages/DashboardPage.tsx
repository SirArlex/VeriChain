import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import UploadZone from '../components/verification/UploadZone';
import DocumentPreview from '../components/verification/DocumentPreview';
import VerificationResultComponent from '../components/verification/VerificationResult';
import AgentActivityFeed from '../components/verification/AgentActivityFeed';
import StoreOnChain from '../components/verification/StoreOnChain';
import { UploadedDocument } from '../services/document.service';
import { useVerification } from '../hooks/useVerification';
import Badge from '../components/ui/Badge';
import GlassCard from '../components/ui/GlassCard';

export default function DashboardPage() {
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocument | null>(null);
  const { verificationState, verificationResult, error, startVerification } = useVerification();

  const handleUploadComplete = (doc: UploadedDocument) => setUploadedDoc(doc);

  const handleRunVerification = async () => {
    if (!uploadedDoc) return;
    await startVerification(uploadedDoc.documentId);
  };

  const isRunning = verificationState === 'running';
  const isCompleted = verificationState === 'completed';
  const isError = verificationState === 'error';

  return (
    <RootLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Link to="/" className="flex items-center gap-2 text-white/30 hover:text-white text-sm mb-6 transition-colors w-fit">
              <ArrowLeft className="w-4 h-4" />Back to Home
            </Link>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </div>
                  <h1 className="font-display text-3xl font-bold text-white">Verification Dashboard</h1>
                </div>
                <p className="text-white/40 text-sm ml-11">Upload a real estate document to begin AI-powered due diligence</p>
              </div>
              <Badge variant="blue" dot>Phase 6 — Mantle Integration</Badge>
            </div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left column */}
            <div className="space-y-4">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <GlassCard className="p-6">
                  <h2 className="text-white font-semibold mb-1">Upload Document</h2>
                  <p className="text-white/30 text-sm mb-6">PDF or image — OCR extraction runs automatically</p>
                  <UploadZone onUploadComplete={handleUploadComplete} />
                </GlassCard>
              </motion.div>

              {uploadedDoc && !isCompleted && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <GlassCard className="p-6">
                    <DocumentPreview document={uploadedDoc} />
                    <div className="mt-6 pt-6 border-t border-white/5">
                      {isError && (
                        <div className="flex items-center gap-2 mb-3 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4" /><span>{error}</span>
                        </div>
                      )}
                      <button
                        onClick={handleRunVerification}
                        disabled={isRunning}
                        className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRunning ? (
                          <><Loader2 className="w-4 h-4 animate-spin" />Running AI Verification Pipeline...</>
                        ) : (
                          <><Shield className="w-4 h-4" />Run AI Verification</>
                        )}
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Store on Mantle — shown after verification completes */}
              {isCompleted && verificationResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <StoreOnChain result={verificationResult} />
                </motion.div>
              )}
            </div>

            {/* Right column */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              {isCompleted && verificationResult ? (
                <GlassCard className="p-6">
                  <VerificationResultComponent result={verificationResult} />
                </GlassCard>
              ) : isRunning ? (
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    <div>
                      <p className="text-white font-semibold">AI Pipeline Running</p>
                      <p className="text-white/40 text-sm">5 agents analyzing your document...</p>
                    </div>
                  </div>
                  <AgentActivityFeed findings={[]} isRunning={true} />
                </GlassCard>
              ) : (
                <GlassCard className="p-6 h-full flex flex-col items-center justify-center text-center min-h-[300px]">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-white/30 font-medium mb-1">
                    {uploadedDoc ? 'Ready to Verify' : 'No Document Yet'}
                  </p>
                  <p className="text-white/20 text-sm">
                    {uploadedDoc ? 'Click "Run AI Verification" to start the agent pipeline' : 'Upload a document on the left to begin'}
                  </p>
                </GlassCard>
              )}
            </motion.div>
          </div>

          {/* Pipeline status bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
            <GlassCard className="p-4">
              <div className="flex items-center gap-3 overflow-x-auto">
                {[
                  { label: 'Upload', done: !!uploadedDoc, active: !uploadedDoc },
                  { label: 'OCR Extract', done: !!uploadedDoc, active: false },
                  { label: 'Rule Engine', done: isCompleted, active: isRunning },
                  { label: 'AI Agents', done: isCompleted, active: isRunning },
                  { label: 'Risk Score', done: isCompleted, active: isRunning },
                  { label: 'On-Chain Proof', done: !!verificationResult?.onChainTxHash, active: isCompleted && !verificationResult?.onChainTxHash },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${step.done ? 'bg-green-400' : step.active ? 'bg-blue-400 animate-pulse' : 'bg-white/10'}`} />
                      <span className={`text-xs font-mono ${step.done ? 'text-green-400' : step.active ? 'text-blue-400' : 'text-white/20'}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < 5 && <div className="w-6 h-px bg-white/10" />}
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </RootLayout>
  );
}
