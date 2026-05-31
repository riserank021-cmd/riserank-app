/**
 * LoginScreen — email + password with Google Sign-In option.
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
import {
  signInWithGoogle,
  getGoogleErrorMessage,
} from '../../services/googleAuth.service';
import type { AuthScreenProps } from '../../types/navigation.types';

function validate(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};
  if (!email.trim()) errors.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Invalid email address';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  return errors;
}

export function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const { login, isLoading } = useAuth();
  const googleSignIn = useAuthStore((s) => s.googleSignIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [googleLoading, setGoogleLoading] = useState(false);

  // ── Email / password ───────────────────────────────────────────────────────
  const handleLogin = async () => {
    const errs = validate(email.trim(), password);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: err?.response?.data?.message ?? 'Please check your credentials.',
      });
    }
  };

  // ── Google ─────────────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { idToken } = await signInWithGoogle();
      await googleSignIn(idToken);
      // Navigator reacts automatically via isAuthenticated
    } catch (err: unknown) {
      const message = getGoogleErrorMessage(err);
      if (message) {
        Toast.show({ type: 'error', text1: 'Google Sign-In', text2: message });
      }
      // null = user cancelled — no toast needed
    } finally {
      setGoogleLoading(false);
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
          <View className="px-6 pt-12 pb-8">
            <Text style={{ fontSize: 40 }}>👋</Text>
            <Text className="text-text-primary text-3xl font-bold mt-3">Welcome back</Text>
            <Text className="text-text-secondary text-base mt-1">Sign in to continue</Text>
          </View>

          {/* Form */}
          <View className="px-6 flex-1">
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
              placeholder="••••••••"
              isPassword
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            {/* Forgot password */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              className="self-end -mt-2 mb-6"
              accessibilityLabel="Forgot password"
            >
              <Text className="text-primary-600 text-sm font-medium">Forgot password?</Text>
            </TouchableOpacity>

            <Button
              label="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
            />

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-border" />
              <Text className="text-text-muted text-sm px-4">or continue with</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Google Sign-In button */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={googleLoading || isLoading}
              accessibilityLabel="Sign in with Google"
              accessibilityRole="button"
              className="flex-row items-center justify-center border border-border rounded-xl py-3.5 px-5 bg-surface"
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
                {googleLoading ? 'Signing in…' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            {/* Register link */}
            <View className="flex-row items-center justify-center mt-8 mb-4">
              <Text className="text-text-secondary text-base">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-primary-600 font-semibold text-base">Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
