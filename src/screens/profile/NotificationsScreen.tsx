/**
 * NotificationsScreen — displays locally-stored FCM notification history.
 *
 * Notifications are saved to AsyncStorage by notification.service.ts
 * whenever a foreground message arrives. The list is ordered newest-first.
 * The user can swipe-to-dismiss individual entries (long-press → confirm)
 * or clear all with the header button.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';
import { timeAgo } from '../../utils/format';
import { EmptyState } from '../../components';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../types/navigation.types';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  receivedAt: string; // ISO date string
  data?: Record<string, string>;
}

type Props = NativeStackScreenProps<ProfileStackParamList, 'Notifications'>;

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function NotificationsScreen({ navigation }: Props) {
  const [items, setItems] = useState<StoredNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { markAllRead } = useUnreadNotifications();

  const loadNotifications = useCallback(async () => {
    const stored = await storage.get<StoredNotification[]>(STORAGE_KEYS.NOTIFICATIONS);
    setItems(stored ?? []);
  }, []);

  useEffect(() => {
    loadNotifications();
    // Mark all notifications as read when this screen mounts
    markAllRead();
  }, [loadNotifications, markAllRead]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    Alert.alert(
      'Clear all notifications',
      'This will permanently remove all notification history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await storage.remove(STORAGE_KEYS.NOTIFICATIONS);
            setItems([]);
          },
        },
      ]
    );
  };

  const handleDismiss = (id: string) => {
    Alert.alert('Remove notification', 'Remove this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updated = items.filter((n) => n.id !== id);
          setItems(updated);
          await storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
        },
      },
    ]);
  };

  const getIcon = (notif: StoredNotification) => {
    const type = notif.data?.type ?? '';
    if (type.includes('quiz'))    return '📝';
    if (type.includes('streak'))  return '🔥';
    if (type.includes('rank'))    return '🏆';
    if (type.includes('affairs')) return '📰';
    return '🔔';
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Text className="text-primary-600 font-medium text-base">← Back</Text>
          </TouchableOpacity>
          <Text className="text-text-primary text-base font-bold">Notifications</Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text className="text-danger text-sm font-medium">Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🔔"
            title="No notifications yet"
            subtitle="Your quiz reminders and updates will appear here"
          />
        }
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => handleDismiss(item.id)}
            activeOpacity={0.7}
            className="mx-4 mt-3 bg-surface-card border border-border rounded-2xl p-4"
          >
            <View className="flex-row items-start">
              {/* Icon */}
              <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center mr-3 mt-0.5">
                <Text style={{ fontSize: 18 }}>{getIcon(item)}</Text>
              </View>

              {/* Content */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-text-primary text-sm font-semibold flex-1 mr-2" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className="text-text-muted text-xs">
                    {timeAgo(item.receivedAt)}
                  </Text>
                </View>
                {item.body ? (
                  <Text className="text-text-secondary text-sm mt-1 leading-5" numberOfLines={2}>
                    {item.body}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Long-press hint */}
            <Text className="text-text-muted text-xs mt-2">Long press to dismiss</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
