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
  body: Bilingual;        // backend field name
  content?: Bilingual;   // legacy alias — prefer body
  summary?: Bilingual;
  imageUrl?: string;
  category: Category | string;
  tags: string[];
  publishedAt: string | null;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  createdBy?: { _id: string; name: string } | null;
}

// ── Question ──────────────────────────────────────────────────────────────────

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D';   // backend field name (was incorrectly 'label')
  text: Bilingual;
}

export interface Question {
  _id: string;
  questionText: Bilingual;        // backend field name (was incorrectly 'text')
  options: QuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: Bilingual;
  difficulty: 'easy' | 'medium' | 'hard';
  examCategory: string;           // backend field name (was incorrectly 'examType')
  subject?: string;
  topic?: string;
  tags?: string[];
  attemptCount: number;
  correctCount: number;
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

export interface Quiz {
  _id: string;
  title: Bilingual;
  description: Bilingual;
  examCategory: string;              // ssc | railway | banking | bihar_si
  questions: Question[] | string[];
  difficulty: 'easy' | 'medium' | 'hard';
  totalMarks: number | null;
  durationSeconds: number;           // source of truth
  durationMinutes: number;           // Mongoose virtual (durationSeconds / 60)
  negativeMarking: boolean;
  negativeMarkValue: number;
  isDaily: boolean;
  scheduledDate?: string;
  isPractice: boolean;
  practiceSubject?: string | null;
  practiceTopic?: string | null;
  status: 'draft' | 'published' | 'archived';
  attemptCount: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
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
  /** All India Rank — rank among all users who attempted this quiz */
  rank?: number;
  totalAttempts?: number;
}

// ── Live Test ─────────────────────────────────────────────────────────────────

export interface LiveTest {
  _id: string;
  title: Bilingual;
  description: Bilingual;
  examCategory: string;
  questions: Question[] | string[];
  scheduledAt: string;
  durationSeconds: number;
  totalMarks: number | null;
  negativeMarking: boolean;
  negativeMarkValue: number;
  status: 'upcoming' | 'live' | 'ended';
  registeredCount: number;
  participantCount: number;
  endAt: string;
  createdAt: string;
}

export interface LiveTestAttempt {
  _id: string;
  liveTest: string | LiveTest;
  user: string | User;
  answers: AttemptAnswer[];
  score: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  percentage: number;
  timeTakenSeconds: number;
  isCompleted: boolean;
  rank: number | null;
  language: Language;
  startedAt: string;
  submittedAt: string | null;
}

export interface LiveTestLeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  score: number;
  percentage: number;
  correctCount: number;
  timeTakenSeconds: number;
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
