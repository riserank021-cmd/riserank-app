/**
 * QuizHistoryCard — compact row showing a past quiz attempt result.
 * Used on the Profile screen's "Recent Quizzes" section.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { QuizAttempt } from '../../types/api.types';
import { useLanguage } from '../../hooks/useLanguage';
import { formatDate, formatDuration } from '../../utils/format';

interface QuizHistoryCardProps {
  attempt: QuizAttempt;
  onPress?: () => void;
}

export const QuizHistoryCard = React.memo(function QuizHistoryCard({ attempt, onPress }: QuizHistoryCardProps) {
  const { t } = useLanguage();
  const quiz = attempt.quiz as any;
  const title = quiz?.title ? t(quiz.title) : 'Quiz';
  const pct = attempt.percentage;

  const scoreColor =
    pct >= 80 ? 'text-success' : pct >= 60 ? 'text-warning' : 'text-danger';
  const scoreBg =
    pct >= 80 ? 'bg-success-light' : pct >= 60 ? 'bg-warning-light' : 'bg-danger-light';

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      className="bg-surface-card border border-border rounded-2xl px-4 py-3 mx-4 mb-2"
    >
      <View className="flex-row items-center justify-between">
        {/* Title + meta */}
        <View className="flex-1 mr-3">
          <Text className="text-text-primary text-sm font-semibold" numberOfLines={1}>
            {title}
          </Text>
          <View className="flex-row items-center mt-1 gap-3">
            <Text className="text-text-muted text-xs">
              ✅ {attempt.correctCount} / ❌ {attempt.wrongCount}
            </Text>
            <Text className="text-text-muted text-xs">
              ⏱ {formatDuration(attempt.timeTakenSeconds)}
            </Text>
          </View>
          <Text className="text-text-muted text-xs mt-0.5">
            {formatDate(attempt.createdAt)}
          </Text>
        </View>

        {/* Score badge */}
        <View className={`${scoreBg} rounded-xl px-3 py-2 items-center min-w-[56px]`}>
          <Text className={`${scoreColor} text-lg font-bold`}>{pct.toFixed(0)}%</Text>
          <Text className={`${scoreColor} text-[10px]`}>{attempt.score} pts</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});
