import { BaseAgent, AgentContext } from './base.agent';
import { AgentFinding, AgentName } from '../types';
import { GeminiService } from '../services/gemini.service';

interface MetadataAnalysis {
  suspiciousIndicators: string[];
  documentStructureScore: number;
  explanation: string;
  flags: string[];
}

export class MetadataAgent extends BaseAgent {
  readonly agentName: AgentName = 'METADATA';

  async analyze(context: AgentContext): Promise<Omit<AgentFinding, 'agentName' | 'completedAt' | 'executionTimeMs' | 'status'>> {
    const { extractedText, fileName, fileSize, ruleEngineOutput } = context;

    const textLengthRule = ruleEngineOutput.results.find((r) => r.ruleId === 'R001');
    const dateRule = ruleEngineOutput.results.find((r) => r.ruleId === 'R002');
    const dateConsistencyRule = ruleEngineOutput.results.find((r) => r.ruleId === 'R003');
    const fileSizeRule = ruleEngineOutput.results.find((r) => r.ruleId === 'R010');

    let score = 0;
    if (!textLengthRule?.passed) score += 20;
    if (!dateRule?.passed) score += 15;
    if (!dateConsistencyRule?.passed) score += 25;
    if (!fileSizeRule?.passed) score += 15;

    const deterministicFlags: string[] = [
      textLengthRule?.flag, dateRule?.flag,
      dateConsistencyRule?.flag, fileSizeRule?.flag,
    ].filter(Boolean) as string[];

    let geminiAnalysis: MetadataAnalysis = {
      suspiciousIndicators: deterministicFlags,
      documentStructureScore: score,
      explanation: `Metadata analysis complete. Rule flags detected: ${deterministicFlags.join(', ') || 'none'}.`,
      flags: deterministicFlags,
    };

    if (GeminiService.isConfigured() && extractedText.length > 50) {
      const systemPrompt = `You are a forensic document analyst specializing in real estate document authentication. Return ONLY valid JSON.`;

      const userContent = `File: ${fileName} | Size: ${(fileSize/1024).toFixed(1)}KB | Characters: ${extractedText.length}
Rule flags found: ${deterministicFlags.join(', ') || 'none'}
<<<<<<< HEAD
Document text: ${extractedText.slice(0, 6000)}
=======
Text sample: ${extractedText.slice(0, 600)}
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f

Return this exact JSON structure:
{
  "suspiciousIndicators": ["indicator 1", "indicator 2"],
  "documentStructureScore": 20,
<<<<<<< HEAD
  "explanation": "A detailed multi-part analysis (4-6 sentences). First state the specific structural and metadata findings, citing concrete evidence from the document text (e.g. exact phrases, missing sections, formatting irregularities). Then explain precisely why the score was assigned, which anomalies are most significant, and how each affects the document's authenticity. Finally state what this means for whether the document can be trusted as genuine. Be specific and reference actual content — avoid generic statements.",
=======
  "explanation": "3-4 sentences explaining the metadata findings, why the score was assigned, what specific anomalies were detected, and what this means for the document's authenticity.",
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
  "flags": ["FLAG_1", "FLAG_2"]
}`;

      try {
        geminiAnalysis = await GeminiService.promptJSON<MetadataAnalysis>(systemPrompt, userContent);
        score = Math.round(score * 0.6 + (geminiAnalysis.documentStructureScore ?? score) * 0.4);
      } catch (err) {
        console.warn('[METADATA AGENT] Gemini failed, using rule-based score only');
      }
    }

    const allFlags = [...new Set([...deterministicFlags, ...(geminiAnalysis.flags ?? [])])];

    return {
      riskLevel: this.scoreToRiskLevel(Math.min(100, score)),
      score: Math.min(100, score),
      flags: allFlags,
      explanation: geminiAnalysis.explanation,
      rawOutput: { deterministicFlags, geminiAnalysis },
    };
  }
}
