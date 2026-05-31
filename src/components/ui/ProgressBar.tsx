import React from 'react';
import { View, Text } from 'react-native';

interface ProgressBarProps {
  value: number;  // 0–100
  height?: number;
  showLabel?: boolean;
  color?: string;
}

export function ProgressBar({ value, height = 8, showLabel = false, color = '#2563EB' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <View>
      <View
        className="w-full bg-surface-muted rounded-full overflow-hidden"
        style={{ height }}
      >
        <View
          className="h-full rounded-full"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </View>
      {showLabel && (
        <Text className="text-xs text-text-secondary mt-1 text-right">{clamped.toFixed(0)}%</Text>
      )}
    </View>
  );
}
