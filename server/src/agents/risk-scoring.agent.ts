import { BaseAgent, AgentContext } from './base.agent';
import { AgentFinding, AgentName } from '../types';
import { GeminiService } from '../services/gemini.service';

interface RiskSummary {
  overallAssessment: string;
  keyRisks: string[];
  recommendations: string[];
  tokenizationVerdict: string;
}

export class RiskScoringAgent extends BaseAgent {
  readonly agentName: AgentName = 'RISK_SCORING';
  private priorFindings: AgentFinding[] = [];

  setPriorFindings(findings: AgentFinding[]) {
    this.priorFindings = findings;
  }

  async analyze(context: AgentContext): Promise<Omit<AgentFinding, 'agentName' | 'completedAt' | 'executionTimeMs' | 'status'>> {
    const metadataFinding = this.priorFindings.find((f) => f.agentName === 'METADATA');
    const ownershipFinding = this.priorFindings.find((f) => f.agentName === 'OWNERSHIP');
    const complianceFinding = this.priorFindings.find((f) => f.agentName === 'COMPLIANCE');
    const fraudFinding = this.priorFindings.find((f) => f.agentName === 'FRAUD_DETECTION');

    const metadataScore = metadataFinding?.score ?? 0;
    const ownershipScore = ownershipFinding?.score ?? 0;
    const complianceScore = complianceFinding?.score ?? 0;
    const fraudScore = fraudFinding?.score ?? 0;
    const ruleScore = context.ruleEngineOutput.ruleScore;

    const agentWeightedScore = Math.round(
      fraudScore * 0.40 +
      ownershipScore * 0.20 +
      complianceScore * 0.20 +
      metadataScore * 0.20
    );

    let finalScore = Math.min(100, Math.max(0,
      Math.round(agentWeightedScore * 0.60 + ruleScore * 0.40)
    ));

    // Critical escalation rules
    if (context.ruleEngineOutput.criticalCount > 0 && finalScore < 55) {
      console.log(`[RISK SCORING] Escalating score from ${finalScore} to 55 — critical rule flags present`);
      finalScore = 55;
    }
    if (fraudScore >= 50 && finalScore < 50) {
      console.log(`[RISK SCORING] Escalating score from ${finalScore} to 50 — fraud agent HIGH`);
      finalScore = 50;
    }
    if (fraudScore >= 75 && finalScore < 65) {
      finalScore = 65;
    }

    const allFlags = [
      ...context.ruleEngineOutput.flags,
      ...(metadataFinding?.flags ?? []),
      ...(ownershipFinding?.flags ?? []),
      ...(complianceFinding?.flags ?? []),
      ...(fraudFinding?.flags ?? []),
    ];
    const uniqueFlags = [...new Set(allFlags)];

    const hasCriticalRule = context.ruleEngineOutput.criticalCount > 0;
    const hasCriticalFraud = fraudScore >= 75;
    const tokenizationReady = finalScore < 50 && !hasCriticalRule && !hasCriticalFraud;

    let riskSummary: RiskSummary = {
      overallAssessment: `Composite risk score: ${finalScore}/100. ${tokenizationReady ? 'Document suitable for tokenization.' : 'Manual review required before tokenization.'}`,
      keyRisks: uniqueFlags.slice(0, 3),
      recommendations: tokenizationReady
        ? ['Document passes verification — proceed with tokenization']
        : ['Manual legal review required', 'Do not tokenize without further verification'],
      tokenizationVerdict: tokenizationReady ? 'APPROVED' : 'MANUAL_REVIEW_REQUIRED',
    };

    if (GeminiService.isConfigured()) {
      const systemPrompt = `You are a senior RWA (Real World Asset) risk analyst writing an executive verification report. Return ONLY valid JSON.`;

      const userContent = `Document: ${context.fileName}
Final composite risk score: ${finalScore}/100
Agent scores — Fraud: ${fraudScore}, Ownership: ${ownershipScore}, Compliance: ${complianceScore}, Metadata: ${metadataScore}, Rules: ${ruleScore}
Total flags raised: ${uniqueFlags.length}
Key flags: ${uniqueFlags.slice(0, 6).join(', ') || 'None'}
Tokenization ready: ${tokenizationReady}
Agent explanations:
- Fraud: ${fraudFinding?.explanation?.slice(0, 600) ?? 'N/A'}
- Compliance: ${complianceFinding?.explanation?.slice(0, 600) ?? 'N/A'}
- Ownership: ${ownershipFinding?.explanation?.slice(0, 600) ?? 'N/A'}

Return this exact JSON structure:
{
  "overallAssessment": "A thorough executive summary (5-7 sentences) synthesizing every agent's findings into a single verdict. Open with what the composite score means in plain terms and the tokenization recommendation. Then identify the highest-risk factors specifically, attributing them to the agents that surfaced them (e.g. what the fraud, ownership, compliance, and metadata agents each contributed). Explain how these combined into the final weighted score. Close with a clear, actionable recommendation: proceed to tokenization, proceed with conditions, or reject pending remediation — and state the specific conditions. Reference concrete findings rather than generic risk language.",
  "keyRisks": ["specific risk 1", "specific risk 2", "specific risk 3"],
  "recommendations": ["specific action 1", "specific action 2", "specific action 3"],
  "tokenizationVerdict": "APPROVED"
}`;

      try {
        riskSummary = await GeminiService.promptJSON<RiskSummary>(systemPrompt, userContent);
      } catch (err) {
        console.warn('[RISK SCORING AGENT] Gemini failed, using computed summary');
      }
    }

    return {
      riskLevel: this.scoreToRiskLevel(finalScore),
      score: finalScore,
      flags: uniqueFlags,
      explanation: riskSummary.overallAssessment,
      rawOutput: {
        agentWeightedScore,
        ruleScore,
        agentScores: { metadataScore, ownershipScore, complianceScore, fraudScore },
        tokenizationReady,
        tokenizationVerdict: riskSummary.tokenizationVerdict,
        keyRisks: riskSummary.keyRisks,
        recommendations: riskSummary.recommendations,
      },
    };
  }
}
