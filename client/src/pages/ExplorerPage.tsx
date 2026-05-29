import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import VerificationCard from '../components/verification/VerificationCard';
import { VerificationService } from '../services/verification.service';
import { VerificationResult, RiskLevel } from '../types';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';

type FilterLevel = 'ALL' | RiskLevel;

export default function ExplorerPage() {
  const [verifications, setVerifications] = useState<VerificationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterLevel>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    VerificationService.list()
      .then((data) => setVerifications(data))
      .catch((err) => setError(err?.response?.data?.error ?? 'Failed to load verifications'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = verifications.filter((v) => {
    const matchesFilter = filter === 'ALL' || v.overallRiskLevel === filter;
    const matchesSearch = !search ||
      v.verificationId.toLowerCase().includes(search.toLowerCase()) ||
      v.documentHash.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    ALL: verifications.length,
    LOW: verifications.filter((v) => v.overallRiskLevel === 'LOW').length,
    MEDIUM: verifications.filter((v) => v.overallRiskLevel === 'MEDIUM').length,
    HIGH: verifications.filter((v) => v.overallRiskLevel === 'HIGH').length,
    CRITICAL: verifications.filter((v) => v.overallRiskLevel === 'CRITICAL').length,
  };

  const avgScore = verifications.length
    ? Math.round(verifications.reduce((sum, v) => sum + v.overallRiskScore, 0) / verifications.length)
    : 0;

  return (
    <RootLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Link to="/" className="flex items-center gap-2 text-white/30 hover:text-white text-sm mb-6 transition-colors w-fit">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </div>
                  <h1 className="font-display text-3xl font-bold text-white">Verification Explorer</h1>
                </div>
                <p className="text-white/40 text-sm ml-11">Browse all on-chain verification records</p>
              </div>
              <Link to="/dashboard">
                <button className="btn-primary text-sm px-4 py-2">New Verification</button>
              </Link>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Verifications', value: counts.ALL, color: 'text-white' },
                { label: 'Avg Risk Score', value: avgScore, color: 'text-blue-400' },
                { label: 'High/Critical', value: counts.HIGH + counts.CRITICAL, color: 'text-red-400' },
                { label: 'Tokenization Ready', value: verifications.filter((v) => v.tokenizationReady).length, color: 'text-green-400' },
              ].map(({ label, value, color }) => (
                <GlassCard key={label} className="p-4 text-center">
                  <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-white/30 text-xs mt-1">{label}</p>
                </GlassCard>
              ))}
            </div>
          </motion.div>

          {/* Search + Filter */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search by verification ID or document hash..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-white/30" />
              {(['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as FilterLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                    filter === level
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'
                  }`}
                >
                  {level} ({counts[level]})
                </button>
              ))}
            </div>
          </motion.div>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <GlassCard key={i} className="p-5 h-24 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <GlassCard className="p-8 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </GlassCard>
          ) : filtered.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Shield className="w-8 h-8 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 font-medium">No verifications found</p>
              <p className="text-white/20 text-sm mt-1">
                {search || filter !== 'ALL' ? 'Try adjusting your filters' : 'Upload a document to run your first verification'}
              </p>
              <Link to="/dashboard" className="inline-block mt-4 btn-primary text-sm px-4 py-2">
                Start Verification
              </Link>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {filtered.map((v, i) => (
                <VerificationCard key={v.verificationId} verification={v} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </RootLayout>
  );
}
