/**
 * App-wide constants — mirrors the backend's constants where relevant.
 */

// ── Base URL ──────────────────────────────────────────────────────────────────
// Change this to your deployed API URL before building a release APK.
export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000/api/v1'   // Android emulator → localhost
  : 'https://api.riserank.in/api/v1'; // Production

// ── Storage keys ──────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN:              'rr_access_token',
  REFRESH_TOKEN:             'rr_refresh_token',
  SESSION_ID:                'rr_session_id',
  LANGUAGE:                  'rr_language',
  USER:                      'rr_user',
  THEME:                     'rr_theme',
  ONBOARDING_DONE:           'rr_onboarding_done',
  NOTIFICATIONS:             'rr_notifications',
  NOTIF_LAST_READ_AT:        'rr_notif_last_read_at',
  // Offline quiz cache — keys are suffixed with the quizId / param hash
  QUIZ_CACHE_PREFIX:         'rr_quiz_cache_',
  QUIZ_LIST_CACHE:           'rr_quiz_list_cache',
  // Rate-app prompt tracking
  QUIZ_COMPLETION_COUNT:     'rr_quiz_completion_count',
  RATE_APP_STATUS:           'rr_rate_app_status', // 'never' | 'snoozed' | undefined
  RATE_APP_SNOOZE_AT:        'rr_rate_app_snooze_at', // number — completion count when user picked "Later"
  // Streak milestones already celebrated — stored as JSON number[]
  STREAK_MILESTONES_SHOWN:   'rr_streak_milestones_shown',
} as const;

// ── Streak milestones ─────────────────────────────────────────────────────────
export const STREAK_MILESTONES = [7, 30, 100] as const;
export type StreakMilestone = typeof STREAK_MILESTONES[number];

// ── App version ───────────────────────────────────────────────────────────────
// Bump this on every release. Format: MAJOR.MINOR.PATCH (semver).
export const APP_VERSION = '1.0.0';

// ── Play Store ────────────────────────────────────────────────────────────────
export const PLAY_STORE_URL = 'market://details?id=com.riserank.app';

// ── Language ──────────────────────────────────────────────────────────────────
export const LANGUAGES = {
  EN: 'en',
  HI: 'hi',
} as const;

export type Language = typeof LANGUAGES[keyof typeof LANGUAGES];

// ── Exam categories ───────────────────────────────────────────────────────────
export const EXAM_CATEGORIES = [
  'SSC',
  'Railway',
  'Banking',
  'Bihar SI',
  'UPSC',
  'State PCS',
  'Defence',
  'Teaching',
  'Other',
] as const;

export type ExamCategory = typeof EXAM_CATEGORIES[number];

// ── Quiz ──────────────────────────────────────────────────────────────────────
export const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;
export type OptionLabel = typeof OPTION_LABELS[number];

// ── Pagination ────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;

// ── Leaderboard periods ───────────────────────────────────────────────────────
export const LEADERBOARD_PERIODS = ['daily', 'weekly', 'all-time'] as const;
export type LeaderboardPeriod = typeof LEADERBOARD_PERIODS[number];
