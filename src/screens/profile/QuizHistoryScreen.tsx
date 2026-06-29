/**
 * QuizHistoryScreen — paginated list of the user's past quiz attempts.
 */

import React, { useCallback } from 'react';
import { FlatList, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { quizService } from '../../api/quiz.service';
import { usePagination } from '../../hooks/usePagination';
import { QuizHistoryCard } from '../../components/cards/QuizHistoryCard';
import { LoadingSpinner, EmptyState, QuizHistoryCardSkeleton } from '../../components';
import type { QuizAttempt } from '../../types/api.types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'QuizHistory'>;

export function QuizHistoryScreen({ navigation }: Props) {
  const rootNav = useNavigation();

  const goToReview = (attemptId: string) => {
    rootNav.dispatch(
      CommonActions.navigate({
        name: 'QuizTab',
        params: { screen: 'QuizReview', params: { attemptId, source: 'history' } },
      })
    );
  };

  const fetcher = useCallback(async (page: number, limit: number) => {
    const { data } = await quizService.getHistory({ page, limit });
    return {
      data: (data.data ?? []) as QuizAttempt[],
      hasNextPage: data.pagination?.hasNextPage ?? false,
    };
  }, []);

  const { items, isLoading, loadingMore, error, onRefresh, refreshing, flatListProps } =
    usePagination<QuizAttempt>(fetcher);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-3 border-b border-border">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-primary-600 font-medium text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-text-primary text-base font-bold">Quiz History</Text>
      </View>

      {isLoading ? (
        <View style={{ paddingTop: 8 }}>
          {[0, 1, 2, 3].map((i) => <QuizHistoryCardSkeleton key={i} />)}
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-3">⚠️</Text>
          <Text className="text-text-primary font-semibold text-base text-center mb-1">
            Couldn't load history
          </Text>
          <Text className="text-text-muted text-sm text-center mb-6">{error}</Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="bg-primary-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews
          ListEmptyComponent={
            <EmptyState
              icon="📋"
              title="No attempts yet"
              subtitle="Complete your first quiz to see results here"
              actionLabel="Browse Quizzes"
              onAction={() => navigation.getParent()?.navigate('QuizTab')}
            />
          }
          ListFooterComponent={loadingMore ? <LoadingSpinner /> : null}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
          }
          renderItem={({ item }) => (
            <QuizHistoryCard
              attempt={item}
              onPress={() => goToReview(item._id)}
            />
          )}
          {...flatListProps}
        />
      )}
    </SafeAreaView>
  );
}
