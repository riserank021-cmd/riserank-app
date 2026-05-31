/**
 * OfflineBanner — slides down when the app has no internet connection.
 * Reads isOnline from appStore. Place this near the top of App.tsx
 * (inside SafeAreaProvider, outside NavigationContainer or just inside it).
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { useAppStore } from '../../store';

export function OfflineBanner() {
  const isOnline = useAppStore((s) => s.isOnline);
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOnline ? -50 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline, slideAnim]);

  return (
    <Animated.View
      style={{ transform: [{ translateY: slideAnim }] }}
      className="absolute top-0 left-0 right-0 z-50 bg-danger px-4 py-3 flex-row items-center justify-center"
    >
      <Text className="text-white text-sm font-semibold">
        📡 No internet connection
      </Text>
    </Animated.View>
  );
}
