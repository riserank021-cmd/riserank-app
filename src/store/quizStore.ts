/**
 * Quiz store — in-progress attempt state (answers, timer, current question index).
 * This is purely in-memory — cleared when the attempt ends.
 */

import { create } from 'zustand';
import type { Quiz, AnswerPayload } from '../types/api.types';
import type { Language } from '../utils/constants';

interface QuizState {
  // ── Active attempt ────────────────────────────────────────────────────────
  activeQuiz: Quiz | null;
  attemptId: string | null;
  currentIndex: number;
  answers: Record<string, AnswerPayload['selectedOption']>; // questionId → option
  timeTakenSeconds: number;         // total elapsed seconds (updated every second)
  isSubmitting: boolean;
  language: Language;

  // ── Actions ───────────────────────────────────────────────────────────────
  startAttempt: (quiz: Quiz, attemptId: string, language: Language) => void;
  selectAnswer: (questionId: string, option: AnswerPayload['selectedOption']) => void;
  goToNext: () => void;
  goToPrev: () => void;
  goToIndex: (index: number) => void;
  tick: () => void;
  setSubmitting: (v: boolean) => void;
  clearAttempt: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  activeQuiz: null,
  attemptId: null,
  currentIndex: 0,
  answers: {},
  timeTakenSeconds: 0,
  isSubmitting: false,
  language: 'en',

  startAttempt: (quiz, attemptId, language) =>
    set({ activeQuiz: quiz, attemptId, currentIndex: 0, answers: {}, timeTakenSeconds: 0, language }),

  selectAnswer: (questionId, option) =>
    set((s) => ({ answers: { ...s.answers, [questionId]: option } })),

  goToNext: () => {
    const { currentIndex, activeQuiz } = get();
    const total = activeQuiz?.questions?.length ?? 0;
    if (currentIndex < total - 1) set({ currentIndex: currentIndex + 1 });
  },

  goToPrev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1 });
  },

  goToIndex: (index) => set({ currentIndex: index }),

  tick: () => set((s) => ({ timeTakenSeconds: s.timeTakenSeconds + 1 })),

  setSubmitting: (v) => set({ isSubmitting: v }),

  clearAttempt: () =>
    set({ activeQuiz: null, attemptId: null, currentIndex: 0, answers: {}, timeTakenSeconds: 0, isSubmitting: false }),
}));
