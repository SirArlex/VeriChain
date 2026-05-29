import { AgentName } from './index';

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
    low: number;
    medium: number;
    high: number;
    critical: number;
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
