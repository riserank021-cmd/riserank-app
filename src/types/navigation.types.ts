/**
 * React Navigation type definitions.
 * Each navigator gets a strongly-typed param list.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// ── Root Stack ────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

// ── Auth Stack ────────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  OTP: { userId: string; email: string; purpose: 'email_verification' | 'password_reset' };
  ForgotPassword: undefined;
  ResetPassword: { email: string };
};

// ── App (Bottom Tabs) ─────────────────────────────────────────────────────────

export type AppTabParamList = {
  HomeTab: undefined;
  QuizTab: undefined;
  CurrentAffairsTab: undefined;
  LeaderboardTab: undefined;
  ProfileTab: undefined;
};

// ── Home Stack ────────────────────────────────────────────────────────────────

export type HomeStackParamList = {
  Home: undefined;
  Search: undefined;
};

// ── Quiz Stack ────────────────────────────────────────────────────────────────

export type QuizStackParamList = {
  QuizList: { category?: string } | undefined;
  QuizDetail: { quizId: string };
  QuizAttempt: { quizId: string; attemptId: string };
  QuizResult: { attemptId: string };
  QuizReview: { attemptId: string };
};

// ── Current Affairs Stack ─────────────────────────────────────────────────────

export type CurrentAffairsStackParamList = {
  CurrentAffairsList: undefined;
  CurrentAffairsDetail: { id: string };
};

// ── Leaderboard Stack ─────────────────────────────────────────────────────────

export type LeaderboardStackParamList = {
  Leaderboard: undefined;
};

// ── Profile Stack ─────────────────────────────────────────────────────────────

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Bookmarks: undefined;
  QuizHistory: undefined;
  Settings: undefined;
  Notifications: undefined;
};

// ── Convenience screen prop types ─────────────────────────────────────────────

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type QuizScreenProps<T extends keyof QuizStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<QuizStackParamList, T>,
    BottomTabScreenProps<AppTabParamList>
  >;

export type CurrentAffairsScreenProps<T extends keyof CurrentAffairsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<CurrentAffairsStackParamList, T>,
    BottomTabScreenProps<AppTabParamList>
  >;
