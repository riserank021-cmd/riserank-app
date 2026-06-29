/**
 * OTPScreen — 6-digit OTP entry for email verification or password reset.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { authService } from '../../api';
import { OTPInput, Button } from '../../components';
import type { AuthScreenProps } from '../../types/navigation.types';

const RESEND_COOLDOWN = 60;

export function OTPScreen({ route, navigation }: AuthScreenProps<'OTP'>) {
  const { userId, email, purpose } = route.params;
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(RESEND_COOLDOWN);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const interval = setInterval(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearInterval(interval);
  }, [resendCountdown]);

  const handleComplete = async (otp: string) => {
    if (purpose === 'password_reset') {
      // For password reset, don't call verify-email — just carry the OTP to ResetPassword
      // where backend verifies it together with the new password.
      navigation.navigate('ResetPassword', { email, otp });
      return;
    }

    // Email verification flow
    setIsVerifying(true);
    try {
      await authService.verifyOTP(otp);
      Toast.show({ type: 'success', text1: 'Email verified!', text2: "You're all set." });
      // RootNavigator will redirect to App since auth state is already set
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: err?.response?.data?.message ?? 'Please check the code and try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    try {
      if (purpose === 'email_verification') {
        await authService.sendVerificationOTP();
      } else {
        await authService.forgotPassword(email);
      }
      setResendCountdown(RESEND_COOLDOWN);
      Toast.show({ type: 'info', text1: 'OTP resent', text2: `Check ${email}` });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to resend OTP' });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 px-6 pt-8">
        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
          <Text className="text-primary-600 font-medium text-base">← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <Text style={{ fontSize: 40 }}>📬</Text>
        <Text className="text-text-primary text-3xl font-bold mt-4">Verify your email</Text>
        <Text className="text-text-secondary text-base mt-2 leading-5">
          We sent a 6-digit code to{'\n'}
          <Text className="text-text-primary font-semibold">{email}</Text>
        </Text>

        {/* OTP boxes */}
        <View className="mt-10">
          <OTPInput length={6} onComplete={handleComplete} />
        </View>

        {isVerifying && (
          <View className="mt-6">
            <Button label="Verifying..." loading fullWidth />
          </View>
        )}

        {/* Resend */}
        <View className="flex-row items-center justify-center mt-8">
          <Text className="text-text-secondary text-base">Didn't get it? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resendCountdown > 0}>
            <Text
              className={`font-semibold text-base ${
                resendCountdown > 0 ? 'text-text-muted' : 'text-primary-600'
              }`}
            >
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
