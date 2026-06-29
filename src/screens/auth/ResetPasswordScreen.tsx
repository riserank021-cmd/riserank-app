/**
 * ResetPasswordScreen — new password + confirm after OTP verification.
 */

import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { authService } from '../../api';
import { Button, Input } from '../../components';
import type { AuthScreenProps } from '../../types/navigation.types';

export function ResetPasswordScreen({ route, navigation }: AuthScreenProps<'ResetPassword'>) {
  const { email, otp: prefillOtp } = route.params;
  // OTP is pre-filled when arriving from OTPScreen (password_reset flow)
  const [otp, setOtp] = useState(prefillOtp ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ otp?: string; newPassword?: string; confirmPassword?: string }>({});
  const passwordRef = useRef<TextInput>(null);
  const confirmRef  = useRef<TextInput>(null);

  const validate = () => {
    const errs: typeof errors = {};
    if (!otp || otp.length !== 6) errs.otp = 'Enter the 6-digit OTP';
    if (!newPassword || newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleReset = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      Toast.show({ type: 'success', text1: 'Password reset!', text2: 'Please sign in again.' });
      navigation.navigate('Login');
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Reset failed',
        text2: err?.response?.data?.message ?? 'Invalid OTP or expired code.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
            <Text className="text-primary-600 font-medium text-base">← Back</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 40 }}>🔒</Text>
          <Text className="text-text-primary text-3xl font-bold mt-4">Reset password</Text>
          <Text className="text-text-secondary text-base mt-2">
            Enter the OTP sent to {email} and choose a new password.
          </Text>

          <View className="mt-8">
            {/* Only show OTP field if not already provided by OTPScreen */}
            {!prefillOtp && (
              <Input
                label="OTP Code"
                placeholder="123456"
                keyboardType="number-pad"
                maxLength={6}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                value={otp}
                onChangeText={setOtp}
                error={errors.otp}
              />
            )}
            <Input
              ref={passwordRef}
              label="New Password"
              placeholder="Min. 8 characters"
              isPassword
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              value={newPassword}
              onChangeText={setNewPassword}
              error={errors.newPassword}
            />
            <Input
              ref={confirmRef}
              label="Confirm Password"
              placeholder="Repeat your password"
              isPassword
              returnKeyType="done"
              onSubmitEditing={handleReset}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
            />

            <Button
              label="Reset Password"
              onPress={handleReset}
              loading={isLoading}
              fullWidth
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
