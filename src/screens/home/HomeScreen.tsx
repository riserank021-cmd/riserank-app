/**
 * HomeScreen — streak card, daily quiz CTA, recent current affairs preview.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { quizService } from '../../api/quiz.service';
import { currentAffairsService } from '../../api/currentAffairs.service';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useFCM } from '../../hooks/useFCM';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import {
  StreakCard,
  StatsSummaryBanner,
  CurrentAffairCard,
  LanguageToggle,
  DailyQuizSkeleton,
  CurrentAffairCardSkeleton,
} from '../../components';
import { StreakMilestoneModal } from '../../components/ui/StreakMilestoneModal';
import { useStreakMilestone } from '../../hooks/useStreakMilestone';
import type { Quiz, CurrentAffair } from '../../types/api.types';
import type { AppTabParamList, HomeStackParamList } from '../../types/navigation.types';
import { t } from '../../utils/format';

type NavProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  BottomTabNavigationProp<AppTabParamList>
>;

export function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { milestone, dismiss: dismissMilestone } = useStreakMilestone(user?.currentStreak ?? 0);

  const [dailyQuiz, setDailyQuiz] = useState<Quiz | null>(null);
  const [recentAffairs, setRecentAffairs] = useState<CurrentAffair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [quizRes, caRes] = await Promise.allSettled([
        quizService.getDaily(),
        currentAffairsService.list({ limit: 3, page: 1 }),
      ]);

      if (quizRes.status === 'fulfilled') {
        setDailyQuiz(quizRes.value.data.data ?? null);
      }
      if (caRes.status === 'fulfilled') {
        setRecentAffairs(caRes.value.data.data ?? []);
      }
    } catch {
      // Errors handled silently — sections show empty state
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  // Register FCM token + subscribe to foreground messages (once, after login)
  useFCM();

  const { unreadCount } = useUnreadNotifications();
  const firstName = user?.name.split(' ')[0] ?? 'there';

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
      >
        {/* Top bar */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <View>
            <Text className="text-text-muted text-sm">{greeting},</Text>
            <Text className="text-text-primary text-xl font-bold">{firstName} 👋</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => navigation.navigate('Search')}
              accessibilityRole="button"
              accessibilityLabel="Search"
              accessibilityHint="Search quizzes and articles"
              className="w-9 h-9 rounded-full bg-surface-muted border border-border items-center justify-center"
            >
              <Text style={{ fontSize: 16 }}>🔍</Text>
            </TouchableOpacity>
            {/* Bell with unread badge */}
            <TouchableOpacity
              onPress={() =>
                navigation.dispatch(
                  CommonActions.navigate({ name: 'ProfileTab', params: { screen: 'Notifications' } })
                )
              }
              accessibilityRole="button"
              accessibilityLabel={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
              className="w-9 h-9 rounded-full bg-surface-muted border border-border items-center justify-center"
            >
              <Text style={{ fontSize: 16 }}>🔔</Text>
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-danger rounded-full min-w-4 h-4 items-center justify-center px-1">
                  <Text className="text-white text-xs font-bold" style={{ fontSize: 10 }}>
                    {unreadCount > 9 ? '9+' : String(unreadCount)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <LanguageToggle />
          </View>
        </View>

        {/* Streak */}
        <View className="mt-4">
          <StreakCard />
        </View>

        {/* Stats summary */}
        <View className="mt-3">
          <StatsSummaryBanner />
        </View>

        {/* Daily Quiz CTA */}
        <View className="mx-4 mt-4">
          <Text className="text-text-primary text-lg font-bold mb-3">Today's Challenge</Text>

          {isLoading ? (
            <DailyQuizSkeleton />
          ) : dailyQuiz ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'QuizTab',
                    params: { screen: 'QuizDetail', params: { quizId: dailyQuiz._id } },
                  })
                )
              }
              className="bg-secondary-500 rounded-2xl p-5"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-white text-xs font-semibold uppercase tracking-wide mb-1">
                    Daily Quiz
                  </Text>
                  <Text className="text-white text-base font-bold leading-5" numberOfLines={2}>
                    {t(dailyQuiz.title, language)}
                  </Text>
                  <View className="flex-row mt-3 gap-3">
                    <Text className="text-orange-100 text-xs">
                      📝 {(dailyQuiz.questions ?? []).length} Qs
                    </Text>
                    <Text className="text-orange-100 text-xs">
                      ⏱ {dailyQuiz.durationMinutes} min
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 48 }}>📝</Text>
              </View>
              <View className="bg-white/20 rounded-xl mt-4 py-2.5 items-center">
                <Text className="text-white font-bold text-sm">Start Quiz →</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View className="bg-surface-card border border-border rounded-2xl p-5 items-center">
              <Text style={{ fontSize: 36 }}>🗓</Text>
              <Text className="text-text-secondary text-sm mt-2">No daily quiz today</Text>
            </View>
          )}
        </View>

        {/* Recent Current Affairs */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-text-primary text-lg font-bold">Current Affairs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CurrentAffairsTab')}>
              <Text className="text-primary-600 text-sm font-semibold">See all →</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <>{[0, 1, 2].map((i) => <CurrentAffairCardSkeleton key={i} />)}</>
          ) : recentAffairs.length > 0 ? (
            recentAffairs.map((item) => (
              <CurrentAffairCard
                key={item._id}
                item={item}
                onPress={() =>
                  navigation.dispatch(
                    CommonActions.navigate({
                      name: 'CurrentAffairsTab',
                      params: {
                        screen: 'CurrentAffairsDetail',
                        params: { id: item._id },
                      },
                    })
                  )
                }
              />
            ))
          ) : (
            <View className="mx-4 bg-surface-card border border-border rounded-2xl p-5 items-center">
              <Text className="text-text-secondary text-sm">No recent news available</Text>
            </View>
          )}
        </View>

        {/* Bottom spacer */}
        <View className="h-6" />
      </ScrollView>

      {/* Streak milestone celebration */}
      {milestone !== null && (
        <StreakMilestoneModal
          visible
          milestone={milestone}
          onDismiss={dismissMilestone}
        />
      )}
    </SafeAreaView>
  );
}
