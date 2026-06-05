import { config } from '../config/env';

/**
 * GeminiService — despite the name (kept for compatibility), this routes all
 * model calls through OpenRouter's OpenAI-compatible API. The class name and
 * method signatures are unchanged so the agents need no modification.
 *
 * Requires OPENROUTER_API_KEY in the environment. The model is configurable
 * via OPENROUTER_MODEL (defaults to a fast, JSON-reliable Gemini Flash model
 * served through OpenRouter).
 */
export class GeminiService {
  private static readonly ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

  static async prompt(systemPrompt: string, userContent: string): Promise<string> {
    if (!config.openRouter.apiKey) {
      throw new Error('OPENROUTER_API_KEY is not set in environment variables');
    }

    // 40s timeout so a slow model can't block the pipeline indefinitely.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const res = await fetch(GeminiService.ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openRouter.apiKey}`,
          'Content-Type': 'application/json',
          // OpenRouter recommends these for attribution; harmless if generic.
          'HTTP-Referer': 'https://veri-chain-client.vercel.app',
          'X-Title': 'VeriChain',
        },
        body: JSON.stringify({
          model: config.openRouter.model,
          temperature: 0.3,
          max_tokens: 4096,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`OpenRouter ${res.status}: ${errText.slice(0, 300)}`);
      }

      const data: any = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text || typeof text !== 'string') {
        throw new Error('OpenRouter returned no content');
      }
      return text.trim();
    } catch (err: any) {
      const msg = err?.name === 'AbortError'
        ? 'OpenRouter request timed out after 40s'
        : err?.message ?? 'Unknown error';
      console.error('[OPENROUTER] API call failed:', msg);
      throw new Error(`OpenRouter API error: ${msg}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  static async promptJSON<T>(systemPrompt: string, userContent: string): Promise<T> {
    const jsonSystemPrompt = `${systemPrompt}

CRITICAL RULES:
1. Respond ONLY with a single valid JSON object.
2. Do NOT use markdown code fences.
3. Start with { and end with }.
4. Narrative fields ("explanation", "overallAssessment") must be thorough and detailed — follow the length guidance in each field's description (4-7 sentences). Do NOT truncate them.
5. Only short label/array fields (flags, indicators, verdicts) should stay concise.`;

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
      console.error('[OPENROUTER] JSON parse failed. Raw:', raw.slice(0, 300));
      throw new Error('OpenRouter returned invalid JSON');
    }
  }

  static isConfigured(): boolean {
    return !!config.openRouter.apiKey;
  }
}
