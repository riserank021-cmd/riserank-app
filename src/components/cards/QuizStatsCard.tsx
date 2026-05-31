/**
 * QuizStatsCard — compact correct/wrong/skipped/score grid.
 *
 * Used in:
 *   - QuizResultScreen (full-size, 2×2 grid)
 *   - QuizHistoryCard  (compact, single row)
 *
 * Props control layout mode via `compact` flag.
 */

import React from 'react';
import { View, Text } from 'react-native';

interface StatItem {
  emoji: string;
  label: string;
  value: number | string;
  color: string; // Tailwind bg class
}

interface Props {
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  score: number;
  /** Compact mode renders a single row instead of 2×2 grid */
  compact?: boolean;
}

export function QuizStatsCard({ correctCount, wrongCount, skippedCount, score, compact = false }: Props) {
  const stats: StatItem[] = [
    { emoji: '✅', label: 'Correct', value: correctCount, color: 'bg-success-light' },
    { emoji: '❌', label: 'Wrong',   value: wrongCount,   color: 'bg-danger-light'  },
    { emoji: '⏭',  label: 'Skipped', value: skippedCount, color: 'bg-warning-light' },
    { emoji: '⭐', label: 'Score',   value: score,        color: 'bg-primary-50'    },
  ];

  if (compact) {
    // Single row — slim chips
    return (
      <View className="flex-row gap-2 flex-wrap">
        {stats.map(({ emoji, label, value, color }) => (
          <View key={label} className={`flex-row items-center gap-1 ${color} rounded-lg px-2 py-1`}>
            <Text style={{ fontSize: 12 }}>{emoji}</Text>
            <Text className="text-text-primary text-xs font-semibold">{value}</Text>
            <Text className="text-text-muted text-xs">{label}</Text>
          </View>
        ))}
      </View>
    );
  }

  // 2×2 grid (full-size, for results screen)
  return (
    <View className="flex-row flex-wrap gap-3">
      {stats.map(({ emoji, label, value, color }) => (
        <View key={label} className={`flex-1 min-w-[40%] ${color} rounded-2xl p-4`}>
          <Text style={{ fontSize: 24 }}>{emoji}</Text>
          <Text className="text-text-primary text-xl font-bold mt-1">{value}</Text>
          <Text className="text-text-secondary text-xs mt-0.5">{label}</Text>
        </View>
      ))}
    </View>
  );
}
