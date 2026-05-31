/**
 * RootNavigator
 * Decides whether to show Auth flow or App (bottom-tabs) flow
 * based on `isAuthenticated` from authStore.
 *
 * Shows a blank screen while the store is being hydrated (isHydrated = false)
 * to prevent a flash of the wrong navigator.
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore, useAppStore } from '../store';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import type { RootStackParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isHydrated, hydrate } = useAuthStore();
  const { hydrateLanguage } = useAppStore();

  useEffect(() => {
    // Hydrate auth + language in parallel on first mount
    Promise.all([hydrate(), hydrateLanguage()]);
  }, []);

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
