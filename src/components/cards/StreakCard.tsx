/**
 * StreakCard — displays current streak with a flame icon.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export function StreakCard() {
  const { user } = useAuth();

  const streak = user?.currentStreak ?? 0;
  const longest = user?.longestStreak ?? 0;

  return (
    <View className="bg-primary-600 rounded-2xl p-5 mx-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-primary-100 text-sm font-medium">Current Streak</Text>
          <View className="flex-row items-end mt-1">
            <Text className="text-white text-4xl font-bold">{streak}</Text>
            <Text className="text-primary-200 text-lg mb-1 ml-1">days</Text>
          </View>
          <Text className="text-primary-200 text-xs mt-1">Best: {longest} days</Text>
        </View>
        <Text style={{ fontSize: 56 }}>🔥</Text>
      </View>
    </View>
  );
}
