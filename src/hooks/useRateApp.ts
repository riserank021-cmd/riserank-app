/**
 * useRateApp — tracks quiz completions and decides when to show the
 * "Rate us on Play Store" prompt.
 *
 * Rules:
 *  • Show after the 5th completed quiz (first trigger)
 *  • If the user picks "Later" → snooze for 10 more completions
 *  • If the user picks "Never" → never show again
 *  • Once rated → never show again
 *
 * Usage:
 *   const { shouldShowRatePrompt, recordCompletion, handleRateLater, handleRateNever, handleRated } = useRateApp();
 */

import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, PLAY_STORE_URL } from '../utils/constants';

const FIRST_TRIGGER   = 5;  // completions before first prompt
const SNOOZE_COUNT    = 10; // completions after "Later" before re-prompting

export function useRateApp() {
  const [shouldShowRatePrompt, setShouldShowRatePrompt] = useState(false);

  /**
   * Call this every time a quiz is submitted successfully.
   * Reads current counts, increments, and decides whether to surface the prompt.
   */
  const recordCompletion = useCallback(async () => {
    try {
      const status = await storage.get<string>(STORAGE_KEYS.RATE_APP_STATUS);
      if (status === 'never' || status === 'rated') return; // opted out

      const count = (await storage.get<number>(STORAGE_KEYS.QUIZ_COMPLETION_COUNT)) ?? 0;
      const newCount = count + 1;
      await storage.set(STORAGE_KEYS.QUIZ_COMPLETION_COUNT, newCount);

      if (status === 'snoozed') {
        const snoozeAt = await storage.get<number>(STORAGE_KEYS.RATE_APP_SNOOZE_AT);
        // Re-show only after SNOOZE_COUNT more completions since snooze
        if (snoozeAt !== null && newCount >= snoozeAt + SNOOZE_COUNT) {
          setShouldShowRatePrompt(true);
        }
      } else {
        // Never triggered yet — show after FIRST_TRIGGER completions
        if (newCount >= FIRST_TRIGGER) {
          setShouldShowRatePrompt(true);
        }
      }
    } catch {
      // Non-critical — silently ignore storage failures
    }
  }, []);

  const handleRated = useCallback(async () => {
    setShouldShowRatePrompt(false);
    await storage.set(STORAGE_KEYS.RATE_APP_STATUS, 'rated');
    try {
      await Linking.openURL(PLAY_STORE_URL);
    } catch {
      // Play Store not available (e.g. emulator)
    }
  }, []);

  const handleRateLater = useCallback(async () => {
    setShouldShowRatePrompt(false);
    const count = (await storage.get<number>(STORAGE_KEYS.QUIZ_COMPLETION_COUNT)) ?? 0;
    await storage.set(STORAGE_KEYS.RATE_APP_STATUS, 'snoozed');
    await storage.set(STORAGE_KEYS.RATE_APP_SNOOZE_AT, count);
  }, []);

  const handleRateNever = useCallback(async () => {
    setShouldShowRatePrompt(false);
    await storage.set(STORAGE_KEYS.RATE_APP_STATUS, 'never');
  }, []);

  return {
    shouldShowRatePrompt,
    recordCompletion,
    handleRated,
    handleRateLater,
    handleRateNever,
  };
}
