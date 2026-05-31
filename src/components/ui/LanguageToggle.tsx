/**
 * LanguageToggle — EN / HI pill switcher.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLanguage } from '../../hooks/useLanguage';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <View
      className="flex-row bg-surface-muted rounded-full p-1"
      accessibilityRole="radiogroup"
      accessibilityLabel="Content language"
    >
      {(['en', 'hi'] as const).map((lang) => (
        <TouchableOpacity
          key={lang}
          onPress={() => setLanguage(lang)}
          accessibilityRole="radio"
          accessibilityLabel={lang === 'en' ? 'English' : 'Hindi'}
          accessibilityState={{ selected: language === lang }}
          className={`px-4 py-1.5 rounded-full ${language === lang ? 'bg-primary-600' : ''}`}
        >
          <Text
            className={`text-sm font-semibold ${
              language === lang ? 'text-white' : 'text-text-secondary'
            }`}
          >
            {lang === 'en' ? 'EN' : 'HI'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
