/**
 * ForgotPasswordScreen — enter email to receive reset OTP.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { authService } from '../../api';
import { Button, Input } from '../../components';
import type { AuthScreenProps } from '../../types/navigation.types';

export function ForgotPasswordScreen({ navigation }: AuthScreenProps<'ForgotPassword'>) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError('Invalid email address'); return; }
    setError('');
    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      // Always show success to prevent email enumeration
      Toast.show({
        type: 'success',
        text1: 'OTP sent',
        text2: 'If the email exists, you\'ll receive a code.',
      });
      navigation.navigate('OTP', {
        userId: '',
        email: email.trim().toLowerCase(),
        purpose: 'password_reset',
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Something went wrong. Try again.' });
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

          <Text style={{ fontSize: 40 }}>🔑</Text>
          <Text className="text-text-primary text-3xl font-bold mt-4">Forgot password?</Text>
          <Text className="text-text-secondary text-base mt-2 leading-5">
            Enter your email and we'll send you a 6-digit code to reset it.
          </Text>

          <View className="mt-8">
            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSendOTP}
              value={email}
              onChangeText={setEmail}
              error={error}
            />

            <Button
              label="Send Reset Code"
              onPress={handleSendOTP}
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
