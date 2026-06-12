/**
 * ProfileScreen — user stats, settings shortcuts, logout.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, Image,
  RefreshControl, Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuthStore } from '../../store/authStore';
import type { ProfileStackParamList } from '../../types/navigation.types';
import { CategoryAccuracyCard, LoadingSpinner, ProgressBar } from '../../components';
import { formatDate, computeAccuracy, formatStudyTime } from '../../utils/format';
import { deregisterFCMToken } from '../../services/notification.service';
import { userService } from '../../api';
import { authService } from '../../api/auth.service';
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

  // ── Email verification modal state ─────────────────────────────────────────
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  const handleSendVerificationOTP = async () => {
    setOtpSending(true);
    try {
      await authService.sendVerificationOTP();
      setOtpValue('');
      setVerifyModalVisible(true);
      Toast.show({ type: 'success', text1: 'OTP sent', text2: 'Check your email for a 6-digit code' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Failed to send OTP', text2: err?.response?.data?.message ?? 'Try again' });
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpValue.length !== 6) {
      Toast.show({ type: 'error', text1: 'Enter the 6-digit code from your email' });
      return;
    }
    setOtpVerifying(true);
    try {
      await authService.verifyOTP(otpValue.trim());
      await hydrate(); // refresh user state — isEmailVerified will now be true
      setVerifyModalVisible(false);
      Toast.show({ type: 'success', text1: '✅ Email verified!', text2: 'Your account is now verified' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Verification failed', text2: err?.response?.data?.message ?? 'Invalid or expired code' });
    } finally {
      setOtpVerifying(false);
    }
  };

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

  // Refresh user data every time this screen comes into focus
  // so study time, quiz count, streak etc. are always up to date.
  useFocusEffect(useCallback(() => { hydrate(); }, [hydrate]));

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
            <TouchableOpacity
              onPress={handleSendVerificationOTP}
              disabled={otpSending}
              className="bg-warning-light rounded-full px-3 py-1.5 mt-2 flex-row items-center gap-2"
            >
              {otpSending
                ? <ActivityIndicator size="small" color="#D97706" />
                : <Text className="text-warning text-xs font-semibold">⚠️ Email not verified — Tap to verify</Text>
              }
            </TouchableOpacity>
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

      {/* ── Email verification OTP modal ──────────────────────────────────────── */}
      <Modal
        visible={verifyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVerifyModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-surface rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-text-primary text-lg font-bold text-center mb-1">Verify Email</Text>
            <Text className="text-text-muted text-sm text-center mb-5">
              Enter the 6-digit code sent to{'\n'}
              <Text className="font-semibold text-text-primary">{user.email}</Text>
            </Text>

            <TextInput
              value={otpValue}
              onChangeText={setOtpValue}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
              placeholderTextColor="#94A3B8"
              className="bg-surface-muted border border-border rounded-xl text-center text-2xl font-bold text-text-primary py-3 mb-4 tracking-widest"
            />

            <TouchableOpacity
              onPress={handleVerifyOTP}
              disabled={otpVerifying || otpValue.length !== 6}
              className="bg-primary-600 rounded-xl py-3 items-center mb-3"
              style={{ opacity: otpVerifying || otpValue.length !== 6 ? 0.6 : 1 }}
            >
              {otpVerifying
                ? <ActivityIndicator color="white" />
                : <Text className="text-white font-bold text-base">Verify</Text>
              }
            </TouchableOpacity>

            <View className="flex-row items-center justify-center gap-2">
              <TouchableOpacity onPress={handleSendVerificationOTP} disabled={otpSending}>
                <Text className="text-primary-600 text-sm font-medium">
                  {otpSending ? 'Sending…' : 'Resend code'}
                </Text>
              </TouchableOpacity>
              <Text className="text-text-muted text-sm">·</Text>
              <TouchableOpacity onPress={() => setVerifyModalVisible(false)}>
                <Text className="text-text-muted text-sm">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
