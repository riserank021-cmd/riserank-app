/**
 * SettingsScreen — app preferences: language, notifications toggle, account deletion info.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { apiClient } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useDarkMode } from '../../hooks/useDarkMode';
import type { Theme } from '../../store/appStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

const THEME_OPTIONS: { value: Theme; label: string; desc: string }[] = [
  { value: 'light',  label: '☀️  Light',  desc: 'Always light' },
  { value: 'dark',   label: '🌙  Dark',   desc: 'Always dark' },
  { value: 'system', label: '⚙️  System', desc: 'Follow device setting' },
];

export function SettingsScreen({ navigation }: Props) {
  const { user, setUser } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useDarkMode();
  const [notifEnabled, setNotifEnabled] = useState(user?.notificationsEnabled ?? true);
  const [toggling, setToggling] = useState(false);

  const handleToggleNotifications = async (value: boolean) => {
    setToggling(true);
    try {
      await apiClient.patch('/notifications/toggle', { enabled: value });
      setNotifEnabled(value);
      if (user) setUser({ ...user, notificationsEnabled: value });
      Toast.show({
        type: 'success',
        text1: value ? 'Notifications enabled' : 'Notifications disabled',
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update notifications' });
    } finally {
      setToggling(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This action is permanent. All your data will be removed. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Not yet available',
              'Account deletion is available through support. Contact support@riserank.in'
            ),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-3 border-b border-border">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-primary-600 font-medium text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-text-primary text-base font-bold">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <View className="mx-4 mt-5">
          <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            Appearance
          </Text>
          <View className="bg-surface-card border border-border rounded-2xl overflow-hidden">
            {THEME_OPTIONS.map(({ value, label, desc }, i) => (
              <TouchableOpacity
                key={value}
                onPress={() => setTheme(value)}
                className={`flex-row items-center justify-between px-4 py-4 ${
                  i < THEME_OPTIONS.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <View>
                  <Text className="text-text-primary text-base">{label}</Text>
                  <Text className="text-text-muted text-xs mt-0.5">{desc}</Text>
                </View>
                {theme === value && (
                  <View className="w-5 h-5 rounded-full bg-primary-600 items-center justify-center">
                    <Text className="text-white text-xs">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Language */}
        <View className="mx-4 mt-5">
          <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            Language
          </Text>
          <View className="bg-surface-card border border-border rounded-2xl overflow-hidden">
            {([['en', 'English'], ['hi', 'हिंदी (Hindi)']] as const).map(([code, label], i) => (
              <TouchableOpacity
                key={code}
                onPress={() => setLanguage(code)}
                className={`flex-row items-center justify-between px-4 py-4 ${
                  i === 0 ? 'border-b border-border' : ''
                }`}
              >
                <Text className="text-text-primary text-base">{label}</Text>
                {language === code && (
                  <View className="w-5 h-5 rounded-full bg-primary-600 items-center justify-center">
                    <Text className="text-white text-xs">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <View className="mx-4 mt-5">
          <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            Notifications
          </Text>
          <View className="bg-surface-card border border-border rounded-2xl px-4 py-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-text-primary text-base font-medium">Push notifications</Text>
                <Text className="text-text-muted text-sm mt-0.5">
                  Daily quiz reminders and streak alerts
                </Text>
              </View>
              <Switch
                value={notifEnabled}
                onValueChange={handleToggleNotifications}
                disabled={toggling}
                trackColor={{ true: '#2563EB', false: '#E2E8F0' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* About */}
        <View className="mx-4 mt-5">
          <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            About
          </Text>
          <View className="bg-surface-card border border-border rounded-2xl overflow-hidden">
            {/* Static version row */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
              <Text className="text-text-primary text-base">App version</Text>
              <Text className="text-text-muted text-sm">1.0.0</Text>
            </View>

            {/* Tappable legal rows */}
            {([
              { label: 'Privacy Policy', url: 'https://riserank.in/privacy' },
              { label: 'Terms of Service', url: 'https://riserank.in/terms' },
            ] as const).map(({ label, url }, i, arr) => (
              <TouchableOpacity
                key={label}
                onPress={() => Linking.openURL(url)}
                accessibilityLabel={label}
                accessibilityRole="link"
                className={`flex-row items-center justify-between px-4 py-4 ${
                  i < arr.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <Text className="text-text-primary text-base">{label}</Text>
                <Text className="text-text-muted text-sm">›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Danger zone */}
        <View className="mx-4 mt-5 mb-8">
          <Text className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2 px-1">
            Danger Zone
          </Text>
          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="bg-danger-light border border-danger rounded-2xl px-4 py-4"
          >
            <Text className="text-danger text-base font-semibold">Delete account</Text>
            <Text className="text-danger/70 text-sm mt-0.5">
              Permanently remove all your data
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
