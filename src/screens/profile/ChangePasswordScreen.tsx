/**
 * ChangePasswordScreen — current password + new password + confirm.
 * Calls PUT /auth/change-password.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { apiClient } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input } from '../../components';
import {
  validatePassword,
  validateConfirmPassword,
  collectErrors,
} from '../../utils/validators';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ChangePassword'>;

export function ChangePasswordScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = async () => {
    const errs = collectErrors<'currentPassword' | 'newPassword' | 'confirmPassword'>([
      ['currentPassword', validatePassword(currentPassword)],
      ['newPassword', validatePassword(newPassword)],
      ['confirmPassword', validateConfirmPassword(newPassword, confirmPassword)],
    ]);
    if (Object.keys(errs).length > 0) { setErrors(errs as Record<string, string>); return; }
    setErrors({});
    setIsSaving(true);

    try {
      await apiClient.put('/auth/change-password', { currentPassword, newPassword });
      Toast.show({
        type: 'success',
        text1: 'Password changed',
        text2: 'Please sign in again with your new password.',
      });
      // Force re-login for security
      await logout();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to change password.';
      Toast.show({ type: 'error', text1: 'Error', text2: msg });
      if (err?.response?.status === 401) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 pt-4 pb-3 border-b border-border">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Text className="text-primary-600 font-medium text-base">← Back</Text>
          </TouchableOpacity>
          <Text className="text-text-primary text-base font-bold">Change Password</Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Info banner */}
          <View className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 mb-5">
            <Text className="text-primary-700 text-sm leading-5">
              After changing your password you'll be signed out and will need to sign in again.
            </Text>
          </View>

          <Input
            label="Current Password"
            placeholder="••••••••"
            isPassword
            value={currentPassword}
            onChangeText={setCurrentPassword}
            error={errors.currentPassword}
          />
          <Input
            label="New Password"
            placeholder="Min. 8 characters"
            isPassword
            value={newPassword}
            onChangeText={setNewPassword}
            error={errors.newPassword}
          />
          <Input
            label="Confirm New Password"
            placeholder="Repeat new password"
            isPassword
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
          />

          <Button
            label="Change Password"
            onPress={handleChange}
            loading={isSaving}
            fullWidth
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
