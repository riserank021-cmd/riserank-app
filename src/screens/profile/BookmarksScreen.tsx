/**
 * BookmarksScreen — paginated list of the user's bookmarked questions.
 */

import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { userService } from '../../api/user.service';
import { usePagination } from '../../hooks/usePagination';
import { useLanguage } from '../../hooks/useLanguage';
import { LoadingSpinner, EmptyState, BookmarkCardSkeleton } from '../../components';
import type { Question } from '../../types/api.types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Bookmarks'>;

export function BookmarksScreen({ navigation }: Props) {
  const { t } = useLanguage();

  const fetcher = useCallback(async (page: number, limit: number) => {
    const { data } = await userService.getBookmarks({ page, limit });
    const items: Question[] = data.data ?? [];
    return {
      data: items,
      hasNextPage: data.pagination?.hasNextPage ?? false,
    };
  }, []);

  const {
    items,
    isLoading,
    loadingMore,
    error,
    onRefresh,
    refreshing,
    removeItem,
    flatListProps,
  } = usePagination<Question>(fetcher);

  const handleRemove = async (questionId: string) => {
    // Optimistically remove from list immediately
    removeItem((q) => q._id === questionId);
    try {
      await userService.removeBookmark(questionId);
      Toast.show({ type: 'success', text1: 'Bookmark removed' });
    } catch {
      // Restore by refreshing — we don't have the item in hand anymore
      onRefresh();
      Toast.show({ type: 'error', text1: 'Failed to remove bookmark' });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-3 border-b border-border">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-primary-600 font-medium text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-text-primary text-base font-bold">Bookmarks</Text>
      </View>

      {isLoading ? (
        <View style={{ paddingTop: 8 }}>
          {[0, 1, 2, 3].map((i) => <BookmarkCardSkeleton key={i} />)}
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-3">⚠️</Text>
          <Text className="text-text-primary font-semibold text-base text-center mb-1">
            Couldn't load bookmarks
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
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews
          ListEmptyComponent={
            <EmptyState
              icon="📌"
              title="No bookmarks yet"
              subtitle="Bookmark questions during a quiz to review them here"
            />
          }
          ListFooterComponent={loadingMore ? <LoadingSpinner /> : null}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
          }
          renderItem={({ item }) => (
            <View className="bg-surface-card border border-border rounded-2xl mx-4 mb-3 p-4">
              {/* Question text */}
              <Text className="text-text-primary text-base font-medium leading-5" numberOfLines={3}>
                {t(item.text)}
              </Text>

              {/* Correct answer */}
              <View className="flex-row items-center mt-3">
                <View className="bg-success-light border border-success rounded-lg px-2 py-1">
                  <Text className="text-success text-xs font-semibold">
                    ✓ {item.correctOption}
                  </Text>
                </View>
                <Text className="text-text-muted text-xs ml-2 flex-1" numberOfLines={1}>
                  {t(item.options.find((o) => o.label === item.correctOption)?.text ?? { en: '', hi: '' })}
                </Text>
              </View>

              {/* Difficulty + remove */}
              <View className="flex-row items-center justify-between mt-3">
                <View
                  className={`px-2 py-0.5 rounded-full ${
                    item.difficulty === 'easy'
                      ? 'bg-success-light'
                      : item.difficulty === 'medium'
                      ? 'bg-warning-light'
                      : 'bg-danger-light'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium capitalize ${
                      item.difficulty === 'easy'
                        ? 'text-success'
                        : item.difficulty === 'medium'
                        ? 'text-warning'
                        : 'text-danger'
                    }`}
                  >
                    {item.difficulty}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemove(item._id)}>
                  <Text className="text-danger text-xs font-medium">Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {...flatListProps}
        />
      )}
    </SafeAreaView>
  );
}
