/**
 * RuleEngine — deterministic validation layer.
 *
 * This runs BEFORE any AI agent.
 * Rules are hard-coded, reproducible, and never rely on Gemini.
 *
 * Why deterministic rules first:
 * - AI can hallucinate. Rules cannot.
 * - Rules provide the factual foundation that AI agents reason about.
 * - Auditors can verify rule outputs without understanding AI.
 *
 * Each rule returns a RuleResult with a flag and severity.
 */

export type RuleSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  severity: RuleSeverity;
  flag: string | null;
  detail: string;
}

export interface RuleEngineOutput {
  results: RuleResult[];
  flags: string[];
  failedRules: number;
  criticalCount: number;
  highCount: number;
  warningCount: number;
  ruleScore: number; // 0-100, higher = riskier
}

export class RuleEngine {
  /**
   * Runs all deterministic rules against extracted document text.
   * Returns structured output used by all AI agents as context.
   */
  static analyze(extractedText: string, fileName: string, fileSize: number): RuleEngineOutput {
    const results: RuleResult[] = [];

    // Run all rules
    results.push(RuleEngine.checkTextLength(extractedText));
    results.push(RuleEngine.checkDatePresence(extractedText));
    results.push(RuleEngine.checkDateConsistency(extractedText));
    results.push(RuleEngine.checkOwnershipKeywords(extractedText));
    results.push(RuleEngine.checkSignaturePresence(extractedText));
    results.push(RuleEngine.checkPropertyDescription(extractedText));
    results.push(RuleEngine.checkMonetaryValues(extractedText));
    results.push(RuleEngine.checkNotaryPresence(extractedText));
    results.push(RuleEngine.checkSuspiciousPatterns(extractedText));
    results.push(RuleEngine.checkFileSizeAnomaly(fileSize));
    results.push(RuleEngine.checkDuplicateWords(extractedText));
    results.push(RuleEngine.checkContactInfo(extractedText));

    // Aggregate
    const flags = results
      .filter((r) => !r.passed && r.flag)
      .map((r) => r.flag as string);

    const failedRules = results.filter((r) => !r.passed).length;
    const criticalCount = results.filter((r) => !r.passed && r.severity === 'CRITICAL').length;
    const highCount = results.filter((r) => !r.passed && r.severity === 'HIGH').length;
    const warningCount = results.filter((r) => !r.passed && r.severity === 'WARNING').length;

    // Score: weighted by severity
    const maxScore = 100;
    const deductions = criticalCount * 25 + highCount * 15 + warningCount * 7;
    const ruleScore = Math.min(maxScore, deductions);

    return { results, flags, failedRules, criticalCount, highCount, warningCount, ruleScore };
  }

  // ── Individual Rules ─────────────────────────────────────────────

  private static checkTextLength(text: string): RuleResult {
    const MIN_CHARS = 100;
    const passed = text.length >= MIN_CHARS;
    return {
      ruleId: 'R001',
      ruleName: 'Minimum Text Content',
      passed,
      severity: 'HIGH',
      flag: passed ? null : 'INSUFFICIENT_TEXT_CONTENT',
      detail: passed
        ? `Document contains ${text.length} characters`
        : `Document has only ${text.length} characters — may be scanned/image-only`,
    };
  }

