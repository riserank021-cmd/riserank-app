/**
 * quizCacheService — network-first wrapper around quizService with
 * AsyncStorage fallback for offline use.
 *
 * Returns `{ data, fromCache }` so callers can show a "Cached" indicator.
 *
 * Caching rules:
 *  • getById  — write-through on success, stale fallback on any network error
 *  • list     — only caches the baseline page (page 1, no category, no search)
 *                write-through on success, stale fallback for that same query
 */

import { quizService, QuizListParams } from './quiz.service';
import {
  cacheQuiz,
  cacheQuizList,
  getStaleQuiz,
  getStaleQuizList,
} from '../utils/quizCache';
import type { Quiz } from '../types/api.types';

export interface CachedResult<T> {
  data: T | null;
  fromCache: boolean;
}

// ── Quiz detail ───────────────────────────────────────────────────────────────

export async function getQuizById(quizId: string): Promise<CachedResult<Quiz>> {
  try {
    const res = await quizService.getById(quizId);
    const quiz = res.data.data ?? null;
    if (quiz) {
      // Write-through — don't await, fire-and-forget
      cacheQuiz(quiz).catch(() => {});
    }
    return { data: quiz, fromCache: false };
  } catch {
    // Network / server error — try stale cache
    const stale = await getStaleQuiz(quizId);
    return { data: stale, fromCache: stale !== null };
  }
}

// ── Quiz list ─────────────────────────────────────────────────────────────────

const isBaselineQuery = (params?: QuizListParams): boolean =>
  !params?.category && !params?.search && (params?.page ?? 1) === 1;

export async function listQuizzes(
  params?: QuizListParams,
): Promise<CachedResult<Quiz[]>> {
  try {
    const res = await quizService.list(params);
    const quizzes = res.data.data ?? [];
    if (isBaselineQuery(params) && quizzes.length > 0) {
      cacheQuizList(quizzes).catch(() => {});
    }
    return { data: quizzes, fromCache: false };
  } catch {
    if (isBaselineQuery(params)) {
      const stale = await getStaleQuizList();
      return { data: stale ?? [], fromCache: stale !== null };
    }
    return { data: [], fromCache: false };
  }
}
