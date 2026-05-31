/**
 * SearchScreen — global search across quizzes and current affairs.
 *
 * Both searches run in parallel via Promise.allSettled.
 * Results are grouped into two collapsible sections.
 * Debounced 350ms after each keystroke.
 * Empty state shows popular categories as quick-launch chips.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { quizService } from '../../api/quiz.service';
import { currentAffairsService } from '../../api/currentAffairs.service';
import { useLanguage } from '../../hooks/useLanguage';
import { EXAM_CATEGORIES } from '../../utils/constants';
import type { Quiz, CurrentAffair } from '../../types/api.types';
import type { HomeStackParamList } from '../../types/navigation.types';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'Search'>;

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function SearchScreen() {
  const navigation = useNavigation<NavProp>();
  const { t, language } = useLanguage();
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [quizResults, setQuizResults] = useState<Quiz[]>([]);
  const [articleResults, setArticleResults] = useState<CurrentAffair[]>([]);
  const [searched, setSearched] = useState(false);

  // Auto-focus input on mount
  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(id);
  }, []);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setQuizResults([]);
      setArticleResults([]);
      setSearched(false);
      return;
    }

    setIsSearching(true);
    setSearched(true);

    const [quizRes, caRes] = await Promise.allSettled([
      quizService.list({ search: q, limit: 5 }),
      currentAffairsService.list({ search: q, limit: 5, language }),
    ]);

    setQuizResults(quizRes.status === 'fulfilled' ? (quizRes.value.data.data ?? []) : []);
    setArticleResults(caRes.status === 'fulfilled'  ? (caRes.value.data.data  ?? []) : []);
    setIsSearching(false);
  }, [language]);

  const handleChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(text), 350);
  };

  const handleClear = () => {
    setQuery('');
    setQuizResults([]);
    setArticleResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  const navigateToQuiz = (quizId: string) => {
    Keyboard.dismiss();
    navigation.getParent()?.dispatch(
      CommonActions.navigate({ name: 'QuizTab', params: { screen: 'QuizDetail', params: { quizId } } })
    );
  };

  const navigateToArticle = (id: string) => {
    Keyboard.dismiss();
    navigation.getParent()?.dispatch(
      CommonActions.navigate({ name: 'CurrentAffairsTab', params: { screen: 'CurrentAffairsDetail', params: { id } } })
    );
  };

  const navigateToCategory = (cat: string) => {
    Keyboard.dismiss();
    navigation.getParent()?.dispatch(
      CommonActions.navigate({
        name: 'QuizTab',
        params: { screen: 'QuizList', params: { category: cat } },
      })
    );
  };

  const totalResults = quizResults.length + articleResults.length;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Search bar */}
      <View className="flex-row items-center px-4 pt-4 pb-3 gap-3">
        <View className="flex-1 flex-row items-center bg-surface-card border border-border rounded-xl px-3">
          <Text className="text-text-muted mr-2 text-base">🔍</Text>
          <TextInput
            ref={inputRef}
            placeholder="Search quizzes, articles..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={handleChange}
            returnKeyType="search"
            onSubmitEditing={() => runSearch(query)}
            className="flex-1 py-3 text-text-primary text-sm"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text className="text-text-muted text-lg px-1">✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-primary-600 font-semibold text-sm">Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Loading indicator */}
      {isSearching && (
        <View className="items-center py-6">
          <ActivityIndicator color="#2563EB" />
          <Text className="text-text-muted text-sm mt-2">Searching...</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── Empty / initial state ── */}
        {!searched && !isSearching && (
          <View className="px-4 mt-4">
            <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
              Browse by exam
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {EXAM_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => navigateToCategory(cat)}
                  className="bg-primary-50 border border-primary-200 rounded-full px-4 py-2"
                >
                  <Text className="text-primary-700 text-sm font-medium">{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── No results ── */}
        {searched && !isSearching && totalResults === 0 && (
          <View className="items-center px-8 mt-12">
            <Text style={{ fontSize: 52 }}>🔎</Text>
            <Text className="text-text-primary text-lg font-bold mt-4 text-center">
              No results for "{query}"
            </Text>
            <Text className="text-text-secondary text-sm mt-2 text-center leading-5">
              Try different keywords or browse categories above
            </Text>
          </View>
        )}

        {/* ── Quiz results ── */}
        {quizResults.length > 0 && !isSearching && (
          <View className="mt-2">
            <View className="flex-row items-center justify-between px-4 mb-2">
              <Text className="text-text-primary text-base font-bold">Quizzes</Text>
              <Text className="text-text-muted text-xs">{quizResults.length} found</Text>
            </View>
            {quizResults.map((quiz) => (
              <TouchableOpacity
                key={quiz._id}
                onPress={() => navigateToQuiz(quiz._id)}
                activeOpacity={0.75}
                className="mx-4 mb-2 bg-surface-card border border-border rounded-xl px-4 py-3 flex-row items-center"
              >
                <View className="w-9 h-9 rounded-lg bg-primary-50 items-center justify-center mr-3">
                  <Text style={{ fontSize: 16 }}>📝</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-text-primary text-sm font-semibold" numberOfLines={1}>
                    {t(quiz.title)}
                  </Text>
                  <Text className="text-text-muted text-xs mt-0.5">
                    {quiz.questions.length} Qs · {quiz.durationMinutes} min
                  </Text>
                </View>
                <Text className="text-text-muted">›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Article results ── */}
        {articleResults.length > 0 && !isSearching && (
          <View className="mt-4">
            <View className="flex-row items-center justify-between px-4 mb-2">
              <Text className="text-text-primary text-base font-bold">Current Affairs</Text>
              <Text className="text-text-muted text-xs">{articleResults.length} found</Text>
            </View>
            {articleResults.map((article) => (
              <TouchableOpacity
                key={article._id}
                onPress={() => navigateToArticle(article._id)}
                activeOpacity={0.75}
                className="mx-4 mb-2 bg-surface-card border border-border rounded-xl px-4 py-3 flex-row items-center"
              >
                <View className="w-9 h-9 rounded-lg bg-orange-50 items-center justify-center mr-3">
                  <Text style={{ fontSize: 16 }}>📰</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-text-primary text-sm font-semibold" numberOfLines={1}>
                    {t(article.title)}
                  </Text>
                  {article.tags.length > 0 && (
                    <Text className="text-text-muted text-xs mt-0.5">
                      {article.tags.slice(0, 2).join(' · ')}
                    </Text>
                  )}
                </View>
                <Text className="text-text-muted">›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