  private static checkDatePresence(text: string): RuleResult {
    // Matches common date formats: 01/01/2024, January 1 2024, 2024-01-01
    const datePattern = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{2}[\/\-]\d{2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/gi;
    const matches = text.match(datePattern) ?? [];
    const passed = matches.length >= 1;
    return {
      ruleId: 'R002',
      ruleName: 'Date Presence',
      passed,
      severity: 'WARNING',
      flag: passed ? null : 'NO_DATE_FOUND',
      detail: passed
        ? `Found ${matches.length} date(s): ${matches.slice(0, 3).join(', ')}`
        : 'No dates found in document — required for real estate documents',
    };
  }

  private static checkDateConsistency(text: string): RuleResult {
    // Extract years from dates
    const yearPattern = /\b(19|20)\d{2}\b/g;
    const years = (text.match(yearPattern) ?? []).map(Number);
    const currentYear = new Date().getFullYear();
    const futureYears = years.filter((y) => y > currentYear + 1);
    const ancientYears = years.filter((y) => y < 1900);
    const passed = futureYears.length === 0 && ancientYears.length === 0;
    return {
      ruleId: 'R003',
      ruleName: 'Date Consistency',
      passed,
      severity: 'HIGH',
      flag: passed ? null : 'SUSPICIOUS_DATE_VALUES',
      detail: passed
        ? `All ${years.length} year(s) found are within valid range`
        : `Suspicious years detected: future=${futureYears.join(',')}, ancient=${ancientYears.join(',')}`,
    };
  }

  private static checkOwnershipKeywords(text: string): RuleResult {
    const ownershipTerms = ['grantor', 'grantee', 'owner', 'seller', 'buyer', 'transferor', 'transferee', 'title', 'deed'];
    const lowerText = text.toLowerCase();
    const found = ownershipTerms.filter((t) => lowerText.includes(t));
    const passed = found.length >= 2;
    return {
      ruleId: 'R004',
      ruleName: 'Ownership Keywords',
      passed,
      severity: 'WARNING',
      flag: passed ? null : 'MISSING_OWNERSHIP_TERMS',
      detail: passed
        ? `Found ownership terms: ${found.join(', ')}`
        : `Only found ${found.length} ownership term(s) — insufficient for title document`,
    };
  }

  private static checkSignaturePresence(text: string): RuleResult {
    const sigTerms = ['signature', 'signed', 'sign', 'notary', 'witness', 'seal', 'acknowledged'];
    const lowerText = text.toLowerCase();
    const found = sigTerms.filter((t) => lowerText.includes(t));
    const passed = found.length >= 1;
    return {
      ruleId: 'R005',
      ruleName: 'Signature/Notary Presence',
      passed,
      severity: 'WARNING',
      flag: passed ? null : 'NO_SIGNATURE_REFERENCE',
      detail: passed
        ? `Found signature references: ${found.join(', ')}`
        : 'No signature or notary references found',
    };
  }

  private static checkPropertyDescription(text: string): RuleResult {
    const propTerms = ['lot', 'block', 'parcel', 'property', 'land', 'square feet', 'sq ft', 'acre', 'address', 'street', 'avenue', 'boulevard'];
    const lowerText = text.toLowerCase();
    const found = propTerms.filter((t) => lowerText.includes(t));
    const passed = found.length >= 2;
    return {
      ruleId: 'R006',
      ruleName: 'Property Description',
      passed,
      severity: 'HIGH',
      flag: passed ? null : 'MISSING_PROPERTY_DESCRIPTION',
      detail: passed
        ? `Found property terms: ${found.join(', ')}`
        : 'Insufficient property description — real estate documents require location details',
    };
  }

  private static checkMonetaryValues(text: string): RuleResult {
    const moneyPattern = /\$[\d,]+(\.\d{2})?|\b\d[\d,]+\s*(dollars?|usd)\b/gi;
    const matches = text.match(moneyPattern) ?? [];
    const passed = matches.length >= 1;
    return {
      ruleId: 'R007',
      ruleName: 'Monetary Values',
      passed,
      severity: 'INFO',
      flag: null, // INFO only — not a hard flag
      detail: passed
        ? `Found ${matches.length} monetary value(s): ${matches.slice(0, 3).join(', ')}`
        : 'No monetary values found — may be acceptable for some document types',
    };
  }

  private static checkNotaryPresence(text: string): RuleResult {
    const notaryTerms = ['notary', 'notarial', 'commission expires', 'public', 'acknowledgment'];
    const lowerText = text.toLowerCase();
    const found = notaryTerms.filter((t) => lowerText.includes(t));
    const passed = found.length >= 1;
    return {
      ruleId: 'R008',
      ruleName: 'Notary/Authentication',
      passed,
      severity: 'WARNING',
      flag: passed ? null : 'NO_NOTARIZATION_FOUND',
      detail: passed
        ? `Found notarization references: ${found.join(', ')}`
        : 'No notarization found — title documents typically require notarization',
    };
  }

  private static checkSuspiciousPatterns(text: string): RuleResult {
    const suspicious = [
      { pattern: /urgent|act now|limited time/i, flag: 'URGENCY_LANGUAGE' },
      { pattern: /wire transfer|western union|moneygram/i, flag: 'SUSPICIOUS_PAYMENT_METHOD' },
      { pattern: /guaranteed|100% safe|no risk/i, flag: 'MISLEADING_GUARANTEES' },
      { pattern: /offshore|tax haven|anonymous/i, flag: 'OFFSHORE_REFERENCES' },
    ];
    const found = suspicious.filter((s) => s.pattern.test(text));
    const passed = found.length === 0;
    return {
      ruleId: 'R009',
      ruleName: 'Suspicious Pattern Detection',
      passed,
      severity: 'CRITICAL',
      flag: passed ? null : `SUSPICIOUS_PATTERNS: ${found.map((f) => f.flag).join(', ')}`,
      detail: passed
        ? 'No suspicious language patterns detected'
        : `Suspicious patterns found: ${found.map((f) => f.flag).join(', ')}`,
    };
  }

  private static checkFileSizeAnomaly(fileSize: number): RuleResult {
    // Real estate docs are typically 50KB - 10MB
    // Very small files (< 10KB) may be incomplete or fake
    const MIN_SIZE = 10 * 1024; // 10KB
    const passed = fileSize >= MIN_SIZE;
    return {
      ruleId: 'R010',
      ruleName: 'File Size Validation',
      passed,
      severity: 'WARNING',
      flag: passed ? null : 'SUSPICIOUSLY_SMALL_FILE',
      detail: passed
        ? `File size ${(fileSize / 1024).toFixed(1)}KB is within normal range`
        : `File size ${(fileSize / 1024).toFixed(1)}KB is suspiciously small for a real estate document`,
    };
  }

  private static checkDuplicateWords(text: string): RuleResult {
    // Check for excessive word repetition (sign of template abuse or copy-paste fraud)
    const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 5);
    const wordCount: Record<string, number> = {};
    words.forEach((w) => { wordCount[w] = (wordCount[w] ?? 0) + 1; });
    const maxRepeat = Math.max(...Object.values(wordCount), 0);
    const threshold = Math.max(10, words.length * 0.1); // 10% of total words
    const passed = maxRepeat < threshold;
    return {
      ruleId: 'R011',
      ruleName: 'Word Repetition Check',
      passed,
      severity: 'WARNING',
      flag: passed ? null : 'EXCESSIVE_WORD_REPETITION',
      detail: passed
        ? 'Normal word distribution detected'
        : `Excessive repetition detected — max word frequency: ${maxRepeat}`,
    };
  }

  private static checkContactInfo(text: string): RuleResult {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phonePattern = /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
    const hasEmail = emailPattern.test(text);
    const hasPhone = phonePattern.test(text);
    const passed = true; // contact info is optional but noted
    return {
      ruleId: 'R012',
      ruleName: 'Contact Information',
      passed,
      severity: 'INFO',
      flag: null,
      detail: `Contact info: email=${hasEmail}, phone=${hasPhone}`,
    };
  }
}
