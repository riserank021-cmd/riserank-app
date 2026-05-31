/**
 * QuizDetailScreen — shows quiz info and a "Start" button.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { quizService } from '../../api/quiz.service';
import { getQuizById } from '../../api/quizCacheService';
import { useLanguage } from '../../hooks/useLanguage';
import { Button, LoadingSpinner } from '../../components';
import type { Quiz } from '../../types/api.types';
import type { QuizScreenProps } from '../../types/navigation.types';
import { t } from '../../utils/format';

// Resolve category display name — category can be a populated object or a plain string/id
function categoryName(cat: any): string | null {
  if (!cat) return null;
  if (typeof cat === 'string') return cat.length < 30 ? cat : null; // skip raw ObjectIds
  return cat.name ?? null;
}

export function QuizDetailScreen({ route, navigation }: QuizScreenProps<'QuizDetail'>) {
  const { quizId } = route.params;
  const { language } = useLanguage();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  const loadQuiz = () => {
    setIsLoading(true);
    setError(null);
    getQuizById(quizId)
      .then(({ data, fromCache: cached }) => {
        setQuiz(data);
        setFromCache(cached);
        if (!data) setError('Quiz not found');
      })
      .catch(() => setError('Failed to load quiz'))
      .finally(() => setIsLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadQuiz(); }, [quizId]);

  const handleStart = async () => {
    if (!quiz) return;
    setIsStarting(true);
    try {
      const { data } = await quizService.startAttempt(quizId);
      const attemptId = data.data?.attemptId ?? '';
      navigation.navigate('QuizAttempt', { quizId, attemptId });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Cannot start quiz',
        text2: err?.response?.data?.message ?? 'Try again.',
      });
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen message="Loading..." />;

  if (error || !quiz) return (
    <SafeAreaView className="flex-1 bg-surface">
      <TouchableOpacity onPress={() => navigation.goBack()} className="px-4 pt-4 pb-2">
        <Text className="text-primary-600 font-medium text-base">← Back</Text>
      </TouchableOpacity>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-4xl mb-3">⚠️</Text>
        <Text className="text-text-primary font-semibold text-base text-center mb-1">
          {error ? 'Couldn\'t load quiz' : 'Quiz not found'}
        </Text>
        {error && <Text className="text-text-muted text-sm text-center mb-6">{error}</Text>}
        {error && (
          <TouchableOpacity onPress={loadQuiz} className="bg-primary-600 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );

  const title = t(quiz.title, language);
  const description = t(quiz.description, language);
  const catLabel = categoryName(quiz.category);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()} className="px-4 pt-4 pb-2">
          <Text className="text-primary-600 font-medium text-base">← Back</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View className="bg-primary-600 mx-4 rounded-2xl p-6 mt-2">
          {/* Offline cache notice */}
          {fromCache && (
            <View className="bg-white/10 rounded-lg px-3 py-1.5 mb-3 flex-row items-center">
              <Text className="text-white/80 text-xs">📴 Showing cached data — you may be offline</Text>
            </View>
          )}
          {/* Badges row */}
          {(quiz.isDaily || catLabel) && (
            <View className="flex-row flex-wrap gap-2 mb-3">
              {quiz.isDaily && (
                <View className="bg-white/20 rounded-full px-3 py-1">
                  <Text className="text-white text-xs font-semibold">Daily Quiz</Text>
                </View>
              )}
              {catLabel && (
                <View className="bg-white/20 rounded-full px-3 py-1">
                  <Text className="text-white text-xs font-semibold">{catLabel}</Text>
                </View>
              )}
            </View>
          )}
          <Text className="text-white text-xl font-bold leading-6">{title}</Text>
        </View>

        {/* Description */}
        {description ? (
          <Text className="px-4 mt-4 text-text-secondary text-sm leading-5">{description}</Text>
        ) : null}

        {/* Stats grid */}
        <View className="flex-row mx-4 mt-4 gap-3">
          {[
            { icon: '📝', label: 'Questions', value: String(quiz.questions.length) },
            { icon: '⏱', label: 'Duration', value: `${quiz.durationMinutes} min` },
            { icon: '⭐', label: 'Total Marks', value: String(quiz.totalMarks) },
            { icon: '❌', label: 'Negative', value: quiz.negativeMarking ? `−${quiz.negativeMarkValue}` : 'None' },
          ].map(({ icon, label, value }) => (
            <View key={label} className="flex-1 bg-surface-card border border-border rounded-xl p-3 items-center">
              <Text style={{ fontSize: 20 }}>{icon}</Text>
              <Text className="text-text-primary font-bold text-sm mt-1">{value}</Text>
              <Text className="text-text-muted text-xs mt-0.5">{label}</Text>
            </View>
          ))}
        </View>

        {/* Attempts */}
        <View className="mx-4 mt-3 bg-surface-card border border-border rounded-xl px-4 py-3">
          <Text className="text-text-secondary text-sm">
            🎯 <Text className="text-text-primary font-semibold">{quiz.attemptCount}</Text> attempts by all users
          </Text>
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-4 pb-6 pt-3 border-t border-border bg-surface-card">
        <Button
          label="Start Quiz"
          onPress={handleStart}
          loading={isStarting}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}
