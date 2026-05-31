/**
 * QuizReviewScreen — review all questions after completing a quiz attempt.
 *
 * For each question it shows:
 *   - The question text
 *   - All four options, colour-coded:
 *       green  = correct answer
 *       red    = user's wrong selection
 *       blue   = user's correct selection
 *       grey   = unselected options
 *   - Explanation (bilingual) below each question
 *
 * Reached via QuizResultScreen → "Review Answers" button.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { quizService } from '../../api/quiz.service';
import { useLanguage } from '../../hooks/useLanguage';
import { t } from '../../utils/format';
import type { QuizAttempt, Question, AttemptAnswer } from '../../types/api.types';
import type { QuizScreenProps } from '../../types/navigation.types';

type Props = QuizScreenProps<'QuizReview'>;

// ── Option colour helpers ─────────────────────────────────────────────────────

type OptionState = 'correct' | 'wrong' | 'missed' | 'neutral';

function getOptionState(
  optLabel: string,
  correctOption: string,
  selectedOption: string | null
): OptionState {
  const isCorrect = optLabel === correctOption;
  const isSelected = optLabel === selectedOption;

  if (isCorrect && isSelected) return 'correct';  // user got it right
  if (!isCorrect && isSelected) return 'wrong';    // user picked wrong
  if (isCorrect && !isSelected) return 'missed';   // right answer (not chosen)
  return 'neutral';
}

const STATE_STYLES: Record<OptionState, { container: string; badge: string; text: string }> = {
  correct: {
    container: 'border-green-500 bg-green-50',
    badge: 'bg-green-500',
    text: 'text-green-800 font-semibold',
  },
  wrong: {
    container: 'border-red-400 bg-red-50',
    badge: 'bg-red-400',
    text: 'text-red-800 font-semibold',
  },
  missed: {
    container: 'border-green-300 bg-green-50',
    badge: 'bg-green-300',
    text: 'text-green-700',
  },
  neutral: {
    container: 'border-border bg-surface-card',
    badge: 'bg-surface-muted',
    text: 'text-text-primary',
  },
};

// ── Sub-component: ReviewQuestionItem ─────────────────────────────────────────

interface ReviewItemProps {
  question: Question;
  userAnswer: AttemptAnswer | undefined;
  index: number;
  language: 'en' | 'hi';
}

function ReviewQuestionItem({ question, userAnswer, index, language }: ReviewItemProps) {
  const selectedOption = userAnswer?.selectedOption ?? null;
  const explanationText = t(question.explanation, language);
  const isCorrect = userAnswer?.isCorrect ?? false;

  return (
    <View className="mx-4 mb-5 bg-surface-card border border-border rounded-2xl overflow-hidden">
      {/* Question header */}
      <View className="flex-row items-start px-4 pt-4 pb-3">
        <View
          className={`w-6 h-6 rounded-full items-center justify-center mr-3 flex-shrink-0 ${
            selectedOption === null
              ? 'bg-surface-muted'
              : isCorrect
              ? 'bg-green-500'
              : 'bg-red-400'
          }`}
        >
          <Text className="text-white text-[10px] font-bold">
            {selectedOption === null ? '—' : isCorrect ? '✓' : '✗'}
          </Text>
        </View>
        <Text className="flex-1 text-text-primary text-sm font-semibold leading-5">
          {index + 1}. {t(question.text, language)}
        </Text>
      </View>

      {/* Options */}
      <View className="px-4 gap-2 pb-3">
        {question.options.map((opt) => {
          const state = getOptionState(opt.label, question.correctOption, selectedOption);
          const styles = STATE_STYLES[state];
          const optText = t(opt.text, language);

          return (
            <View
              key={opt.label}
              className={`flex-row items-center border rounded-xl px-3 py-2.5 ${styles.container}`}
            >
              <View className={`w-6 h-6 rounded-full items-center justify-center mr-2 flex-shrink-0 ${styles.badge}`}>
                <Text className="text-white text-[10px] font-bold">{opt.label}</Text>
              </View>
              <Text className={`flex-1 text-sm leading-5 ${styles.text}`}>{optText}</Text>
              {state === 'correct' && <Text className="text-green-600 ml-1">✓</Text>}
              {state === 'wrong' && <Text className="text-red-500 ml-1">✗</Text>}
            </View>
          );
        })}
      </View>

      {/* Skipped badge */}
      {selectedOption === null && (
        <View className="mx-4 mb-3 bg-surface-muted rounded-lg px-3 py-1.5">
          <Text className="text-text-muted text-xs font-medium">⏭ Skipped</Text>
        </View>
      )}

      {/* Explanation */}
      {explanationText ? (
        <View className="mx-4 mb-4 bg-primary-50 border border-primary-100 rounded-xl px-3 py-3">
          <Text className="text-primary-700 text-xs font-bold mb-1 uppercase tracking-wide">
            Explanation
          </Text>
          <Text className="text-primary-800 text-sm leading-5">{explanationText}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function QuizReviewScreen({ route, navigation }: Props) {
  const { attemptId } = route.params;
  const { language } = useLanguage();

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    quizService
      .getAttempt(attemptId)
      .then((res) => setAttempt(res.data.data ?? null))
      .catch(() => setError('Failed to load review. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [attemptId]);

  // ── Loading ──
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator color="#2563EB" size="large" />
        <Text className="text-text-muted text-sm mt-3">Loading review…</Text>
      </SafeAreaView>
    );
  }

  // ── Error ──
  if (error || !attempt) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center px-8">
        <Text style={{ fontSize: 48 }}>😕</Text>
        <Text className="text-text-primary text-lg font-bold mt-4 text-center">
          {error ?? 'Something went wrong'}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-6 bg-primary-600 rounded-xl px-8 py-3"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const totalCorrect = attempt.correctCount;
  const totalWrong = attempt.wrongCount;
  const totalSkipped = attempt.skippedCount;

  // Derive questions from the populated answers (backend populates answers.question)
  const questions: Question[] = attempt.answers
    .map((a) => a.question as unknown as Question)
    .filter((q): q is Question => typeof q === 'object' && q !== null && !!q._id);

  // Build a lookup: questionId → AttemptAnswer
  const answerMap: Record<string, AttemptAnswer> = {};
  attempt.answers.forEach((a) => {
    const q = a.question as unknown as Question;
    const qId = typeof q === 'object' && q !== null ? q._id : (q as unknown as string);
    answerMap[qId] = a;
  });

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-3 border-b border-border">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-9 h-9 rounded-full bg-surface-muted items-center justify-center mr-3"
        >
          <Text className="text-text-primary text-base">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-text-primary text-base font-bold" numberOfLines={1}>
            Review Answers
          </Text>
          <Text className="text-text-muted text-xs mt-0.5">
            {questions.length} questions · ✅ {totalCorrect} · ❌ {totalWrong} · ⏭ {totalSkipped}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
      >
        {questions.map((question, index) => (
          <ReviewQuestionItem
            key={question._id}
            question={question}
            userAnswer={answerMap[question._id]}
            index={index}
            language={language}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
