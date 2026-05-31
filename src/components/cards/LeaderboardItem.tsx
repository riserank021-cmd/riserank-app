/**
 * LeaderboardItem — single row in the leaderboard list.
 */

import React from 'react';
import { View, Text, Image } from 'react-native';
import type { LeaderboardEntry } from '../../types/api.types';

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export const LeaderboardItem = React.memo(function LeaderboardItem({ entry, isCurrentUser = false }: LeaderboardItemProps) {
  const medal = RANK_MEDALS[entry.rank];

  return (
    <View
      className={`flex-row items-center px-4 py-3 mx-4 mb-2 rounded-2xl border ${
        isCurrentUser ? 'bg-primary-50 border-primary-200' : 'bg-surface-card border-border'
      }`}
    >
      {/* Rank */}
      <View className="w-10 items-center">
        {medal ? (
          <Text style={{ fontSize: 22 }}>{medal}</Text>
        ) : (
          <Text className="text-text-secondary text-base font-bold">#{entry.rank}</Text>
        )}
      </View>

      {/* Avatar */}
      <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mx-3 overflow-hidden">
        {entry.avatar ? (
          <Image source={{ uri: entry.avatar }} className="w-10 h-10" />
        ) : (
          <Text className="text-primary-700 font-bold text-base">
            {entry.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* Name */}
      <View className="flex-1">
        <Text className={`font-semibold ${isCurrentUser ? 'text-primary-700' : 'text-text-primary'}`}>
          {entry.name}
          {isCurrentUser ? ' (You)' : ''}
        </Text>
        <Text className="text-text-muted text-xs">{entry.quizCount} quizzes</Text>
      </View>

      {/* Score */}
      <Text className="text-text-primary font-bold text-base">{entry.score}</Text>
    </View>
  );
});
