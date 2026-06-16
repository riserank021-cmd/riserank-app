/**
 * LeaderboardScreen — weekly/daily/all-time rankings.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userService } from '../../api/user.service';
import { useAuth } from '../../hooks/useAuth';
import { useApiError } from '../../hooks/useApiError';
import { LeaderboardItem, LoadingSpinner, EmptyState } from '../../components';
import type { LeaderboardEntry } from '../../types/api.types';
import type { LeaderboardPeriod } from '../../utils/constants';

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'daily', label: 'Today' },
  { key: 'weekly', label: 'This Week' },
  { key: 'all-time', label: 'All Time' },
];

export function LeaderboardScreen() {
  const { user } = useAuth();
  const { extractError } = useApiError();
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (selectedPeriod: LeaderboardPeriod, isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setIsLoading(true);
    setError(null);
    try {
      const [listRes, rankRes] = await Promise.allSettled([
        userService.getLeaderboard(selectedPeriod, { limit: 50 }),
        userService.getMyRank(selectedPeriod),
      ]);
      if (listRes.status === 'fulfilled') {
        // Backend returns { user: {_id,name}, score, totalQuizzes, rank }
        // Map to the LeaderboardEntry shape the UI expects
        const raw: any[] = listRes.value.data.data ?? [];
        const mapped = raw.map((item, idx) => ({
          rank: typeof item.rank === 'number' && item.rank > 0 ? item.rank : idx + 1,
          userId: item.user?._id ?? String(item.user ?? ''),
          name: item.user?.name ?? 'User',
          avatar: item.user?.avatar ?? null,
          score: item.score ?? 0,
          quizCount: item.totalQuizzes ?? 0,
          period: selectedPeriod,
        }));
        setEntries(mapped);
      } else {
        setError(extractError(listRes.reason));
      }
      if (rankRes.status === 'fulfilled') {
        const rankData = rankRes.value.data.data;
        setMyRank(rankData?.rank ?? null);
      }
    } catch (err) {
      setError(extractError(err));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [extractError]);

  useEffect(() => {
    // Clear stale entries immediately so old data doesn't flash while loading
    setEntries([]);
    setMyRank(null);
    loadData(period);
  }, [period, loadData]);

  const onRefresh = () => loadData(period, true);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-4 pt-4 pb-3">
        <Text className="text-text-primary text-2xl font-bold">Leaderboard</Text>

        {myRank !== null && (
          <View className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-2.5 mt-3">
            <Text className="text-primary-700 text-sm font-medium">
              Your rank: <Text className="font-bold">#{myRank}</Text>
            </Text>
          </View>
        )}

        {/* Period tabs */}
        <View className="flex-row bg-surface-muted rounded-xl p-1 mt-3">
          {PERIODS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setPeriod(key)}
              className={`flex-1 py-2 rounded-lg items-center ${period === key ? 'bg-white shadow' : ''}`}
            >
              <Text className={`text-sm font-semibold ${period === key ? 'text-primary-600' : 'text-text-muted'}`}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading rankings..." />
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-3">⚠️</Text>
          <Text className="text-text-primary font-semibold text-base text-center mb-1">
            Couldn't load rankings
          </Text>
          <Text className="text-text-muted text-sm text-center mb-6">{error}</Text>
          <TouchableOpacity
            onPress={() => loadData(period)}
            className="bg-primary-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => `${item.userId}-${item.rank}`}
          renderItem={({ item }) => (
            <LeaderboardItem entry={item} isCurrentUser={item.userId === user?._id} />
          )}
          ListEmptyComponent={
            <EmptyState icon="🏆" title="No rankings yet" subtitle="Complete quizzes to appear here!" />
          }
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          maxToRenderPerBatch={20}
          windowSize={10}
          removeClippedSubviews
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
          }
        />
      )}
    </SafeAreaView>
  );
}
