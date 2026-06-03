import { RiskLevel } from '../types';

/**
 * Converts a numeric risk score (0-100) to a RiskLevel enum.
 * This logic is shared and deterministic — used on both client and server
 * to ensure consistent risk level display.
 */
export function scoreToRiskLevel(score: number): RiskLevel {
  if (score < 25) return 'LOW';
  if (score < 50) return 'MEDIUM';
  if (score < 75) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Returns a hex color string for a given risk level.
 * Used by both frontend charts and backend response formatting.
 */
export function riskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    LOW: '#22c55e',
    MEDIUM: '#eab308',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
  };
  return colors[level];
}

/**
 * Truncates a string to a given max length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Formats a timestamp (ISO string or number) to a readable date string.
 */
export function formatTimestamp(timestamp: string | number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generates a short display ID from a full ID string.
 */
export function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

/**
 * Validates that a string is a valid Ethereum address.
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates that a string is a valid transaction hash.
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}
