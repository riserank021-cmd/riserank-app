/**
 * RegisterScreen — name, email, password, optional phone.
 * On success navigates to OTP screen for email verification.
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
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Button, Input } from '../../components';
import { signInWithGoogle, getGoogleErrorMessage } from '../../services/googleAuth.service';
import type { AuthScreenProps } from '../../types/navigation.types';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
}

function validate(name: string, email: string, password: string, phone: string): FormErrors {
  const errors: FormErrors = {};
  if (!name.trim() || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!email.trim()) errors.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Invalid email address';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (phone && !/^[6-9]\d{9}$/.test(phone)) errors.phone = 'Invalid Indian phone number';
  return errors;
}

export function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const { register, isLoading } = useAuth();
  const googleSignIn = useAuthStore((s) => s.googleSignIn);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { idToken } = await signInWithGoogle();
      await googleSignIn(idToken);
      // Navigator reacts automatically via isAuthenticated — no OTP needed for Google
    } catch (err: unknown) {
      const message = getGoogleErrorMessage(err);
      if (message) {
        Toast.show({ type: 'error', text1: 'Google Sign-In', text2: message });
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegister = async () => {
    const errs = validate(name, email, password, phone);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    try {
      await register({ name: name.trim(), email: email.trim().toLowerCase(), password, phone: phone || undefined });
      // After registration isAuthenticated=true and RootNavigator switches to AppNavigator,
      // making the OTP screen (auth stack) unreachable. Show a toast instead — the user
      // can verify their email from the Profile screen's "Verify Email" banner.
      Toast.show({
        type: 'success',
        text1: 'Account created! 🎉',
        text2: 'Check your email to verify your account.',
        visibilityTime: 4000,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration failed',
        text2: err?.response?.data?.message ?? 'Please try again.',
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-6 pt-8 pb-6">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
              <Text className="text-primary-600 font-medium text-base">← Back</Text>
            </TouchableOpacity>
            <Text className="text-text-primary text-3xl font-bold">Create account</Text>
            <Text className="text-text-secondary text-base mt-1">
              Start your exam preparation journey
            </Text>
          </View>

          {/* Form */}
          <View className="px-6">
            <Input
              label="Full Name"
              placeholder="Rahul Kumar"
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoCapitalize="words"
            />
            <Input
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              placeholder="Min. 8 characters"
              isPassword
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />
            <Input
              label="Phone (optional)"
              placeholder="9876543210"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
              hint="10-digit Indian mobile number"
            />

            <Button
              label="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              size="lg"
            />

            {/* Divider */}
            <View className="flex-row items-center my-5">
              <View className="flex-1 h-px bg-border" />
              <Text className="text-text-muted text-sm px-4">or sign up with</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Google Sign-Up button */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={googleLoading || isLoading}
              accessibilityLabel="Sign up with Google"
              accessibilityRole="button"
              className="flex-row items-center justify-center border border-border rounded-xl py-3.5 px-5 bg-surface mb-2"
              style={{ opacity: googleLoading || isLoading ? 0.6 : 1 }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: '#dadce0',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#4285F4' }}>G</Text>
              </View>
              <Text className="text-text-primary text-base font-semibold">
                {googleLoading ? 'Connecting…' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center justify-center mt-4 mb-8">
              <Text className="text-text-secondary text-base">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-primary-600 font-semibold text-base">Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
