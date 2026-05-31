/**
 * useFCM — manages FCM token registration, foreground message toasts, and
 * background/killed notification tap navigation.
 *
 * Call this once inside a screen that's always mounted after login
 * (e.g. HomeScreen).
 *
 * Usage:
 *   useFCM();  // inside any component that lives within the authenticated tree
 */

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import {
  registerFCMToken,
  subscribeToTokenRefresh,
  subscribeToForegroundMessages,
  subscribeToNotificationTaps,
  checkInitialNotification,
} from '../services/notification.service';

export function useFCM() {
  const unsubRefresh = useRef<(() => void) | null>(null);
  const unsubForeground = useRef<(() => void) | null>(null);
  const unsubTaps = useRef<(() => void) | null>(null);

  useEffect(() => {
    const device = Platform.OS === 'ios' ? 'ios' : 'android';

    // 1. Register the FCM token with the backend
    registerFCMToken(device);

    // 2. Re-register when Firebase rotates the token
    subscribeToTokenRefresh(device).then((unsub) => {
      unsubRefresh.current = unsub;
    });

    // 3. Show foreground notifications as in-app toasts
    subscribeToForegroundMessages((title, body) => {
      Toast.show({ type: 'info', text1: title, text2: body, visibilityTime: 5000 });
    }).then((unsub) => {
      unsubForeground.current = unsub;
    });

    // 4. Handle taps when app is in background
    subscribeToNotificationTaps().then((unsub) => {
      unsubTaps.current = unsub;
    });

    // 5. Handle tap when app was launched from killed state
    checkInitialNotification();

    return () => {
      unsubRefresh.current?.();
      unsubForeground.current?.();
      unsubTaps.current?.();
    };
  }, []);
}
