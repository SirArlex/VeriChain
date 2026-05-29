import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';

export class GeminiService {
  private static client: GoogleGenerativeAI | null = null;
  private static model: any = null;

  private static getModel() {
    if (!GeminiService.model) {
      if (!config.gemini.apiKey) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
      }
      GeminiService.client = new GoogleGenerativeAI(config.gemini.apiKey);
      GeminiService.model = GeminiService.client.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
        },
      });
    }
    return GeminiService.model;
  }

  static async prompt(systemPrompt: string, userContent: string): Promise<string> {
    const model = GeminiService.getModel();
    const fullPrompt = `${systemPrompt}\n\n${userContent}`;

    // 15 second timeout per Gemini call — prevents slow agents blocking pipeline
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini request timed out after 15s')), 15000)
    );

    try {
      const result = await Promise.race([
        model.generateContent(fullPrompt),
        timeoutPromise,
      ]);
      return result.response.text().trim();
    } catch (err: any) {
      console.error('[GEMINI] API call failed:', err?.message);
      throw new Error(`Gemini API error: ${err?.message ?? 'Unknown error'}`);
    }
  }

  static async promptJSON<T>(systemPrompt: string, userContent: string): Promise<T> {
    const jsonSystemPrompt = `${systemPrompt}

CRITICAL RULES:
1. Respond ONLY with a single valid JSON object.
2. Do NOT use markdown code fences.
3. Start with { and end with }.
4. The "explanation" field may be 3-4 detailed sentences.
5. All other string fields must stay under 100 characters.`;

    const raw = await GeminiService.prompt(jsonSystemPrompt, userContent);

    let cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    // Extract first complete JSON object via brace matching
    const firstBrace = cleaned.indexOf('{');
    if (firstBrace !== -1) {
      let depth = 0;
      let lastClose = -1;
      for (let i = firstBrace; i < cleaned.length; i++) {
        if (cleaned[i] === '{') depth++;
        else if (cleaned[i] === '}') {
          depth--;
          if (depth === 0) { lastClose = i; break; }
        }
      }
      if (lastClose !== -1) {
        cleaned = cleaned.slice(firstBrace, lastClose + 1);
      }
    }

    try {
      return JSON.parse(cleaned) as T;
    } catch (err) {
      console.error('[GEMINI] JSON parse failed. Raw:', raw.slice(0, 300));
      throw new Error('Gemini returned invalid JSON');
    }
  }

  static isConfigured(): boolean {
    return !!config.gemini.apiKey;
  }
}
