import { AgentFinding, AgentName, AgentStatus, RiskLevel } from '../types';
import { AgentLog } from '../models/AgentLog';
import { RuleEngineOutput } from '../rule-engine/rules.engine';

export interface AgentContext {
  verificationId: string;
  documentId: string;
  documentHash: string;
  extractedText: string;
  fileName: string;
  fileSize: number;
  ruleEngineOutput: RuleEngineOutput;
}

/**
 * BaseAgent — abstract class all agents extend.
 *
 * Handles:
 * - Execution timing
 * - AgentLog persistence
 * - Error handling and fallback
 * - Consistent output structure
 *
 * Each concrete agent implements analyze() only.
 * The run() method handles all orchestration boilerplate.
 */
export abstract class BaseAgent {
  abstract readonly agentName: AgentName;

  abstract analyze(context: AgentContext): Promise<Omit<AgentFinding, 'agentName' | 'completedAt' | 'executionTimeMs' | 'status'>>;

  async run(context: AgentContext): Promise<AgentFinding> {
    const startTime = Date.now();
    console.log(`[AGENT:${this.agentName}] Starting analysis...`);

    try {
      const result = await this.analyze(context);
      const executionTimeMs = Date.now() - startTime;

      const finding: AgentFinding = {
        agentName: this.agentName,
        status: 'COMPLETED',
        executionTimeMs,
        completedAt: new Date().toISOString(),
        ...result,
      };

      // Persist agent log
      await AgentLog.create({
        verificationId: context.verificationId,
        documentId: context.documentId,
        agentName: this.agentName,
        status: 'COMPLETED',
        inputSummary: `Text length: ${context.extractedText.length}, Rule flags: ${context.ruleEngineOutput.flags.length}`,
        outputSummary: `Score: ${result.score}, Flags: ${result.flags.join(', ')}`,
        executionTimeMs,
      });

      console.log(`[AGENT:${this.agentName}] Done in ${executionTimeMs}ms. Score: ${result.score}, Flags: ${result.flags.length}`);
      return finding;
    } catch (err: any) {
      const executionTimeMs = Date.now() - startTime;
      console.error(`[AGENT:${this.agentName}] Failed:`, err?.message);

      await AgentLog.create({
        verificationId: context.verificationId,
        documentId: context.documentId,
        agentName: this.agentName,
        status: 'FAILED',
        inputSummary: `Text length: ${context.extractedText.length}`,
        outputSummary: '',
        error: err?.message,
        executionTimeMs,
      });

      // Return safe fallback — never crash the pipeline
      return {
        agentName: this.agentName,
        status: 'FAILED',
        riskLevel: 'MEDIUM',
        score: 25,
        flags: [`AGENT_${this.agentName}_FAILED`],
        explanation: `Agent failed to complete analysis: ${err?.message}. Manual review required.`,
        rawOutput: { error: err?.message },
        executionTimeMs,
        completedAt: new Date().toISOString(),
      };
    }
  }

  protected scoreToRiskLevel(score: number): RiskLevel {
    if (score < 25) return 'LOW';
    if (score < 50) return 'MEDIUM';
    if (score < 75) return 'HIGH';
    return 'CRITICAL';
  }
}
