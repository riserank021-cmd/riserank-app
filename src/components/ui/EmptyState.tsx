import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = '📭', title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <Text style={{ fontSize: 56 }}>{icon}</Text>
      <Text className="text-text-primary text-xl font-bold mt-4 text-center">{title}</Text>
      {subtitle && <Text className="text-text-secondary text-sm mt-2 text-center leading-5">{subtitle}</Text>}
      {actionLabel && onAction && (
        <View className="mt-6">
          <Button label={actionLabel} onPress={onAction} variant="outline" />
        </View>
      )}
    </View>
  );
}
