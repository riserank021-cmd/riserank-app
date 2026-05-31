/**
 * ScreenHeader — consistent top bar used across all content screens.
 *
 * Usage:
 *   <ScreenHeader title="Quiz List" />
 *   <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
 *   <ScreenHeader title="Quizzes" rightSlot={<LanguageToggle />} />
 */

import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Renders a ← Back button and calls this on press */
  onBack?: () => void;
  /** Custom back label (default: '← Back') */
  backLabel?: string;
  /** Slot for a right-side component (icon, toggle, button, etc.) */
  rightSlot?: React.ReactNode;
  /** Override the default bg-surface-card background */
  className?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backLabel = '← Back',
  rightSlot,
  className = '',
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`bg-surface-card border-b border-border px-4 pb-3 ${className}`}
      style={{ paddingTop: insets.top + 8 }}
    >
      {/* Back row — only rendered if onBack is provided */}
      {onBack && (
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} className="mb-1">
          <Text className="text-primary-600 font-medium text-sm">{backLabel}</Text>
        </TouchableOpacity>
      )}

      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-text-primary text-xl font-bold" numberOfLines={1}>{title}</Text>
          {subtitle && (
            <Text className="text-text-secondary text-xs mt-0.5">{subtitle}</Text>
          )}
        </View>
        {rightSlot && <View>{rightSlot}</View>}
      </View>
    </View>
  );
}
