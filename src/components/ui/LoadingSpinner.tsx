import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  return (
    <View
      className={`items-center justify-center ${fullScreen ? 'flex-1 bg-surface' : 'py-8'}`}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={message ?? 'Loading'}
    >
      <ActivityIndicator size="large" color="#2563EB" />
      {message && <Text className="text-text-secondary text-sm mt-3">{message}</Text>}
    </View>
  );
}
