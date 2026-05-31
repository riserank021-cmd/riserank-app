/**
 * notification.service.ts
 *
 * Handles FCM token lifecycle:
 *   1. Request notification permission from the OS
 *   2. Get the device's FCM token from @react-native-firebase/messaging
 *   3. Register the token with the backend (POST /notifications/token)
 *   4. Refresh the token when Firebase rotates it
 *
 * Usage — call registerFCMToken() right after a successful login/register:
 *   await registerFCMToken('android');
 */

import { Platform } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { apiClient } from '../api/client';
import { navigationRef } from '../navigation/navigationRef';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import type { StoredNotification } from '../screens/profile/NotificationsScreen';

// ── Notification history helpers ──────────────────────────────────────────────
async function saveNotification(title: string, body: string, data?: Record<string, string>) {
  try {
    const existing = (await storage.get<StoredNotification[]>(STORAGE_KEYS.NOTIFICATIONS)) ?? [];
    const entry: StoredNotification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      body,
      receivedAt: new Date().toISOString(),
      data,
    };
    // Prepend newest first, keep max 50 entries
    const updated = [entry, ...existing].slice(0, 50);
    await storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
  } catch {
    // Non-critical — notification history is best-effort
  }
}

type DeviceType = 'android' | 'ios' | 'web';

// ── Lazy import Firebase to avoid crashing if not installed ───────────────────
async function getMessaging() {
  try {
    const { default: messaging } = await import('@react-native-firebase/messaging');
    return messaging();
  } catch {
    return null;
  }
}

// ── Request permission ────────────────────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  const messaging = await getMessaging();
  if (!messaging) return false;

  try {
    const authStatus = await messaging.requestPermission();
    const { AuthorizationStatus } = await import('@react-native-firebase/messaging');
    return (
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL
    );
  } catch {
    return false;
  }
}

// ── Get FCM token ─────────────────────────────────────────────────────────────
export async function getFCMToken(): Promise<string | null> {
  const messaging = await getMessaging();
  if (!messaging) return null;

  try {
    // Ensure APNs token is registered first on iOS
    if (Platform.OS === 'ios') {
      await messaging.registerDeviceForRemoteMessages();
    }
    const token = await messaging.getToken();
    return token ?? null;
  } catch {
    return null;
  }
}

// ── Register token with backend ───────────────────────────────────────────────
export async function registerFCMToken(device: DeviceType = 'android'): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const token = await getFCMToken();
  if (!token) return;

  try {
    await apiClient.post('/notifications/token', { token, device });
  } catch {
    // Non-critical — app works without notifications
  }
}

// ── Deregister token on logout ────────────────────────────────────────────────
// Call before clearing auth tokens so the request is still authenticated.
export async function deregisterFCMToken(): Promise<void> {
  const token = await getFCMToken();
  if (!token) return;

  try {
    await apiClient.delete('/notifications/token', { data: { token } });
  } catch {
    // Non-critical — token will expire on its own
  }
}

// ── Token refresh listener ────────────────────────────────────────────────────
// Call this once after login and store the unsubscribe fn to clean up on logout.
export async function subscribeToTokenRefresh(device: DeviceType = 'android'): Promise<() => void> {
  const messaging = await getMessaging();
  if (!messaging) return () => {};

  const unsubscribe = messaging.onTokenRefresh(async (newToken: string) => {
    try {
      await apiClient.post('/notifications/token', { token: newToken, device });
    } catch {
      // silent
    }
  });

  return unsubscribe;
}

// ── Foreground message listener (show a toast) ────────────────────────────────
export async function subscribeToForegroundMessages(
  onMessage: (title: string, body: string) => void
): Promise<() => void> {
  const messaging = await getMessaging();
  if (!messaging) return () => {};

  const unsubscribe = messaging.onMessage(async (remoteMessage: any) => {
    const title = remoteMessage?.notification?.title ?? 'RiseRank';
    const body  = remoteMessage?.notification?.body ?? '';
    const data  = remoteMessage?.data as Record<string, string> | undefined;
    // Persist to local notification history
    await saveNotification(title, body, data);
    onMessage(title, body);
  });

  return unsubscribe;
}

// ── Notification tap navigation ───────────────────────────────────────────────

/**
 * Resolve a notification's data payload to a navigation action and dispatch it.
 *
 * Backend should include `data.type` on every FCM message. Supported types:
 *   quiz        → QuizTab > QuizDetail   (requires data.quizId)
 *   article     → CurrentAffairsTab > CurrentAffairsDetail (requires data.articleId)
 *   leaderboard → LeaderboardTab
 *   streak      → HomeTab
 *   (fallback)  → HomeTab
 */
export function handleNotificationTap(data?: Record<string, string>) {
  if (!navigationRef.isReady()) return;

  const type = data?.type;

  if (type === 'quiz' && data?.quizId) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'App',
        params: {
          screen: 'QuizTab',
          params: { screen: 'QuizDetail', params: { quizId: data.quizId } },
        },
      })
    );
  } else if (type === 'article' && data?.articleId) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'App',
        params: {
          screen: 'CurrentAffairsTab',
          params: { screen: 'CurrentAffairsDetail', params: { id: data.articleId } },
        },
      })
    );
  } else if (type === 'leaderboard') {
    navigationRef.dispatch(
      CommonActions.navigate({ name: 'App', params: { screen: 'LeaderboardTab' } })
    );
  } else {
    navigationRef.dispatch(
      CommonActions.navigate({ name: 'App', params: { screen: 'HomeTab' } })
    );
  }
}

/**
 * Subscribe to notification taps when the app is in the background.
 * Returns an unsubscribe function — call once after login.
 */
export async function subscribeToNotificationTaps(): Promise<() => void> {
  const messaging = await getMessaging();
  if (!messaging) return () => {};

  const unsubscribe = messaging.onNotificationOpenedApp((remoteMessage: any) => {
    const data = remoteMessage?.data as Record<string, string> | undefined;
    handleNotificationTap(data);
  });

  return unsubscribe;
}

/**
 * Check if the app was launched from a killed state by tapping a notification.
 * Call once on mount — after the navigation container is ready.
 */
export async function checkInitialNotification(): Promise<void> {
  const messaging = await getMessaging();
  if (!messaging) return;

  try {
    const remoteMessage = await messaging.getInitialNotification();
    if (remoteMessage) {
      const data = remoteMessage?.data as Record<string, string> | undefined;
      // Small delay to ensure the navigation container has fully mounted
      setTimeout(() => handleNotificationTap(data), 500);
    }
  } catch {
    // silent — non-critical
  }
}
