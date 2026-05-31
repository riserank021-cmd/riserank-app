/**
 * Formatting helpers used across screens.
 */

import { format, formatDistanceToNow, parseISO } from 'date-fns';
import type { Language } from './constants';
import type { Bilingual } from '../types/api.types';

// ── Bilingual text helper ─────────────────────────────────────────────────────

/**
 * Returns the correct language string from a bilingual object.
 * Falls back to English if the Hindi string is empty.
 */
export function t(field: Bilingual, lang: Language): string {
  if (lang === 'hi' && field.hi?.trim()) return field.hi;
  return field.en ?? '';
}

// ── Date helpers ──────────────────────────────────────────────────────────────

export function formatDate(dateStr: string, pattern = 'dd MMM yyyy'): string {
  try {
    return format(parseISO(dateStr), pattern);
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

// ── Duration ──────────────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Score / percentage ────────────────────────────────────────────────────────

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Compute lifetime accuracy from user stats.
 *
 * Prefers the real `totalAnswered` count (questions actually submitted, not skipped)
 * tracked by the backend. Falls back to `totalQuizAttempts × avgQuestionsPerQuiz`
 * for legacy accounts where `totalAnswered` is still 0.
 * Returns null when there are no attempts yet.
 */
export function computeAccuracy(
  totalCorrect: number,
  totalQuizAttempts: number,
  totalAnswered = 0,
  avgQuestionsPerQuiz = 10
): number | null {
  if (totalQuizAttempts === 0) return null;
  const denominator = totalAnswered > 0
    ? totalAnswered
    : totalQuizAttempts * avgQuestionsPerQuiz;
  if (denominator === 0) return null;
  return Math.min(100, Math.round((totalCorrect / denominator) * 100));
}

// ── Study time ────────────────────────────────────────────────────────────────

/**
 * Converts total seconds into a compact study-time string.
 *   0–59 s   → "< 1m"
 *   1–59 m   → "45m"
 *   1–23 h   → "2h 15m"
 *   24+ h    → "3d 2h"
 */
export function formatStudyTime(totalSeconds: number): string {
  if (totalSeconds < 60) return '< 1m';
  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const mins  = totalMinutes % 60;
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remH = hours % 24;
  return remH > 0 ? `${days}d ${remH}h` : `${days}d`;
}

// ── Capitalise ────────────────────────────────────────────────────────────────

export function capitalise(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ── Pluralise ─────────────────────────────────────────────────────────────────

export function pluralise(count: number, singular: string, plural: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
}
