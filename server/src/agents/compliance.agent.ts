import { BaseAgent, AgentContext } from './base.agent';
import { AgentFinding, AgentName } from '../types';
import { GeminiService } from '../services/gemini.service';

interface ComplianceAnalysis {
  tokenizationReady: boolean;
  missingRequirements: string[];
  completenessScore: number;
  regulatoryFlags: string[];
  explanation: string;
  flags: string[];
}

export class ComplianceAgent extends BaseAgent {
  readonly agentName: AgentName = 'COMPLIANCE';

  async analyze(context: AgentContext): Promise<Omit<AgentFinding, 'agentName' | 'completedAt' | 'executionTimeMs' | 'status'>> {
    const { extractedText, ruleEngineOutput } = context;

    const signatureRule = ruleEngineOutput.results.find((r) => r.ruleId === 'R005');
    const propertyRule = ruleEngineOutput.results.find((r) => r.ruleId === 'R006');
    const monetaryRule = ruleEngineOutput.results.find((r) => r.ruleId === 'R007');
    const notaryRule = ruleEngineOutput.results.find((r) => r.ruleId === 'R008');

    let score = 0;
    if (!signatureRule?.passed) score += 20;
    if (!propertyRule?.passed) score += 25;
    if (!notaryRule?.passed) score += 15;

    const deterministicFlags: string[] = [
      signatureRule?.flag, propertyRule?.flag, notaryRule?.flag,
    ].filter(Boolean) as string[];

    let geminiAnalysis: ComplianceAnalysis = {
      tokenizationReady: score < 40,
      missingRequirements: deterministicFlags,
      completenessScore: score,
      regulatoryFlags: [],
      explanation: 'Compliance check based on document structure analysis.',
      flags: [],
    };

    if (GeminiService.isConfigured() && extractedText.length > 50) {
      const systemPrompt = `You are a tokenization compliance officer for real estate assets. Return ONLY valid JSON.`;

      const userContent = `Document: ${extractedText.slice(0, 800)}
Rule findings — Signature: ${signatureRule?.passed}, Property desc: ${propertyRule?.passed}, Monetary: ${monetaryRule?.passed}, Notary: ${notaryRule?.passed}

Return this exact JSON structure:
{
  "tokenizationReady": false,
  "missingRequirements": ["missing item 1", "missing item 2"],
  "completenessScore": 40,
  "regulatoryFlags": ["REG_FLAG_1"],
  "explanation": "3-4 sentences explaining the compliance assessment, what requirements are present or missing, why this affects tokenization readiness, and what steps would be needed to achieve compliance.",
  "flags": ["FLAG_1", "FLAG_2"]
}`;

      try {
        geminiAnalysis = await GeminiService.promptJSON<ComplianceAnalysis>(systemPrompt, userContent);
        score = Math.round(score * 0.5 + (geminiAnalysis.completenessScore ?? score) * 0.5);
      } catch (err) {
        console.warn('[COMPLIANCE AGENT] Gemini failed, using rule-based score');
      }
    }

    const allFlags = [...new Set([...deterministicFlags, ...(geminiAnalysis.flags ?? []), ...(geminiAnalysis.regulatoryFlags ?? [])])];

    return {
      riskLevel: this.scoreToRiskLevel(Math.min(100, score)),
      score: Math.min(100, score),
      flags: allFlags,
      explanation: geminiAnalysis.explanation,
      rawOutput: {
        tokenizationReady: geminiAnalysis.tokenizationReady,
        missingRequirements: geminiAnalysis.missingRequirements,
      },
    };
  }
}
