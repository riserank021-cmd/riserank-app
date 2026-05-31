/**
 * StatsSummaryBanner — compact horizontal stats row shown on HomeScreen.
 * Shows: current streak 🔥, total quiz attempts 📝, accuracy 🎯.
 * Reads from the authenticated user object (no extra API call).
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { computeAccuracy } from '../../utils/format';

interface StatPillProps {
  icon: string;
  value: string | number;
  label: string;
}

function StatPill({ icon, value, label }: StatPillProps) {
  return (
    <View className="flex-1 bg-surface-card border border-border rounded-2xl items-center py-3 px-2">
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text className="text-text-primary text-base font-bold mt-1">{value}</Text>
      <Text className="text-text-muted text-[10px] font-medium text-center leading-3 mt-0.5">
        {label}
      </Text>
    </View>
  );
}

export function StatsSummaryBanner() {
  const { user } = useAuth();

  if (!user) return null;

  const accuracy = computeAccuracy(user.totalCorrect, user.totalQuizAttempts, user.totalAnswered);

  return (
    <View className="flex-row gap-3 mx-4">
      <StatPill icon="🔥" value={user.currentStreak} label="Day Streak" />
      <StatPill icon="📝" value={user.totalQuizAttempts} label="Quizzes" />
      <StatPill icon="🎯" value={accuracy !== null ? `${accuracy}%` : '—'} label="Accuracy" />
    </View>
  );
}
