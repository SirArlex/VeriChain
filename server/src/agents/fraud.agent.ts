import { BaseAgent, AgentContext } from './base.agent';
import { AgentFinding, AgentName } from '../types';
import { GeminiService } from '../services/gemini.service';

interface FraudAnalysis {
  fraudProbability: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  fraudIndicators: string[];
  authenticityMarkers: string[];
  explanation: string;
  flags: string[];
  fraudScore: number;
}

export class FraudDetectionAgent extends BaseAgent {
  readonly agentName: AgentName = 'FRAUD_DETECTION';

  async analyze(context: AgentContext): Promise<Omit<AgentFinding, 'agentName' | 'completedAt' | 'executionTimeMs' | 'status'>> {
    const { extractedText, ruleEngineOutput } = context;

    const suspiciousRule = ruleEngineOutput.results.find((r) => r.ruleId === 'R009');
    const repetitionRule = ruleEngineOutput.results.find((r) => r.ruleId === 'R011');

    let score = 0;
    if (!suspiciousRule?.passed) score += 40;
    if (!repetitionRule?.passed) score += 20;

    const textLower = extractedText.toLowerCase();
    const hasSuspiciousStructure = textLower.split('\n').filter((l) => l.trim()).length < 3;
    if (hasSuspiciousStructure && extractedText.length > 100) score += 15;

    const deterministicFlags: string[] = [
      suspiciousRule?.flag,
      repetitionRule?.flag,
      hasSuspiciousStructure ? 'SUSPICIOUS_DOCUMENT_STRUCTURE' : null,
    ].filter(Boolean) as string[];

    let geminiAnalysis: FraudAnalysis = {
      fraudProbability: score < 25 ? 'LOW' : score < 50 ? 'MEDIUM' : score < 75 ? 'HIGH' : 'CRITICAL',
      fraudIndicators: deterministicFlags,
      authenticityMarkers: [],
      explanation: `Fraud probability assessed as ${score < 25 ? 'LOW' : score < 50 ? 'MEDIUM' : 'HIGH'} based on rule engine pattern detection.`,
      flags: deterministicFlags,
      fraudScore: score,
    };

    if (GeminiService.isConfigured() && extractedText.length > 50) {
      const systemPrompt = `You are a forensic fraud investigator specializing in real estate document fraud. Return ONLY valid JSON.`;

      const userContent = `Document text: ${extractedText.slice(0, 700)}
Deterministic flags already found: ${deterministicFlags.join(', ') || 'none'}

Return this exact JSON structure:
{
  "fraudProbability": "HIGH",
  "fraudIndicators": ["specific indicator 1", "specific indicator 2", "specific indicator 3"],
  "authenticityMarkers": ["positive signal 1"],
  "explanation": "3-4 sentences explaining the fraud assessment, what specific patterns triggered concern, why this document scores at this risk level, and what the key red flags are that an investigator would act on.",
  "flags": ["FRAUD_FLAG_1", "FRAUD_FLAG_2"],
  "fraudScore": 55
}`;

      try {
        geminiAnalysis = await GeminiService.promptJSON<FraudAnalysis>(systemPrompt, userContent);
        score = Math.round(score * 0.7 + (geminiAnalysis.fraudScore ?? score) * 0.3);
      } catch (err) {
        console.warn('[FRAUD AGENT] Gemini failed, using rule-based score');
      }
    }

    const allFlags = [...new Set([...deterministicFlags, ...(geminiAnalysis.flags ?? [])])];
    const finalScore = Math.min(100, score);

    return {
      riskLevel: this.scoreToRiskLevel(finalScore),
      score: finalScore,
      flags: allFlags,
      explanation: geminiAnalysis.explanation,
      rawOutput: {
        fraudProbability: geminiAnalysis.fraudProbability,
        fraudIndicators: geminiAnalysis.fraudIndicators,
        authenticityMarkers: geminiAnalysis.authenticityMarkers,
        deterministicFlags,
      },
    };
  }
}
