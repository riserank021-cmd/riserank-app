/**
 * QuizAttemptScreen — the active MCQ quiz experience.
 * Features: question navigation, answer selection, countdown timer, submit.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  AppState,
  BackHandler,
  ScrollView,
  Vibration,
  Animated,
  Dimensions,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { quizService } from '../../api/quiz.service';
import { getQuizById } from '../../api/quizCacheService';
import { userService } from '../../api/user.service';
import { useQuizStore } from '../../store';
import { useAppStore } from '../../store/appStore';
import { useLanguage } from '../../hooks/useLanguage';
import { Button, QuestionCard, ProgressBar } from '../../components';
import { ReportQuestionModal } from '../../components/quiz/ReportQuestionModal';
import { useRewardedAd } from '../../hooks/useRewardedAd';
import type { Question, AnswerPayload } from '../../types/api.types';
import type { OptionLabel } from '../../utils/constants';
import type { QuizScreenProps } from '../../types/navigation.types';
import { formatDuration } from '../../utils/format';

export function QuizAttemptScreen({ route, navigation }: QuizScreenProps<'QuizAttempt'>) {
  const { quizId, attemptId } = route.params;
  const { language } = useLanguage();
  const isOnline = useAppStore((s) => s.isOnline);

  const {
    activeQuiz,
    currentIndex,
    answers,
    timeTakenSeconds,
    isSubmitting,
    startAttempt,
    selectAnswer,
    goToNext,
    goToPrev,
    tick,
    setSubmitting,
    clearAttempt,
  } = useQuizStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Always points to the latest doSubmit — used inside setInterval callbacks
  // to avoid stale closures when activeQuiz / answers / timeTakenSeconds change.
  const submitRef = useRef<() => void>(() => {});
  // Slide animation for question transitions
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const [reportQuestionId, setReportQuestionId] = useState<string | null>(null);
  // Set of bookmarked question IDs for this attempt session
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  // Rewarded ad — user watches ad to skip/reveal hint for current question
  const { show: showRewarded, isLoaded: rewardedLoaded } = useRewardedAd();
  const [hintQuestionId, setHintQuestionId] = useState<string | null>(null);

  // ── Slide transition helpers ────────────────────────────────────────────────
  // Animates the current card out, swaps content (via `swap`), then animates in.
  const animateTransition = useCallback((direction: 'next' | 'prev', swap: () => void) => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    const outX = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    const inX  = direction === 'next' ?  SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(slideAnim, {
      toValue: outX,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      swap();               // update currentIndex while card is off-screen
      slideAnim.setValue(inX); // snap to the opposite off-screen side
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        isAnimating.current = false;
      });
    });
  }, [slideAnim]);

  const handleNext = useCallback(
    () => animateTransition('next', goToNext),
    [animateTransition, goToNext],
  );
  const handlePrev = useCallback(
    () => animateTransition('prev', goToPrev),
    [animateTransition, goToPrev],
  );

  const handleBookmark = async (questionId: string) => {
    const already = bookmarkedIds.has(questionId);
    if (already) {
      // Toggle off — remove bookmark
      try {
        await userService.removeBookmark(questionId);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
        Toast.show({ type: 'success', text1: 'Bookmark removed' });
      } catch {
        Toast.show({ type: 'error', text1: 'Failed to remove bookmark' });
      }
    } else {
      // Add bookmark
      try {
        await userService.addBookmark(questionId);
        setBookmarkedIds((prev) => new Set(prev).add(questionId));
        Toast.show({ type: 'success', text1: '📌 Question saved to Bookmarks' });
      } catch {
        Toast.show({ type: 'error', text1: 'Failed to bookmark question' });
      }
    }
  };

  // ── Load quiz on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    getQuizById(quizId).then(({ data }) => {
      if (!cancelled && data) {
        startAttempt(data, attemptId, language);
      }
    });
    return () => { cancelled = true; };
  }, [quizId, attemptId, language]);

  // ── Countdown timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeQuiz) return;
    const totalSeconds = (activeQuiz.durationMinutes ?? Math.round((activeQuiz.durationSeconds ?? 600) / 60)) * 60;

    timerRef.current = setInterval(() => {
      tick();
      if (useQuizStore.getState().timeTakenSeconds >= totalSeconds) {
        // Use the ref so we always call the latest doSubmit, never a stale closure.
        submitRef.current();
      }
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeQuiz]);

  // ── Pause timer when app goes to background ─────────────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        // App came back to foreground — restart the interval
        if (timerRef.current) clearInterval(timerRef.current);
        const totalSeconds = activeQuiz ? (activeQuiz.durationMinutes ?? Math.round((activeQuiz.durationSeconds ?? 600) / 60)) * 60 : 0;
        timerRef.current = setInterval(() => {
          tick();
          if (useQuizStore.getState().timeTakenSeconds >= totalSeconds) {
            submitRef.current();
          }
        }, 1000);
      } else {
        // App went to background / inactive — pause the interval
        if (timerRef.current) clearInterval(timerRef.current);
      }
    });
    return () => sub.remove();
  }, [activeQuiz]);

  // ── Block back button ───────────────────────────────────────────────────────
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmExit();
      return true;
    });
    return () => sub.remove();
  }, []);

  const confirmExit = () => {
    Alert.alert(
      'Exit quiz?',
      'Your progress will be lost if you exit now.',
      [
        { text: 'Continue', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => { clearAttempt(); navigation.goBack(); },
        },
      ]
    );
  };

  // doSubmit must be defined before handleSubmit so handleSubmit can reference it.
  const doSubmit = useCallback(async () => {
    if (!activeQuiz) return;
    if (timerRef.current) clearInterval(timerRef.current);
    Vibration.vibrate([0, 60, 40, 60]); // double-pulse on submit
    setSubmitting(true);

    const payload: AnswerPayload[] = (activeQuiz.questions as Question[]).map((q) => ({
      question: q._id,
      selectedOption: answers[q._id] ?? null,
    }));

    try {
      await quizService.submitAttempt(quizId, {
        answers: payload,
        timeTakenSeconds: useQuizStore.getState().timeTakenSeconds,
        language,
      });
      clearAttempt();
      navigation.replace('QuizResult', { attemptId });
    } catch (err: any) {
      setSubmitting(false);
      Toast.show({
        type: 'error',
        text1: 'Submit failed',
        text2: err?.response?.data?.message ?? 'Try again.',
      });
    }
  }, [activeQuiz, attemptId, language, answers, timeTakenSeconds, quizId]);

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (!activeQuiz) return;

    if (!autoSubmit) {
      const unanswered = activeQuiz.questions.length - Object.keys(answers).length;
      if (unanswered > 0) {
        Alert.alert(
          'Submit quiz?',
          `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`,
          [
            { text: 'Review', style: 'cancel' },
            { text: 'Submit', onPress: () => doSubmit() },
          ]
        );
        return;
      }
    }

    doSubmit();
  }, [activeQuiz, answers, doSubmit]);

  // ── Keep submitRef in sync so interval callbacks never use a stale closure ──
  useEffect(() => {
    submitRef.current = doSubmit;
  }, [doSubmit]);

  if (!activeQuiz) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <Text className="text-text-secondary">Loading quiz...</Text>
      </SafeAreaView>
    );
  }

  const questions = activeQuiz.questions as Question[];
  const totalSeconds = (activeQuiz.durationMinutes ?? Math.round((activeQuiz.durationSeconds ?? 600) / 60)) * 60;
  const remaining = Math.max(0, totalSeconds - timeTakenSeconds);
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answered = Object.keys(answers).length;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Top bar */}
      <View className="px-4 py-3 border-b border-border bg-surface-card">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
            onPress={confirmExit}
            accessibilityRole="button"
            accessibilityLabel="Exit quiz"
            accessibilityHint="Exits the quiz, progress will be lost"
          >
            <Text className="text-text-secondary font-medium">✕ Exit</Text>
          </TouchableOpacity>
          <View className={`px-3 py-1 rounded-full ${remaining <= 60 ? 'bg-danger-light' : 'bg-primary-50'}`}>
            <Text className={`font-bold text-sm ${remaining <= 60 ? 'text-danger' : 'text-primary-700'}`}>
              ⏱ {formatDuration(remaining)}
            </Text>
          </View>
          <Text className="text-text-secondary text-sm">{answered}/{questions.length} done</Text>
        </View>
        <ProgressBar value={progress} height={6} />
      </View>

      {/* Offline warning */}
      {!isOnline && (
        <View className="bg-warning-light border-b border-warning px-4 py-2 flex-row items-center">
          <Text className="text-warning text-xs font-medium">
            📴 No internet — answers are saved locally. Reconnect to submit.
          </Text>
        </View>
      )}

      {/* Question */}
      <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: slideAnim }] }]}>
        <QuestionCard
          question={questions[currentIndex]}
          selectedOption={answers[questions[currentIndex]?._id] ?? null}
          onSelect={(opt: OptionLabel) => selectAnswer(questions[currentIndex]._id, opt)}
          language={language}
          index={currentIndex}
          total={questions.length}
          onReport={(qId) => setReportQuestionId(qId)}
          onBookmark={handleBookmark}
          isBookmarked={bookmarkedIds.has(questions[currentIndex]?._id)}
        />
      </Animated.View>

      {/* Navigation */}
      <View className="px-4 pb-4 pt-3 border-t border-border bg-surface-card">
        {/* Question dot navigator */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          {questions.map((q, i) => {
            const isAnswered = !!answers[q._id];
            const isCurrent = i === currentIndex;
            const dotState = isCurrent ? 'current' : isAnswered ? 'answered' : 'unanswered';
            const dotLabel = `Question ${i + 1}${dotState === 'answered' ? ', answered' : dotState === 'current' ? ', current' : ''}`;

            return (
              <TouchableOpacity
                key={q._id}
                onPress={() => {
                  const direction = i > currentIndex ? 'next' : 'prev';
                  if (i !== currentIndex) {
                    animateTransition(direction, () => useQuizStore.getState().goToIndex(i));
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel={dotLabel}
                accessibilityState={{ selected: isCurrent }}
                className={`w-8 h-8 rounded-full mr-1.5 items-center justify-center ${
                  isCurrent
                    ? 'bg-primary-600'
                    : isAnswered
                    ? 'bg-success'
                    : 'bg-surface-muted border border-border'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isCurrent || isAnswered ? 'text-white' : 'text-text-muted'
                  }`}
                >
                  {i + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Rewarded hint row */}
        {rewardedLoaded && hintQuestionId !== questions[currentIndex]?._id && (
          <TouchableOpacity
            onPress={() => {
              const currentQ = questions[currentIndex];
              showRewarded(
                () => {
                  // Reward earned: reveal the correct answer by selecting it
                  const correctOpt = currentQ.options.find((o: any) => o.isCorrect);
                  if (correctOpt) {
                    selectAnswer(currentQ._id, correctOpt.key as OptionLabel);
                  }
                  setHintQuestionId(currentQ._id);
                  Toast.show({ type: 'success', text1: '💡 Hint revealed!', text2: 'Correct answer selected for you.' });
                },
                () => Toast.show({ type: 'info', text1: 'Ad not ready yet', text2: 'Try again in a moment.' })
              );
            }}
            className="flex-row items-center justify-center bg-amber-50 border border-amber-200 rounded-xl py-2 mb-3"
          >
            <Text className="text-amber-700 text-sm font-semibold">💡 Watch ad for hint</Text>
          </TouchableOpacity>
        )}

        <View className="flex-row gap-3">
          {currentIndex > 0 && (
            <Button label="← Prev" onPress={handlePrev} variant="outline" size="md" />
          )}
          <View className="flex-1">
            {currentIndex < questions.length - 1 ? (
              <Button label="Next →" onPress={handleNext} fullWidth size="md" />
            ) : (
              <Button
                label={isOnline ? 'Submit Quiz' : '📴 Offline'}
                onPress={() => handleSubmit(false)}
                loading={isSubmitting}
                disabled={!isOnline || isSubmitting}
                fullWidth
                size="md"
                variant="secondary"
              />
            )}
          </View>
        </View>
      </View>

      {/* Report question modal */}
      {reportQuestionId && (
        <ReportQuestionModal
          visible={!!reportQuestionId}
          questionId={reportQuestionId}
          onClose={() => setReportQuestionId(null)}
        />
      )}
    </SafeAreaView>
  );
}
