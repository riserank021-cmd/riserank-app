/**
 * API response / entity type definitions.
 * These mirror the backend's response shapes.
 */

// ── Generic API response envelope ────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: Pagination;
  error?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  device?: 'android' | 'ios' | 'web';
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  preferredLanguage?: Language;
  device?: 'android' | 'ios' | 'web';
}

// ── User ─────────────────────────────────────────────────────────────────────

export type Language = 'en' | 'hi';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'superadmin';
  authProvider: 'local' | 'google';
  preferredLanguage: Language;
  preferredExams: string[];
  avatar: string | null;
  state?: string;
  isActive: boolean;
  isSuspended: boolean;
  isEmailVerified: boolean;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalQuizAttempts: number;
  totalCorrect: number;
  totalAnswered: number;
  totalTimeSpentSeconds: number;
  notificationsEnabled: boolean;
  fcmToken?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Bilingual content ─────────────────────────────────────────────────────────

export interface Bilingual {
  en: string;
  hi: string;
}

// ── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  _id: string;
  name: Bilingual;
  slug: string;
  examType: string;
  isActive: boolean;
  createdAt: string;
}

// ── Current Affairs ───────────────────────────────────────────────────────────

export interface CurrentAffair {
  _id: string;
  title: Bilingual;
  content: Bilingual;
  summary: Bilingual;
  imageUrl?: string;
  category: Category | string;
  tags: string[];
  publishedAt: string | null;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

// ── Question ──────────────────────────────────────────────────────────────────

export interface QuestionOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: Bilingual;
}

export interface Question {
  _id: string;
  text: Bilingual;
  options: QuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: Bilingual;
  difficulty: 'easy' | 'medium' | 'hard';
  examType: string;
  category: Category | string;
  attemptCount: number;
  correctCount: number;
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

export interface Quiz {
  _id: string;
  title: Bilingual;
  description: Bilingual;
  category: Category | string;
  questions: Question[] | string[];
  totalMarks: number;
  durationMinutes: number;
  negativeMarking: boolean;
  negativeMarkValue: number;
  isDaily: boolean;
  scheduledDate?: string;
  isPublished: boolean;
  attemptCount: number;
  createdAt: string;
}

// ── Quiz Attempt ──────────────────────────────────────────────────────────────

export interface AnswerPayload {
  question: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
}

export interface AttemptAnswer {
  question: string | Question;   // string ID when bare, populated Question when fetched via getAttempt
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  isCorrect: boolean;
  timeTakenSeconds?: number;
}

export interface QuizAttempt {
  _id: string;
  quiz: Quiz | string;
  user: User | string;
  answers: AttemptAnswer[];
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  percentage: number;
  timeTakenSeconds: number;
  isCompleted: boolean;
  language: Language;
  createdAt: string;
}

// ── Category Stats ────────────────────────────────────────────────────────────

export interface CategoryStat {
  categoryId: string;
  categoryName: Bilingual;
  totalAttempts: number;
  totalCorrect: number;
  totalQuestions: number;
  accuracy: number; // 0–100, rounded to 1 decimal
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  score: number;
  quizCount: number;
  period: 'daily' | 'weekly' | 'all-time';
}
