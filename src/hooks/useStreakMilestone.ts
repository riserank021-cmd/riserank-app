/**
 * useStreakMilestone — checks whether the user has just crossed a streak
 * milestone (7, 30, 100 days) that hasn't been celebrated yet.
 *
 * Returns the milestone to celebrate, or null. Marks it as shown on dismiss.
 *
 * Usage:
 *   const { milestone, dismiss } = useStreakMilestone(currentStreak);
 *   // Render <StreakMilestoneModal> when milestone !== null
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, STREAK_MILESTONES, StreakMilestone } from '../utils/constants';

export function useStreakMilestone(currentStreak: number) {
  const [milestone, setMilestone] = useState<StreakMilestone | null>(null);

  useEffect(() => {
    if (currentStreak <= 0) return;

    storage.get<number[]>(STORAGE_KEYS.STREAK_MILESTONES_SHOWN).then((shown) => {
      const shownSet = new Set(shown ?? []);
      // Find the highest milestone the user has reached but not yet celebrated
      const due = STREAK_MILESTONES.filter(
        (m) => currentStreak >= m && !shownSet.has(m)
      );
      if (due.length > 0) {
        // Celebrate the highest unshown milestone
        setMilestone(due[due.length - 1]);
      }
    });
  }, [currentStreak]);

  const dismiss = useCallback(async () => {
    if (milestone === null) return;
    const shown = (await storage.get<number[]>(STORAGE_KEYS.STREAK_MILESTONES_SHOWN)) ?? [];
    await storage.set(STORAGE_KEYS.STREAK_MILESTONES_SHOWN, [...shown, milestone]);
    setMilestone(null);
  }, [milestone]);

  return { milestone, dismiss };
}
