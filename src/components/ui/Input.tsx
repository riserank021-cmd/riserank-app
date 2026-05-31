/**
 * Input — text field with label, error display, and optional icons.
 * Supports ref forwarding so callers can programmatically focus the inner TextInput.
 */

import React, { forwardRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** If true, renders a show/hide eye toggle (overrides rightIcon) */
  isPassword?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    isPassword = false,
    secureTextEntry,
    ...rest
  },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const secure = isPassword ? !showPassword : secureTextEntry;

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-text-secondary text-sm font-medium mb-1.5">{label}</Text>
      )}

      <View
        className={`flex-row items-center bg-surface-card border rounded-xl px-3 ${
          error ? 'border-danger' : 'border-border'
        }`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}

        <TextInput
          ref={ref}
          className="flex-1 py-3 text-text-primary text-base"
          placeholderTextColor="#94A3B8"
          secureTextEntry={secure}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} className="ml-2 p-1">
            <Text className="text-text-muted text-xs">{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        ) : (
          rightIcon && <View className="ml-2">{rightIcon}</View>
        )}
      </View>

      {error ? (
        <Text className="text-danger text-xs mt-1">{error}</Text>
      ) : hint ? (
        <Text className="text-text-muted text-xs mt-1">{hint}</Text>
      ) : null}
    </View>
  );
});
