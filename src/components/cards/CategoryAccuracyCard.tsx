/**
 * CategoryAccuracyCard — shows per-category accuracy as a vertical list of
 * labelled progress bars. Rendered on ProfileScreen.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { ProgressBar } from '../ui/ProgressBar';
import type { CategoryStat } from '../../types/api.types';
import type { Language } from '../../utils/constants';

interface Props {
  stats: CategoryStat[];
  language: Language;
}

function accuracyColor(accuracy: number): string {
  if (accuracy >= 70) return '#16A34A'; // green
  if (accuracy >= 50) return '#D97706'; // amber
  return '#DC2626';                     // red
}

export const CategoryAccuracyCard = React.memo(function CategoryAccuracyCard({
  stats,
  language,
}: Props) {
  if (stats.length === 0) {
    return (
      <View className="bg-surface-card border border-border rounded-2xl p-4 items-center">
        <Text style={{ fontSize: 28 }}>📊</Text>
        <Text className="text-text-secondary text-sm mt-2 text-center">
          Complete quizzes to see your category breakdown
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-surface-card border border-border rounded-2xl p-4">
      <Text className="text-text-primary text-sm font-semibold mb-3">By Category</Text>

      {stats.map((item, index) => {
        const name =
          typeof item.categoryName === 'string'
            ? item.categoryName
            : (item.categoryName[language] || item.categoryName.en);
        const color = accuracyColor(item.accuracy);

        return (
          <View
            key={item.categoryId}
            className={index < stats.length - 1 ? 'mb-4' : ''}
          >
            {/* Category name + accuracy % */}
            <View className="flex-row items-center justify-between mb-1.5">
              <Text
                className="text-text-primary text-sm font-medium flex-1 mr-2"
                numberOfLines={1}
              >
                {name}
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-text-muted text-xs">
                  {item.totalAttempts} quiz{item.totalAttempts !== 1 ? 'zes' : ''}
                </Text>
                <Text className="font-bold text-sm" style={{ color }}>
                  {item.accuracy}%
                </Text>
              </View>
            </View>

            <ProgressBar value={item.accuracy} height={6} color={color} />
          </View>
        );
      })}
    </View>
  );
});
