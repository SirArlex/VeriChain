import { BaseAgent, AgentContext } from './base.agent';
import { AgentFinding, AgentName } from '../types';
import { GeminiService } from '../services/gemini.service';

interface OwnershipAnalysis {
  ownershipChainComplete: boolean;
  partiesIdentified: string[];
  inconsistencies: string[];
  explanation: string;
  flags: string[];
  ownershipScore: number;
}

export class OwnershipAgent extends BaseAgent {
  readonly agentName: AgentName = 'OWNERSHIP';

  async analyze(context: AgentContext): Promise<Omit<AgentFinding, 'agentName' | 'completedAt' | 'executionTimeMs' | 'status'>> {
    const { extractedText, ruleEngineOutput } = context;

    const ownershipRule = ruleEngineOutput.results.find((r) => r.ruleId === 'R004');
    let score = ownershipRule?.passed ? 0 : 30;
    const deterministicFlags: string[] = ownershipRule?.flag ? [ownershipRule.flag] : [];

    let geminiAnalysis: OwnershipAnalysis = {
      ownershipChainComplete: ownershipRule?.passed ?? false,
      partiesIdentified: [],
      inconsistencies: [],
      explanation: 'Ownership analysis based on keyword detection.',
      flags: [],
      ownershipScore: score,
    };

    if (GeminiService.isConfigured() && extractedText.length > 50) {
      const systemPrompt = `You are a real estate title examiner and ownership chain validator. Return ONLY valid JSON.`;

      const userContent = `Document text: ${extractedText.slice(0, 800)}
Rule finding: ${ownershipRule?.detail ?? 'N/A'}

Return this exact JSON structure:
{
  "ownershipChainComplete": false,
  "partiesIdentified": ["Name (role)", "Name (role)"],
  "inconsistencies": ["inconsistency 1", "inconsistency 2"],
  "explanation": "3-4 sentences describing the ownership chain findings, which parties were identified, what gaps or inconsistencies exist, and what the implications are for tokenization readiness.",
  "flags": ["FLAG_1"],
  "ownershipScore": 30
}`;

      try {
        geminiAnalysis = await GeminiService.promptJSON<OwnershipAnalysis>(systemPrompt, userContent);
        score = Math.round(score * 0.5 + (geminiAnalysis.ownershipScore ?? score) * 0.5);
      } catch (err) {
        console.warn('[OWNERSHIP AGENT] Gemini failed, using rule-based score');
      }
    }

    const allFlags = [...new Set([...deterministicFlags, ...(geminiAnalysis.flags ?? [])])];

    return {
      riskLevel: this.scoreToRiskLevel(Math.min(100, score)),
      score: Math.min(100, score),
      flags: allFlags,
      explanation: geminiAnalysis.explanation,
      rawOutput: { ownershipRule, geminiAnalysis },
    };
  }
}
