/**
 * React Navigation deep-link configuration.
 *
 * Supported URLs:
 *   riserank://quiz                    → QuizTab > QuizList
 *   riserank://quiz/:id                → QuizTab > QuizDetail
 *   riserank://quiz/attempt/:attemptId → QuizTab > QuizAttempt
 *   riserank://quiz/result/:attemptId  → QuizTab > QuizResult
 *   riserank://quiz/review/:attemptId  → QuizTab > QuizReview
 *   riserank://article/:id             → CurrentAffairsTab > CurrentAffairsDetail
 *   riserank://articles                → CurrentAffairsTab > CurrentAffairsList
 *   riserank://leaderboard             → LeaderboardTab
 *   riserank://profile                 → ProfileTab
 *   riserank://home                    → HomeTab
 *   riserank://search                  → HomeTab > Search
 *
 * Universal links (https://riserank.in) use the same paths.
 *
 * The AndroidManifest <intent-filter> registers both schemes.
 * For iOS add the scheme to Info.plist CFBundleURLSchemes.
 */

import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation.types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'riserank://',
    'https://riserank.in',
    'http://riserank.in',
  ],

  config: {
    screens: {
      // Auth stack — not typically deep-linked but included for completeness
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },

      // Main app tabs
      App: {
        screens: {
          // Home tab — riserank://home, riserank://search
          HomeTab: {
            screens: {
              Home: 'home',
              Search: 'search',
            },
          },

          // Quiz tab — riserank://quiz*
          QuizTab: {
            screens: {
              QuizList: 'quiz',
              QuizDetail: 'quiz/:quizId',
              QuizAttempt: 'quiz/attempt/:attemptId',
              QuizResult: 'quiz/result/:attemptId',
              QuizReview: 'quiz/review/:attemptId',
            },
          },

          // Current Affairs — riserank://article/:id
          CurrentAffairsTab: {
            screens: {
              CurrentAffairsList: 'articles',
              CurrentAffairsDetail: 'article/:id',
            },
          },

          // Leaderboard — riserank://leaderboard
          LeaderboardTab: {
            screens: {
              Leaderboard: 'leaderboard',
            },
          },

          // Profile — riserank://profile/*
          ProfileTab: {
            screens: {
              Profile: 'profile',
              EditProfile: 'profile/edit',
              Bookmarks: 'profile/bookmarks',
              QuizHistory: 'profile/history',
              Notifications: 'profile/notifications',
              Settings: 'profile/settings',
            },
          },
        },
      },
    },
  },
};
