/**
 * QuizResultScreen — shows score, percentage, breakdown after submission.
 * Includes Share button using React Native Share API.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { quizService } from '../../api/quiz.service';
import { useLanguage } from '../../hooks/useLanguage';
import { useRateApp } from '../../hooks/useRateApp';
import { Button, LoadingSpinner, ProgressBar, QuizStatsCard } from '../../components';
import { RateAppModal } from '../../components/ui/RateAppModal';
import type { QuizAttempt } from '../../types/api.types';
import type { QuizScreenProps } from '../../types/navigation.types';
import { formatDuration, t } from '../../utils/format';

export function QuizResultScreen({ route, navigation }: QuizScreenProps<'QuizResult'>) {
  const { attemptId } = route.params;
  const { language } = useLanguage();
  const { shouldShowRatePrompt, recordCompletion, handleRated, handleRateLater, handleRateNever } = useRateApp();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResult = () => {
    setIsLoading(true);
    setError(null);
    quizService.getAttempt(attemptId)
      .then(({ data }) => {
        setAttempt(data.data ?? null);
        // Count this as a completed quiz for the rate-app trigger
        if (data.data) recordCompletion();
      })
      .catch((err: any) => setError(err?.response?.data?.message ?? 'Failed to load results'))
      .finally(() => setIsLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadResult(); }, [attemptId]);

  const handleShare = async () => {
    if (!attempt) return;
    const quiz = attempt.quiz as any;
    const quizTitle = quiz?.title ? t(quiz.title, language) : 'a quiz';
    const pct = attempt.percentage.toFixed(0);

    const message =
      `🏆 I just scored ${pct}% on "${quizTitle}" on RiseRank!\n` +
      `✅ Correct: ${attempt.correctCount}  ❌ Wrong: ${attempt.wrongCount}\n` +
      `⏱ Time: ${formatDuration(attempt.timeTakenSeconds)}\n\n` +
      `Prepare for SSC, Railway & Banking exams at https://riserank.in`;

    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { message, url: 'https://riserank.in' }
          : { message }
      );
    } catch {
      Toast.show({ type: 'error', text1: 'Could not open share sheet' });
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen message="Loading results..." />;
  if (error || !attempt) return (
    <SafeAreaView className="flex-1 bg-surface items-center justify-center px-8">
      <Text className="text-4xl mb-3">⚠️</Text>
      <Text className="text-text-primary font-semibold text-base text-center mb-1">
        {error ? 'Couldn\'t load results' : 'Result not found'}
      </Text>
      {error && <Text className="text-text-muted text-sm text-center mb-6">{error}</Text>}
      <View className="gap-3 w-full mt-4">
        {error && (
          <TouchableOpacity onPress={loadResult} className="bg-primary-600 px-6 py-3 rounded-xl items-center">
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => navigation.navigate('QuizList')}
          className="border border-border px-6 py-3 rounded-xl items-center"
        >
          <Text className="text-text-primary font-semibold">Back to Quizzes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const pct = attempt.percentage;
  const resultEmoji = pct >= 80 ? '🏆' : pct >= 60 ? '🎯' : pct >= 40 ? '📈' : '💪';
  const resultMsg   = pct >= 80 ? 'Excellent!' : pct >= 60 ? 'Good job!' : pct >= 40 ? 'Keep going!' : 'Keep practicing!';
  const quiz        = attempt.quiz as any;
  const quizTitle   = quiz?.title ? t(quiz.title, language) : 'Quiz';

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="bg-primary-600 px-6 pt-12 pb-8 items-center">
          <Text style={{ fontSize: 72 }}>{resultEmoji}</Text>
          <Text className="text-white text-2xl font-bold mt-3">{resultMsg}</Text>
          <Text className="text-primary-200 text-base mt-1" numberOfLines={1}>{quizTitle}</Text>

          {/* Big percentage */}
          <View className="mt-6 w-full">
            <View className="flex-row items-baseline justify-center">
              <Text className="text-white text-6xl font-bold">{pct.toFixed(0)}</Text>
              <Text className="text-primary-200 text-2xl ml-1">%</Text>
            </View>
            <View className="mt-3">
              <ProgressBar value={pct} height={10} color="#ffffff" />
            </View>
          </View>

          {/* Share button (inside hero) */}
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.8}
            className="mt-5 flex-row items-center gap-2 bg-white/20 px-5 py-2.5 rounded-full"
          >
            <Text style={{ fontSize: 16 }}>📤</Text>
            <Text className="text-white font-semibold text-sm">Share Result</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="mx-4 mt-5">
          <Text className="text-text-primary text-lg font-bold mb-3">Breakdown</Text>

          <QuizStatsCard
            correctCount={attempt.correctCount}
            wrongCount={attempt.wrongCount}
            skippedCount={attempt.skippedCount}
            score={attempt.score}
          />

          {/* Time taken */}
          <View className="bg-surface-card border border-border rounded-2xl p-4 mt-3">
            <Text className="text-text-secondary text-sm">⏱ Time taken</Text>
            <Text className="text-text-primary text-xl font-bold mt-1">
              {formatDuration(attempt.timeTakenSeconds)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="mx-4 mt-6 gap-3">
          <Button
            label="Review Answers"
            onPress={() => navigation.navigate('QuizReview', { attemptId })}
            fullWidth
            size="lg"
          />
          <Button
            label="Back to Quiz List"
            onPress={() => navigation.navigate('QuizList')}
            variant="outline"
            fullWidth
            size="lg"
          />
        </View>

        <View className="h-8" />
      </ScrollView>

      {/* Rate app prompt — shown after 5th completion */}
      <RateAppModal
        visible={shouldShowRatePrompt}
        onRate={handleRated}
        onLater={handleRateLater}
        onNever={handleRateNever}
      />
    </SafeAreaView>
  );
}
