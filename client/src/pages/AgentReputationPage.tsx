import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, RefreshCw } from 'lucide-react';
import RootLayout from '../layouts/RootLayout';
import AgentReputationCard from '../components/reputation/AgentReputationCard';
import AgentPerformanceChart from '../components/reputation/AgentPerformanceChart';
import VerificationStats from '../components/reputation/VerificationStats';
import { AgentService } from '../services/agent.service';
import { AgentReputationScore, SystemStats } from '../types/reputation';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';

export default function AgentReputationPage() {
  const [reputations, setReputations] = useState<AgentReputationScore[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [rep, st] = await Promise.all([
        AgentService.getReputation(),
        AgentService.getStats(),
      ]);
      setReputations(rep);
      setStats(st);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Failed to load agent data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const bestAgent = reputations.length
    ? reputations.reduce((best, r) => r.successRate > best.successRate ? r : best)
    : null;

  const fastestAgent = reputations.length
    ? reputations
        .filter((r) => r.totalRuns > 0)
        .reduce((fastest, r) =>
          r.averageExecutionTimeMs < fastest.averageExecutionTimeMs ? r : fastest
        )
    : null;

  return (
    <RootLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Link to="/" className="flex items-center gap-2 text-white/30 hover:text-white text-sm mb-6 transition-colors w-fit">
              <ArrowLeft className="w-4 h-4" />Back to Home
            </Link>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-purple-400" />
                  </div>
                  <h1 className="font-display text-3xl font-bold text-white">Agent Reputation</h1>
                </div>
                <p className="text-white/40 text-sm ml-11">
                  Real-time performance benchmarking for all 5 AI verification agents
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="purple" dot>Phase 7 — Benchmarking</Badge>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white text-sm transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <GlassCard key={i} className="p-4 h-24 animate-pulse" />)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => <GlassCard key={i} className="p-5 h-64 animate-pulse" />)}
              </div>
            </div>
          ) : error ? (
            <GlassCard className="p-8 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </GlassCard>
          ) : (
            <div className="space-y-8">

              {/* System Stats */}
              {stats && <VerificationStats stats={stats} />}

              {/* Highlight cards */}
              {(bestAgent || fastestAgent) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bestAgent && bestAgent.totalRuns > 0 && (
                    <GlassCard className="p-4 border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Brain className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Most Reliable Agent</p>
                          <p className="text-white font-semibold">{bestAgent.agentName.replace('_', ' ')}</p>
                          <p className="text-green-400 text-sm font-mono">{bestAgent.successRate}% success rate</p>
                        </div>
                      </div>
                    </GlassCard>
                  )}
                  {fastestAgent && fastestAgent.totalRuns > 0 && (
                    <GlassCard className="p-4 border border-cyan-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                          <Brain className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-white/40 text-xs">Fastest Agent</p>
                          <p className="text-white font-semibold">{fastestAgent.agentName.replace('_', ' ')}</p>
                          <p className="text-cyan-400 text-sm font-mono">
                            {fastestAgent.averageExecutionTimeMs >= 1000
                              ? `${(fastestAgent.averageExecutionTimeMs / 1000).toFixed(1)}s avg`
                              : `${fastestAgent.averageExecutionTimeMs}ms avg`}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  )}
                </div>
              )}

              {/* Performance Charts */}
              {reputations.some((r) => r.totalRuns > 0) && (
                <AgentPerformanceChart reputations={reputations} />
              )}

              {/* Agent Reputation Cards */}
              <div>
                <h2 className="text-white/40 text-sm uppercase tracking-wider font-mono mb-4">
                  Individual Agent Performance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reputations.map((rep, i) => (
                    <AgentReputationCard key={rep.agentName} reputation={rep} index={i} />
                  ))}
                </div>
              </div>

              {/* No data state */}
              {reputations.every((r) => r.totalRuns === 0) && (
                <GlassCard className="p-12 text-center">
                  <Brain className="w-8 h-8 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 font-medium mb-1">No agent runs yet</p>
                  <p className="text-white/20 text-sm mb-4">
                    Run verifications on the dashboard to populate agent performance data
                  </p>
                  <Link to="/dashboard">
                    <button className="btn-primary text-sm px-4 py-2">Go to Dashboard</button>
                  </Link>
                </GlassCard>
              )}
            </div>
          )}
        </div>
      </div>
    </RootLayout>
  );
}
