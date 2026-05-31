/**
 * useUnreadNotifications — returns the count of notifications received after the
 * last time the user opened the Notifications screen.
 *
 * Usage:
 *   const { unreadCount, markAllRead } = useUnreadNotifications();
 *
 * Call markAllRead() when the user opens the NotificationsScreen.
 */

import { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import type { StoredNotification } from '../screens/profile/NotificationsScreen';

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const computeUnread = useCallback(async () => {
    try {
      const [notifications, lastReadAt] = await Promise.all([
        storage.get<StoredNotification[]>(STORAGE_KEYS.NOTIFICATIONS),
        storage.get<string>(STORAGE_KEYS.NOTIF_LAST_READ_AT),
      ]);

      if (!notifications || notifications.length === 0) {
        setUnreadCount(0);
        return;
      }

      if (!lastReadAt) {
        // Never read — all are unread, cap badge at 99
        setUnreadCount(Math.min(notifications.length, 99));
        return;
      }

      const lastRead = new Date(lastReadAt).getTime();
      const count = notifications.filter(
        (n) => new Date(n.receivedAt).getTime() > lastRead
      ).length;
      setUnreadCount(Math.min(count, 99));
    } catch {
      setUnreadCount(0);
    }
  }, []);

  // Recompute when app comes to foreground
  useEffect(() => {
    computeUnread();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') computeUnread();
    });

    return () => sub.remove();
  }, [computeUnread]);

  const markAllRead = useCallback(async () => {
    try {
      await storage.set(STORAGE_KEYS.NOTIF_LAST_READ_AT, new Date().toISOString());
      setUnreadCount(0);
    } catch {
      // non-critical
    }
  }, []);

  return { unreadCount, markAllRead };
}
