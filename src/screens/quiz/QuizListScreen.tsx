/**
 * QuizListScreen — paginated list of all available quizzes with category filter and search.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApiError } from '../../hooks/useApiError';
import { listQuizzes } from '../../api/quizCacheService';
import { QuizCard, LoadingSpinner, EmptyState, LanguageToggle, CategoryFilterBar, QuizCardSkeleton } from '../../components';
import { EXAM_CATEGORIES } from '../../utils/constants';
import type { Quiz } from '../../types/api.types';
import type { QuizScreenProps } from '../../types/navigation.types';

export function QuizListScreen({ navigation, route }: QuizScreenProps<'QuizList'>) {
  // Allow pre-selecting a category via route param (from SearchScreen chips or deep links)
  const initialCategory = route.params?.category ?? '';

  const { extractError } = useApiError();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [category, setCategory] = useState(initialCategory); // '' = All
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [listFromCache, setListFromCache] = useState(false);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchQuizzes = useCallback(async (pg = 1, cat = category, query = search, reset = false) => {
    if (pg === 1) reset ? setIsLoading(true) : setRefreshing(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const { data: items, fromCache } = await listQuizzes({
        page: pg,
        limit: 20,
        ...(cat ? { category: cat } : {}),
        ...(query ? { search: query } : {}),
      });
      const safeItems = items ?? [];
      // hasNextPage is not available from cache — assume false when serving stale
      setHasMore(fromCache ? false : safeItems.length === 20);
      setListFromCache(pg === 1 ? fromCache : false);
      setQuizzes((prev) => (pg === 1 ? safeItems : [...prev, ...safeItems]));
      setPage(pg);
    } catch (err) {
      if (pg === 1) setError(extractError(err));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [category, search, extractError]);

  // Reload when category changes; search state resets too
  useEffect(() => {
    setSearch('');
    fetchQuizzes(1, category, '', true);
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryChange = (cat: string) => setCategory(cat);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchQuizzes(1, category, text, true), 400);
  };

  const onRefresh    = () => fetchQuizzes(1, category, search, true);
  const onEndReached = () => { if (hasMore && !loadingMore) fetchQuizzes(page + 1, category, search); };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-text-primary text-2xl font-bold">Quizzes</Text>
          <LanguageToggle />
        </View>
        {/* Offline cache notice */}
        {listFromCache && (
          <View className="bg-warning-light border border-warning rounded-lg px-3 py-2 mb-3 flex-row items-center">
            <Text className="text-warning text-xs">📴 Showing cached results — you may be offline</Text>
          </View>
        )}
        {/* Search bar */}
        <View className="bg-surface-card border border-border rounded-xl flex-row items-center px-3">
          <Text className="text-text-muted mr-2">🔍</Text>
          <TextInput
            placeholder="Search quizzes..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={handleSearchChange}
            className="flex-1 py-2.5 text-text-primary text-sm"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); fetchQuizzes(1, category, '', true); }}>
              <Text className="text-text-muted text-lg px-1">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category filter chips */}
      <CategoryFilterBar
        options={EXAM_CATEGORIES}
        selected={category}
        onChange={handleCategoryChange}
      />

      <View className="h-px bg-border mx-4 mt-1 mb-0" />

      {isLoading ? (
        <View className="pt-3">
          {[0, 1, 2, 3, 4].map((i) => <QuizCardSkeleton key={i} />)}
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-3">⚠️</Text>
          <Text className="text-text-primary font-semibold text-base text-center mb-1">
            Couldn't load quizzes
          </Text>
          <Text className="text-text-muted text-sm text-center mb-6">{error}</Text>
          <TouchableOpacity
            onPress={() => fetchQuizzes(1, category, search, true)}
            className="bg-primary-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <QuizCard
              quiz={item}
              onPress={() => navigation.navigate('QuizDetail', { quizId: item._id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="📝"
              title={search || category ? 'No quizzes found' : 'No quizzes available'}
              subtitle={
                search    ? 'Try a different search term'
                : category ? `No ${category} quizzes yet`
                : 'Check back later for new quizzes'
              }
            />
          }
          ListFooterComponent={loadingMore ? <LoadingSpinner /> : null}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
          }
        />
      )}
    </SafeAreaView>
  );
}
