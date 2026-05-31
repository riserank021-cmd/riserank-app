/**
 * Button — primary reusable button with variants and loading state.
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary-600 active:bg-primary-700',
    text: 'text-white font-semibold',
  },
  secondary: {
    container: 'bg-secondary-500 active:bg-secondary-600',
    text: 'text-white font-semibold',
  },
  outline: {
    container: 'border-2 border-primary-600 bg-transparent active:bg-primary-50',
    text: 'text-primary-600 font-semibold',
  },
  ghost: {
    container: 'bg-transparent active:bg-surface-muted',
    text: 'text-primary-600 font-semibold',
  },
  danger: {
    container: 'bg-danger active:bg-red-700',
    text: 'text-white font-semibold',
  },
};

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: 'px-4 py-2 rounded-lg', text: 'text-sm' },
  md: { container: 'px-6 py-3 rounded-xl', text: 'text-base' },
  lg: { container: 'px-8 py-4 rounded-2xl', text: 'text-lg' },
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const { container, text } = variantStyles[variant];
  const { container: sizeContainer, text: sizeText } = sizeStyles[size];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`flex-row items-center justify-center ${container} ${sizeContainer} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? '#2563EB' : '#fff'} />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={`${text} ${sizeText}`}>{label}</Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}
