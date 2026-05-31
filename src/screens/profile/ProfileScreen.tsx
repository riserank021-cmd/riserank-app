/**
 * ProfileScreen — user stats, settings shortcuts, logout.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuthStore } from '../../store/authStore';
import type { ProfileStackParamList } from '../../types/navigation.types';
import { CategoryAccuracyCard, LoadingSpinner, ProgressBar } from '../../components';
import { formatDate, computeAccuracy, formatStudyTime } from '../../utils/format';
import { deregisterFCMToken } from '../../services/notification.service';
import { userService } from '../../api';
import type { CategoryStat } from '../../types/api.types';

interface MenuRow {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

export function ProfileScreen() {
  const navigation = useNavigation<ProfileNav>();
  const { user, logout } = useAuth();
  const hydrate = useAuthStore((s) => s.hydrate);
  const { language } = useLanguage();
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadCategoryStats = useCallback(async () => {
    try {
      const res = await userService.getCategoryStats();
      setCategoryStats(res.data.data?.stats ?? []);
    } catch {
      // Non-critical — screen still works without it
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadCategoryStats(); }, [loadCategoryStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([hydrate(), loadCategoryStats()]);
    setRefreshing(false);
  }, [hydrate, loadCategoryStats]);

  const confirmLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          // Deregister FCM token first (while still authenticated)
          await deregisterFCMToken();
          await logout();
        },
      },
    ]);
  };

  if (!user) return null;

  const accuracy = computeAccuracy(user.totalCorrect, user.totalQuizAttempts, user.totalAnswered) ?? 0;

  const menuRows: MenuRow[] = [
    {
      icon: '✏️',
      label: 'Edit Profile',
      onPress: () => navigation.navigate('EditProfile'),
    },
    // Only show Change Password for local (email/password) accounts
    ...(user?.authProvider !== 'google' ? [{
      icon: '🔒',
      label: 'Change Password',
      onPress: () => navigation.navigate('ChangePassword'),
    }] : []),
    {
      icon: '📌',
      label: 'Bookmarks',
      onPress: () => navigation.navigate('Bookmarks'),
    },
    {
      icon: '📋',
      label: 'Quiz History',
      onPress: () => navigation.navigate('QuizHistory'),
    },
    {
      icon: '🔔',
      label: 'Notifications',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      icon: '⚙️',
      label: 'Settings',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: '🚪',
      label: 'Sign Out',
      onPress: confirmLogout,
      danger: true,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        {/* Header */}
        <View className="bg-primary-600 pt-8 pb-6 px-4 items-center">
          {/* Avatar */}
          <View className="w-20 h-20 rounded-full bg-primary-200 items-center justify-center overflow-hidden">
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} className="w-20 h-20" />
            ) : (
              <Text className="text-primary-800 text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text className="text-white text-xl font-bold mt-3">{user.name}</Text>
          <Text className="text-primary-200 text-sm mt-0.5">{user.email}</Text>
          {!user.isEmailVerified && (
            <View className="bg-warning-light rounded-full px-3 py-1 mt-2">
              <Text className="text-warning text-xs font-semibold">Email not verified</Text>
            </View>
          )}
          <Text className="text-primary-300 text-xs mt-2">
            Joined {formatDate(user.createdAt)}
          </Text>
        </View>

        {/* Stats */}
        <View className="mx-4 mt-5">
          <Text className="text-text-primary text-lg font-bold mb-3">Your Stats</Text>
          {/* 2×2 stat grid */}
          {[
            [
              { icon: '🔥', label: 'Streak', value: `${user.currentStreak}d` },
              { icon: '🏆', label: 'Best Streak', value: `${user.longestStreak}d` },
            ],
            [
              { icon: '📝', label: 'Quizzes', value: String(user.totalQuizAttempts) },
              { icon: '⏱', label: 'Study Time', value: formatStudyTime(user.totalTimeSpentSeconds ?? 0) },
            ],
          ].map((row, ri) => (
            <View key={ri} className="flex-row gap-3 mb-3">
              {row.map(({ icon, label, value }) => (
                <View key={label} className="flex-1 bg-surface-card border border-border rounded-2xl p-3 items-center">
                  <Text style={{ fontSize: 24 }}>{icon}</Text>
                  <Text className="text-text-primary font-bold text-lg mt-1">{value}</Text>
                  <Text className="text-text-muted text-xs text-center">{label}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* Overall accuracy */}
          <View className="bg-surface-card border border-border rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-text-secondary text-sm font-medium">Overall Accuracy</Text>
              <Text className="text-text-primary font-bold">{accuracy}%</Text>
            </View>
            <ProgressBar
              value={accuracy}
              height={8}
              color={accuracy >= 70 ? '#16A34A' : accuracy >= 50 ? '#D97706' : '#DC2626'}
            />
            <Text className="text-text-muted text-xs mt-2">
              {user.totalCorrect} correct · {user.totalAnswered > 0 ? user.totalAnswered : user.totalQuizAttempts * 10} answered · {user.totalQuizAttempts} quiz{user.totalQuizAttempts !== 1 ? 'zes' : ''} done
            </Text>
          </View>

          {/* Category breakdown */}
          <View className="mt-3">
            <Text className="text-text-primary text-base font-bold mb-2">Category Breakdown</Text>
            {statsLoading ? (
              <LoadingSpinner />
            ) : (
              <CategoryAccuracyCard stats={categoryStats} language={language} />
            )}
          </View>
        </View>

        {/* Menu */}
        <View className="mx-4 mt-5 bg-surface-card border border-border rounded-2xl overflow-hidden">
          {menuRows.map((row, i) => (
            <TouchableOpacity
              key={row.label}
              onPress={row.onPress}
              accessibilityRole="button"
              accessibilityLabel={row.label}
              accessibilityState={{ disabled: !!(loggingOut && row.danger) }}
              className={`flex-row items-center px-4 py-4 ${
                i < menuRows.length - 1 ? 'border-b border-border' : ''
              }`}
              disabled={loggingOut && row.danger}
            >
              <Text style={{ fontSize: 20 }}>{row.icon}</Text>
              <Text
                className={`flex-1 ml-3 text-base font-medium ${
                  row.danger ? 'text-danger' : 'text-text-primary'
                }`}
              >
                {loggingOut && row.danger ? 'Signing out...' : row.label}
              </Text>
              {!row.danger && <Text className="text-text-muted">›</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
