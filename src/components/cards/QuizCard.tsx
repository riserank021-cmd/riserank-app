/**
 * QuizCard — renders a quiz summary in the quiz list.
 */

import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import type { Quiz } from '../../types/api.types';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/format';

interface QuizCardProps {
  quiz: Quiz;
  onPress: () => void;
}

export const QuizCard = React.memo(function QuizCard({ quiz, onPress }: QuizCardProps) {
  const { language } = useLanguage();
  const title = t(quiz.title, language);
  const desc = t(quiz.description, language);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-surface-card rounded-2xl p-4 mx-4 mb-3 border border-border"
    >
      {quiz.isDaily && (
        <View className="bg-secondary-100 rounded-full px-3 py-1 self-start mb-2">
          <Text className="text-secondary-600 text-xs font-semibold">Daily Quiz</Text>
        </View>
      )}

      <Text className="text-text-primary text-base font-bold leading-5" numberOfLines={2}>
        {title}
      </Text>
      {desc ? (
        <Text className="text-text-secondary text-sm mt-1" numberOfLines={2}>
          {desc}
        </Text>
      ) : null}

      <View className="flex-row mt-3 gap-4">
        <View className="flex-row items-center">
          <Text>📝 </Text>
          <Text className="text-text-secondary text-xs">{quiz.questions.length} questions</Text>
        </View>
        <View className="flex-row items-center">
          <Text>⏱ </Text>
          <Text className="text-text-secondary text-xs">{quiz.durationMinutes} min</Text>
        </View>
        <View className="flex-row items-center">
          <Text>⭐ </Text>
          <Text className="text-text-secondary text-xs">{quiz.totalMarks} marks</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});
