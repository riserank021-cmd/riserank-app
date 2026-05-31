/**
 * OTPInput — 6-box OTP entry with auto-advance focus.
 */

import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
}

export function OTPInput({ length = 6, onComplete }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);

    if (digit && index < length - 1) {
      refs.current[index + 1]?.focus();
    }

    const joined = newValues.join('');
    if (joined.length === length && !newValues.includes('')) {
      onComplete(joined);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !values[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row justify-between">
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(r) => { refs.current[i] = r; }}
          value={values[i]}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
          maxLength={1}
          keyboardType="number-pad"
          className={`w-12 h-14 border-2 rounded-xl text-center text-xl font-bold text-text-primary ${
            values[i] ? 'border-primary-600 bg-primary-50' : 'border-border bg-surface-card'
          }`}
          style={styles.box}
          returnKeyType="done"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    textAlignVertical: 'center',
  },
});
