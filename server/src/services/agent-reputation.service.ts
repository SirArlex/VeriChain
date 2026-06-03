import { AgentLog } from '../models/AgentLog';
import { Verification } from '../models/Verification';
import { AgentName } from '../types';

export interface AgentReputationScore {
  agentName: AgentName;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  successRate: number;
  averageExecutionTimeMs: number;
  averageScore: number;
  totalFlagsRaised: number;
  averageFlagsPerRun: number;
  scoreDistribution: {
    low: number;    // 0-24
    medium: number; // 25-49
    high: number;   // 50-74
    critical: number; // 75-100
  };
  lastActiveAt: string | null;
}

export interface SystemStats {
  totalVerifications: number;
  completedVerifications: number;
  failedVerifications: number;
  averageRiskScore: number;
  tokenizationReadyCount: number;
  onChainProofsCount: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  verificationsByDay: { date: string; count: number }[];
}

const AGENT_NAMES: AgentName[] = [
  'METADATA',
  'OWNERSHIP',
  'COMPLIANCE',
  'FRAUD_DETECTION',
  'RISK_SCORING',
];

/**
 * AgentReputationService — computes per-agent performance metrics
 * from the AgentLog collection populated during Phase 4 verifications.
 *
 * All data comes from real agent runs — no mock data.
 */
export class AgentReputationService {
  /**
   * Computes reputation scores for all 5 agents.
   * Aggregates from AgentLog collection using MongoDB aggregation pipeline.
   */
  static async getAgentReputations(): Promise<AgentReputationScore[]> {
    const results: AgentReputationScore[] = [];

    for (const agentName of AGENT_NAMES) {
      const logs = await AgentLog.find({ agentName }).sort({ createdAt: -1 });

      if (logs.length === 0) {
        results.push({
          agentName,
          totalRuns: 0,
          successfulRuns: 0,
          failedRuns: 0,
          successRate: 0,
          averageExecutionTimeMs: 0,
          averageScore: 0,
          totalFlagsRaised: 0,
          averageFlagsPerRun: 0,
          scoreDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
          lastActiveAt: null,
        });
        continue;
      }

      const successfulLogs = logs.filter((l) => l.status === 'COMPLETED');
      const failedLogs = logs.filter((l) => l.status === 'FAILED');

      // Get agent findings from verifications for score data
      const verifications = await Verification.find({
        'agentFindings.agentName': agentName,
        status: 'COMPLETED',
      }).select('agentFindings createdAt');

      const findings = verifications
        .flatMap((v) => v.agentFindings)
        .filter((f) => f.agentName === agentName);

      const scores = findings.map((f) => f.score);
      const averageScore = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

      const totalFlags = findings.reduce((sum, f) => sum + (f.flags?.length ?? 0), 0);

      const scoreDistribution = {
        low: scores.filter((s) => s < 25).length,
        medium: scores.filter((s) => s >= 25 && s < 50).length,
        high: scores.filter((s) => s >= 50 && s < 75).length,
        critical: scores.filter((s) => s >= 75).length,
      };

      const avgExecutionTime = logs.length
        ? Math.round(logs.reduce((sum, l) => sum + l.executionTimeMs, 0) / logs.length)
        : 0;

      results.push({
        agentName,
        totalRuns: logs.length,
        successfulRuns: successfulLogs.length,
        failedRuns: failedLogs.length,
        successRate: logs.length ? Math.round((successfulLogs.length / logs.length) * 100) : 0,
        averageExecutionTimeMs: avgExecutionTime,
        averageScore,
        totalFlagsRaised: totalFlags,
        averageFlagsPerRun: findings.length
          ? Math.round((totalFlags / findings.length) * 10) / 10
          : 0,
        scoreDistribution,
        lastActiveAt: logs[0]?.createdAt?.toISOString() ?? null,
      });
    }

    return results;
  }

  /**
   * Computes system-wide verification statistics.
   */
  static async getSystemStats(): Promise<SystemStats> {
    const [total, completed, failed, onChain] = await Promise.all([
      Verification.countDocuments(),
      Verification.countDocuments({ status: 'COMPLETED' }),
      Verification.countDocuments({ status: 'FAILED' }),
      Verification.countDocuments({ onChainTxHash: { $exists: true, $ne: null } }),
    ]);

    const completedVerifications = await Verification.find({ status: 'COMPLETED' })
      .select('overallRiskScore overallRiskLevel tokenizationReady createdAt');

    const scores = completedVerifications.map((v) => v.overallRiskScore);
    const averageRiskScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const tokenizationReadyCount = completedVerifications.filter((v) => v.tokenizationReady).length;

    const riskDistribution = {
      low: completedVerifications.filter((v) => v.overallRiskLevel === 'LOW').length,
      medium: completedVerifications.filter((v) => v.overallRiskLevel === 'MEDIUM').length,
      high: completedVerifications.filter((v) => v.overallRiskLevel === 'HIGH').length,
      critical: completedVerifications.filter((v) => v.overallRiskLevel === 'CRITICAL').length,
    };

    // Group verifications by day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentVerifications = await Verification.find({
      createdAt: { $gte: sevenDaysAgo },
    }).select('createdAt');

    const byDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      byDay[key] = 0;
    }
    recentVerifications.forEach((v) => {
      const key = v.createdAt.toISOString().split('T')[0];
      if (byDay[key] !== undefined) byDay[key]++;
    });

    const verificationsByDay = Object.entries(byDay).map(([date, count]) => ({ date, count }));

    return {
      totalVerifications: total,
      completedVerifications: completed,
      failedVerifications: failed,
      averageRiskScore,
      tokenizationReadyCount,
      onChainProofsCount: onChain,
      riskDistribution,
      verificationsByDay,
    };
  }
}
