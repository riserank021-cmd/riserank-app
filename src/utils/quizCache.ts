/**
 * quizCache — lightweight TTL-aware AsyncStorage cache for Quiz objects.
 *
 * Two slots:
 *   • Per-quiz detail  (key: rr_quiz_cache_<quizId>, TTL: 4 hours)
 *   • Quiz list page 1 (key: rr_quiz_list_cache,      TTL: 30 minutes)
 *
 * Only caches baseline list (no search, no category) so offline users
 * still see something useful when they open the Quiz tab.
 */

import { storage } from './storage';
import { STORAGE_KEYS } from './constants';
import type { Quiz } from '../types/api.types';

const QUIZ_TTL_MS      = 4  * 60 * 60 * 1000; // 4 hours
const LIST_TTL_MS      = 30 * 60 * 1000;       // 30 minutes

interface CacheEntry<T> {
  data: T;
  cachedAt: number; // Unix ms
}

// ── Detail cache ──────────────────────────────────────────────────────────────

export async function getCachedQuiz(quizId: string): Promise<Quiz | null> {
  const key = STORAGE_KEYS.QUIZ_CACHE_PREFIX + quizId;
  const entry = await storage.get<CacheEntry<Quiz>>(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > QUIZ_TTL_MS) return null; // expired
  return entry.data;
}

export async function cacheQuiz(quiz: Quiz): Promise<void> {
  const key = STORAGE_KEYS.QUIZ_CACHE_PREFIX + quiz._id;
  await storage.set(key, { data: quiz, cachedAt: Date.now() } satisfies CacheEntry<Quiz>);
}

// ── List cache (page 1, no filters) ──────────────────────────────────────────

export async function getCachedQuizList(): Promise<Quiz[] | null> {
  const entry = await storage.get<CacheEntry<Quiz[]>>(STORAGE_KEYS.QUIZ_LIST_CACHE);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > LIST_TTL_MS) return null; // expired
  return entry.data;
}

export async function cacheQuizList(quizzes: Quiz[]): Promise<void> {
  await storage.set(STORAGE_KEYS.QUIZ_LIST_CACHE, {
    data: quizzes,
    cachedAt: Date.now(),
  } satisfies CacheEntry<Quiz[]>);
}

// ── Stale (expired) reads — used when network fails but we want any data ──────

export async function getStaleQuiz(quizId: string): Promise<Quiz | null> {
  const key = STORAGE_KEYS.QUIZ_CACHE_PREFIX + quizId;
  const entry = await storage.get<CacheEntry<Quiz>>(key);
  return entry?.data ?? null;
}

export async function getStaleQuizList(): Promise<Quiz[] | null> {
  const entry = await storage.get<CacheEntry<Quiz[]>>(STORAGE_KEYS.QUIZ_LIST_CACHE);
  return entry?.data ?? null;
}
