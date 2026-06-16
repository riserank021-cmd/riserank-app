/**
 * CurrentAffairsDetailScreen — full article with bilingual toggle.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { currentAffairsService } from '../../api/currentAffairs.service';
import { useLanguage } from '../../hooks/useLanguage';
import { LoadingSpinner, LanguageToggle } from '../../components';
import type { CurrentAffair } from '../../types/api.types';
import type { CurrentAffairsScreenProps } from '../../types/navigation.types';
import { t, formatDate } from '../../utils/format';

export function CurrentAffairsDetailScreen({ route, navigation }: CurrentAffairsScreenProps<'CurrentAffairsDetail'>) {
  const { id } = route.params;
  const { language } = useLanguage();
  const [item, setItem] = useState<CurrentAffair | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArticle = () => {
    setIsLoading(true);
    setError(null);
    currentAffairsService.getById(id)
      .then(({ data }) => setItem(data.data ?? null))
      .catch((err: any) => setError(err?.response?.data?.message ?? 'Failed to load article'))
      .finally(() => setIsLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadArticle(); }, [id]);

  const handleShare = async () => {
    if (!item) return;
    const articleTitle = t(item.title, language);
    const articleSummary = t(item.summary, language);
    const message = `📰 ${articleTitle}\n\n${articleSummary}\n\nRead more on RiseRank: https://riserank.in/article/${id}`;
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { message, url: `https://riserank.in/article/${id}` }
          : { message }
      );
    } catch {
      Toast.show({ type: 'error', text1: 'Could not open share sheet' });
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen message="Loading article..." />;
  if (error || !item) return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-row items-center px-4 pt-4 pb-3 border-b border-border">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-primary-600 font-medium text-base">← Back</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-4xl mb-3">⚠️</Text>
        <Text className="text-text-primary font-semibold text-base text-center mb-1">
          {error ? 'Couldn\'t load article' : 'Article not found'}
        </Text>
        {error && <Text className="text-text-muted text-sm text-center mb-6">{error}</Text>}
        {error && (
          <TouchableOpacity onPress={loadArticle} className="bg-primary-600 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );

  const title = t(item.title, language);
  const content = t(item.body ?? item.content, language);   // backend uses 'body'
  const summary = t(item.summary, language);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2 border-b border-border">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-primary-600 font-medium text-base">← Back</Text>
        </TouchableOpacity>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={handleShare}
            className="w-9 h-9 rounded-full bg-surface-muted border border-border items-center justify-center"
          >
            <Text style={{ fontSize: 16 }}>📤</Text>
          </TouchableOpacity>
          <LanguageToggle />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover image */}
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-52"
            resizeMode="cover"
          />
        )}

        <View className="px-4 pt-5">
          {/* Tags */}
          {(item.tags ?? []).length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-3">
              {(item.tags ?? []).map((tag) => (
                <View key={tag} className="bg-primary-50 border border-primary-200 rounded-full px-3 py-1">
                  <Text className="text-primary-700 text-xs font-medium">{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Title */}
          <Text className="text-text-primary text-2xl font-bold leading-7">{title}</Text>

          {/* Date, Time & Author */}
          <View className="flex-row items-center flex-wrap gap-2 mt-2">
            {item.publishedAt && (
              <Text className="text-text-muted text-xs">
                🕐 {formatDate(item.publishedAt, 'dd MMM yyyy, hh:mm a')}
              </Text>
            )}
            {item.createdBy?.name && (
              <View className="flex-row items-center">
                <Text className="text-text-muted text-xs">  •  </Text>
                <Text className="text-primary-600 text-xs font-medium">
                  ✍️ {item.createdBy.name}
                </Text>
              </View>
            )}
          </View>

          {/* Summary */}
          {summary ? (
            <View className="bg-primary-50 border-l-4 border-primary-600 rounded-r-xl px-4 py-3 mt-4">
              <Text className="text-primary-800 text-sm font-medium leading-5">{summary}</Text>
            </View>
          ) : null}

          {/* Full content */}
          {content ? (
            <Text className="text-text-primary text-base leading-7 mt-4">{content}</Text>
          ) : null}

          <View className="h-12" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
