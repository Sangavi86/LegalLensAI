import type { RiskLevel } from '@jurismind/shared-types';

/**
 * String utility functions
 */

/**
 * Truncate a string to maxLength, appending ellipsis if needed
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Convert a string to title case
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert snake_case to Title Case  (e.g. "non_compete" → "Non Compete")
 */
export function snakeToTitle(str: string): string {
  return toTitleCase(str.replace(/_/g, ' '));
}

/**
 * Generate a URL-safe slug from a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Count words in a string
 */
export function wordCount(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Estimate reading time in minutes
 */
export function readingTimeMinutes(str: string): number {
  return Math.ceil(wordCount(str) / 200);
}

/**
 * Return a risk level label for display
 */
export function riskLevelLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    critical: 'Critical Risk',
  };
  return labels[level] ?? level;
}

/**
 * Return CSS color variable name for a risk level
 */
export function riskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: 'var(--color-risk-low)',
    medium: 'var(--color-risk-medium)',
    high: 'var(--color-risk-high)',
    critical: 'var(--color-risk-critical)',
  };
  return colors[level] ?? 'var(--color-text-secondary)';
}

/**
 * Format a risk score (0-10) to display string
 */
export function formatRiskScore(score: number): string {
  return score.toFixed(1);
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
