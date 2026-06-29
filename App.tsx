/**
 * App.tsx — Root component
 * Wraps the app with all necessary providers:
 *   - GestureHandlerRootView (react-native-gesture-handler)
 *   - SafeAreaProvider (react-native-safe-area-context)
 *   - NavigationContainer (React Navigation)
 *   - OfflineBanner (slides down when disconnected)
 *   - ToastMessage (global toast notifications)
 *
 * The actual navigation tree lives in src/navigation/RootNavigator.tsx.
 */

import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { RootNavigator } from './src/navigation/RootNavigator';
import { OfflineBanner } from './src/components/ui/OfflineBanner';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { useDarkMode } from './src/hooks/useDarkMode';
import { useAppStore } from './src/store/appStore';
import { linking } from './src/navigation/linking';
import { navigationRef } from './src/navigation/navigationRef';
import { initCrashReporter, reportError } from './src/services/crashReporter';
import { configureGoogleSignIn } from './src/services/googleAuth.service';
import { initAds } from './src/services/ads.service';
import { useAppVersion } from './src/hooks/useAppVersion';
import { UpdateModal } from './src/components/ui/UpdateModal';

// Initialise Sentry as early as possible — before any React render.
initCrashReporter();
// Initialise AdMob
initAds();

// Configure Google Sign-In once at module load time.
// Replace the string below with your Web Client ID from Google Cloud Console,
// or read it from react-native-config: Config.GOOGLE_WEB_CLIENT_ID
configureGoogleSignIn('850247455628-3tqi27p6reju52k720v23j70c0d3ta0l.apps.googleusercontent.com');

function AppInner() {
  // Subscribes to network changes and keeps appStore.isOnline updated
  useNetworkStatus();

  const { isDark } = useDarkMode();
  const { forceUpdate, softUpdate, maintenanceMode, latestVersion, checked } = useAppVersion();
  const [softUpdateDismissed, setSoftUpdateDismissed] = useState(false);

  const showUpdate = checked && (
    maintenanceMode ||
    forceUpdate ||
    (softUpdate && !softUpdateDismissed)
  );

  return (
    // Root View carries the 'dark' class — NativeWind dark: variants react to it
    <View className={`flex-1 ${isDark ? 'dark' : ''}`}>
      <NavigationContainer ref={navigationRef} linking={linking}>
        <RootNavigator />
      </NavigationContainer>
      <OfflineBanner />
      <Toast />

      {/* Version update / maintenance modal — rendered above everything else */}
      <UpdateModal
        visible={showUpdate}
        latestVersion={latestVersion}
        forceUpdate={forceUpdate || maintenanceMode}
        maintenanceMode={maintenanceMode}
        onDismiss={(!forceUpdate && !maintenanceMode) ? () => setSoftUpdateDismissed(true) : undefined}
      />
    </View>
  );
}

export default function App() {
  const hydrateTheme = useAppStore((s) => s.hydrateTheme);

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  return (
    <ErrorBoundary onError={reportError} navigationRef={navigationRef}>
      <GestureHandlerRootView className="flex-1">
        <SafeAreaProvider>
          <AppInner />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
