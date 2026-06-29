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
import { useAuthStore } from '../../store/authStore';
import { Button, LoadingSpinner, ProgressBar } from '../../components';
import { RateAppModal } from '../../components/ui/RateAppModal';
import { useInterstitialAd } from '../../hooks/useInterstitialAd';
import type { QuizAttempt, AttemptAnswer } from '../../types/api.types';
import type { QuizScreenProps } from '../../types/navigation.types';
import { formatDuration, t } from '../../utils/format';

// ── Motivational message based on score ──────────────────────────────────────
function getMotivationalMessage(pct: number, firstName: string): string {
  if (pct >= 80) return `Outstanding, ${firstName}! You're on fire! 🔥`;
  if (pct >= 60) return `Good try, ${firstName}! Keep practicing, keep improving.`;
  if (pct >= 40) return `Don't give up, ${firstName}! Every attempt makes you stronger.`;
  return `Keep going, ${firstName}! Consistency is the key to success.`;
}

export function QuizResultScreen({ route, navigation }: QuizScreenProps<'QuizResult'>) {
  const { attemptId } = route.params;
  const { language } = useLanguage();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0] ?? 'Champion';
  const { shouldShowRatePrompt, recordCompletion, handleRated, handleRateLater, handleRateNever } = useRateApp();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { show: showInterstitial } = useInterstitialAd();

  const loadResult = () => {
    setIsLoading(true);
    setError(null);
    quizService.getAttempt(attemptId)
      .then(({ data }) => {
        setAttempt(data.data ?? null);
        // Count this as a completed quiz for the rate-app trigger
        if (data.data) {
          recordCompletion();
          // Show interstitial ad after result loads (1.5s delay for UX)
          setTimeout(() => showInterstitial(), 1500);
        }
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

  const pct       = attempt.percentage;
  const quiz      = attempt.quiz as any;
  const quizTitle = quiz?.title ? t(quiz.title, language) : 'Quiz';
  const rank      = attempt.rank;
  const totalAttempts = attempt.totalAttempts;

  // Answer palette: derive state for each answered question in order
  const answerStates: Array<'correct' | 'wrong' | 'skipped'> = attempt.answers.map(
    (a: AttemptAnswer) => {
      if (!a.selectedOption) return 'skipped';
      return a.isCorrect ? 'correct' : 'wrong';
    }
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Motivational banner — teal, like Testbook */}
        <View className="bg-teal-500 px-6 py-4 items-center">
          <Text className="text-white text-base font-bold text-center">
            {getMotivationalMessage(pct, firstName)}
          </Text>
        </View>

        {/* Hero */}
        <View className="bg-primary-600 px-6 pt-8 pb-8 items-center">
          <Text className="text-primary-200 text-sm mb-1" numberOfLines={1}>{quizTitle}</Text>

          {/* Big percentage */}
          <View className="mt-2 w-full">
            <View className="flex-row items-baseline justify-center">
              <Text className="text-white text-6xl font-bold">{pct.toFixed(0)}</Text>
              <Text className="text-primary-200 text-2xl ml-1">%</Text>
            </View>
            <View className="mt-3">
              <ProgressBar value={pct} height={10} color="#ffffff" />
            </View>
          </View>

          {/* Share button */}
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.8}
            className="mt-5 flex-row items-center gap-2 bg-white/20 px-5 py-2.5 rounded-full"
          >
            <Text style={{ fontSize: 16 }}>📤</Text>
            <Text className="text-white font-semibold text-sm">Share Result</Text>
          </TouchableOpacity>
        </View>

        {/* All India Rank card */}
        {rank != null && totalAttempts != null && (
          <View className="mx-4 mt-4 bg-surface-card border border-border rounded-2xl p-4 flex-row items-center">
            <Text style={{ fontSize: 32 }}>🏆</Text>
            <View className="ml-3 flex-1">
              <Text className="text-text-muted text-xs uppercase tracking-wide font-semibold">Your Rank</Text>
              <View className="flex-row items-baseline mt-0.5">
                <Text className="text-primary-600 text-2xl font-bold">{rank}</Text>
                <Text className="text-text-secondary text-sm ml-1">/ {totalAttempts} students</Text>
              </View>
            </View>
          </View>
        )}

        {/* Stats row — INCORRECT | CORRECT | TIME like Testbook */}
        <View className="flex-row mx-4 mt-4 gap-3">
          {[
            { label: 'CORRECT', value: String(attempt.correctCount), color: 'text-green-600' },
            { label: 'INCORRECT', value: String(attempt.wrongCount), color: 'text-red-500' },
            { label: 'SKIPPED', value: String(attempt.skippedCount), color: 'text-text-muted' },
          ].map(({ label, value, color }) => (
            <View key={label} className="flex-1 bg-surface-card border border-border rounded-2xl p-3 items-center">
              <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
              <Text className="text-text-muted text-[10px] font-semibold mt-0.5 tracking-wide">{label}</Text>
            </View>
          ))}
        </View>

        {/* Time taken */}
        <View className="mx-4 mt-3 bg-surface-card border border-border rounded-2xl px-4 py-3 flex-row items-center">
          <Text className="text-text-muted text-sm">⏱ Time taken  </Text>
          <Text className="text-text-primary text-sm font-bold">{formatDuration(attempt.timeTakenSeconds)}</Text>
        </View>

        {/* YOUR ANSWERS palette — like Testbook */}
        {answerStates.length > 0 && (
          <View className="mx-4 mt-4 bg-surface-card border border-border rounded-2xl p-4">
            <Text className="text-text-muted text-xs font-bold uppercase tracking-wide mb-3">Your Answers</Text>
            <View className="flex-row flex-wrap gap-2">
              {answerStates.map((state, i) => (
                <View
                  key={i}
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    state === 'correct'
                      ? 'bg-green-500'
                      : state === 'wrong'
                      ? 'bg-red-500'
                      : 'bg-surface-muted border border-border'
                  }`}
                >
                  <Text className={`text-xs font-bold ${state === 'skipped' ? 'text-text-muted' : 'text-white'}`}>
                    {i + 1}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View className="mx-4 mt-6 gap-3">
          <Button
            label="View Solution"
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
