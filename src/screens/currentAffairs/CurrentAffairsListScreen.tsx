/**
 * CurrentAffairsListScreen — paginated list with search.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { currentAffairsService } from '../../api/currentAffairs.service';
import { useLanguage } from '../../hooks/useLanguage';
import { useApiError } from '../../hooks/useApiError';
import { CurrentAffairCard, LoadingSpinner, EmptyState, LanguageToggle, CategoryFilterBar, CurrentAffairCardSkeleton } from '../../components';
import { BannerAdView } from '../../components/ads/BannerAdView';
import type { CurrentAffair } from '../../types/api.types';
import type { CurrentAffairsScreenProps } from '../../types/navigation.types';

// Common current affairs topic tags
const TOPIC_TAGS = [
  'Economy', 'Politics', 'Science', 'Sports', 'International',
  'Environment', 'Defence', 'Technology', 'Health', 'Awards',
] as const;

export function CurrentAffairsListScreen({ navigation }: CurrentAffairsScreenProps<'CurrentAffairsList'>) {
  const { language } = useLanguage();
  const { extractError } = useApiError();
  const [items, setItems] = useState<CurrentAffair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchItems = useCallback(async (pg = 1, query = search, currentTag = tag, reset = false) => {
    if (pg === 1) reset ? setIsLoading(true) : setRefreshing(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const { data } = await currentAffairsService.list({
        page: pg,
        limit: 15,
        search: query || undefined,
        language,
        ...(currentTag ? { tag: currentTag } : {}),
      });
      const newItems = data.data ?? [];
      setItems((prev) => pg === 1 ? newItems : [...prev, ...newItems]);
      setHasMore(data.pagination?.hasNextPage ?? false);
      setPage(pg);
    } catch (err) {
      if (pg === 1) setError(extractError(err));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [language, tag, extractError]);

  // Reload on language or tag change
  useEffect(() => { fetchItems(1, '', tag, true); }, [language, tag]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchItems(1, text, tag, true), 400);
  };

  const handleTagChange = (newTag: string) => {
    setTag(newTag);
    setSearch('');
    // useEffect fires via tag state change
  };

  const onRefresh = () => fetchItems(1, search, tag, true);
  const onEndReached = () => { if (hasMore && !loadingMore) fetchItems(page + 1, search, tag); };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-text-primary text-2xl font-bold">Current Affairs</Text>
          <LanguageToggle />
        </View>
        {/* Search */}
        <View className="bg-surface-card border border-border rounded-xl flex-row items-center px-3">
          <Text className="text-text-muted mr-2">🔍</Text>
          <TextInput
            placeholder="Search topics..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={handleSearchChange}
            className="flex-1 py-2.5 text-text-primary text-sm"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); fetchItems(1, '', tag, true); }}>
              <Text className="text-text-muted text-lg px-1">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Topic tag filter */}
      <CategoryFilterBar
        options={TOPIC_TAGS}
        selected={tag}
        onChange={handleTagChange}
      />

      {isLoading ? (
        <View style={{ paddingTop: 8 }}>
          {[0, 1, 2, 3, 4].map((i) => <CurrentAffairCardSkeleton key={i} />)}
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-3">⚠️</Text>
          <Text className="text-text-primary font-semibold text-base text-center mb-1">
            Couldn't load articles
          </Text>
          <Text className="text-text-muted text-sm text-center mb-6">{error}</Text>
          <TouchableOpacity
            onPress={() => fetchItems(1, search, tag, true)}
            className="bg-primary-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <CurrentAffairCard
              item={item}
              onPress={() => navigation.navigate('CurrentAffairsDetail', { id: item._id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="📰"
              title={search || tag ? 'No results found' : 'No news available'}
              subtitle={
                search ? 'Try a different search term'
                : tag   ? `No articles tagged "${tag}"`
                : 'Check back later'
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
      <BannerAdView />
    </SafeAreaView>
  );
}
