/**
 * QuestionCard — renders a single MCQ question with options.
 * Used inside QuizAttemptScreen.
 * Each answer option plays a brief spring scale-pop on tap for tactile feedback.
 */

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Vibration, Animated } from 'react-native';
import type { Question } from '../../types/api.types';
import type { Language, OptionLabel } from '../../utils/constants';
import { t } from '../../utils/format';

interface QuestionCardProps {
  question: Question;
  selectedOption: OptionLabel | null | undefined;
  onSelect: (option: OptionLabel) => void;
  language: Language;
  index: number;
  total: number;
  /** Optional — if provided, a ⚑ Report button appears in the question header */
  onReport?: (questionId: string) => void;
  /** Optional — if provided, a 📌 Bookmark button appears in the question header */
  onBookmark?: (questionId: string) => void;
  /** Whether this question is already bookmarked by the user */
  isBookmarked?: boolean;
}

const OPTION_COLORS: Record<string, { default: string; selected: string }> = {
  A: { default: 'border-border', selected: 'border-primary-600 bg-primary-50' },
  B: { default: 'border-border', selected: 'border-primary-600 bg-primary-50' },
  C: { default: 'border-border', selected: 'border-primary-600 bg-primary-50' },
  D: { default: 'border-border', selected: 'border-primary-600 bg-primary-50' },
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

export function QuestionCard({
  question,
  selectedOption,
  onSelect,
  language,
  index,
  total,
  onReport,
  onBookmark,
  isBookmarked = false,
}: QuestionCardProps) {
  const questionText = t(question.text, language);

  // One Animated.Value per option label — persists across re-renders for this question
  const scaleAnims = useRef<Record<string, Animated.Value>>(
    Object.fromEntries(OPTION_LABELS.map((l) => [l, new Animated.Value(1)])),
  ).current;

  const playTap = (label: string) => {
    const anim = scaleAnims[label];
    if (!anim) return;
    Animated.spring(anim, {
      toValue: 1.04,
      speed: 50,
      bounciness: 12,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(anim, {
        toValue: 1,
        speed: 40,
        bounciness: 6,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <ScrollView className="flex-1 bg-surface" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="text-text-muted text-xs font-medium">
          Question {index + 1} of {total}
        </Text>
        <View className="flex-row items-center gap-3">
          {onBookmark && (
            <TouchableOpacity
              onPress={() => onBookmark(question._id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
              accessibilityState={{ selected: isBookmarked }}
            >
              <Text className={`text-xs ${isBookmarked ? 'text-primary-600' : 'text-text-muted'}`}>
                {isBookmarked ? '📌' : '🔖'} Save
              </Text>
            </TouchableOpacity>
          )}
          {onReport && (
            <TouchableOpacity
              onPress={() => onReport(question._id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Report question"
              accessibilityHint="Opens a form to report an issue with this question"
            >
              <Text className="text-text-muted text-xs">⚑ Report</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Question text */}
      <View className="bg-surface-card mx-4 rounded-2xl p-5 border border-border mb-4">
        <Text className="text-text-primary text-base leading-6 font-medium">{questionText}</Text>
      </View>

      {/* Options */}
      <View className="px-4 gap-3">
        {question.options.map((opt) => {
          const isSelected = selectedOption === opt.label;
          const { default: def, selected } = OPTION_COLORS[opt.label];
          const optionText = t(opt.text, language);

          return (
            <Animated.View
              key={opt.label}
              style={{ transform: [{ scale: scaleAnims[opt.label] }] }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  Vibration.vibrate(30); // light tap
                  playTap(opt.label);
                  onSelect(opt.label as OptionLabel);
                }}
                accessibilityRole="radio"
                accessibilityLabel={`Option ${opt.label}: ${optionText}`}
                accessibilityState={{ selected: isSelected }}
                className={`flex-row items-start bg-surface-card border-2 rounded-2xl p-4 ${
                  isSelected ? selected : def
                }`}
              >
                <View
                  className={`w-7 h-7 rounded-full border-2 items-center justify-center mr-3 flex-shrink-0 ${
                    isSelected ? 'bg-primary-600 border-primary-600' : 'border-border'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-text-secondary'}`}
                  >
                    {opt.label}
                  </Text>
                </View>
                <Text
                  className={`flex-1 text-base leading-5 ${
                    isSelected ? 'text-primary-700 font-medium' : 'text-text-primary'
                  }`}
                >
                  {optionText}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Bottom spacer */}
      <View className="h-24" />
    </ScrollView>
  );
}
