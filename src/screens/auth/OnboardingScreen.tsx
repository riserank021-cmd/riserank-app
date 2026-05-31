/**
 * OnboardingScreen — 3-slide intro carousel shown only on first launch.
 *
 * After the user taps "Get Started" (or "Skip"), sets ONBOARDING_DONE in
 * AsyncStorage then navigates to Login. RootNavigator shows this screen
 * instead of Login when ONBOARDING_DONE is absent.
 *
 * Animation: slides transition with a horizontal Animated.Value translate.
 * The progress dots animate width/opacity to indicate current slide.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';
import type { AuthScreenProps } from '../../types/navigation.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────
// Slide data
// ─────────────────────────────────────────────

interface Slide {
  icon: string;
  title: string;
  subtitle: string;
  bg: string;         // background color
  textColor: string;  // primary text
  subColor: string;   // subtitle text
}

const SLIDES: Slide[] = [
  {
    icon: '📝',
    title: 'Daily Quizzes',
    subtitle:
      'Practice with SSC, Railway, Banking & Bihar SI quizzes. New questions every day to keep you sharp.',
    bg: '#EFF6FF',
    textColor: '#1E40AF',
    subColor: '#3B82F6',
  },
  {
    icon: '📰',
    title: 'Current Affairs',
    subtitle:
      'Stay updated with bilingual (English + Hindi) news digests curated for government exam aspirants.',
    bg: '#FFF7ED',
    textColor: '#C2410C',
    subColor: '#F97316',
  },
  {
    icon: '🏆',
    title: 'Rise the Ranks',
    subtitle:
      'Compete on daily, weekly, and all-time leaderboards. Track your streak and celebrate your progress.',
    bg: '#F0FDF4',
    textColor: '#15803D',
    subColor: '#16A34A',
  },
];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function OnboardingScreen({ navigation }: AuthScreenProps<'Onboarding'>) {
  const [current, setCurrent] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const goTo = (index: number) => {
    Animated.spring(translateX, {
      toValue: -index * SCREEN_WIDTH,
      useNativeDriver: true,
      tension: 80,
      friction: 14,
    }).start();
    setCurrent(index);
  };

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      goTo(current + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await storage.set(STORAGE_KEYS.ONBOARDING_DONE, true);
    navigation.replace('Login');
  };

  const slide = SLIDES[current];

  return (
    <View style={{ flex: 1, backgroundColor: slide.bg }}>
      <StatusBar backgroundColor={slide.bg} barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>

        {/* Skip */}
        <View style={{ alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8 }}>
          <TouchableOpacity onPress={handleFinish} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ color: '#94A3B8', fontWeight: '600', fontSize: 14 }}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Slide carousel */}
        <View style={{ flex: 1, overflow: 'hidden' }}>
          <Animated.View
            style={{
              flexDirection: 'row',
              width: SCREEN_WIDTH * SLIDES.length,
              transform: [{ translateX }],
            }}
          >
            {SLIDES.map((s, i) => (
              <View
                key={i}
                style={{
                  width: SCREEN_WIDTH,
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 40,
                }}
              >
                {/* Icon */}
                <Text style={{ fontSize: 96, marginBottom: 32 }}>{s.icon}</Text>

                {/* Title */}
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: '800',
                    color: s.textColor,
                    textAlign: 'center',
                    marginBottom: 16,
                    lineHeight: 36,
                  }}
                >
                  {s.title}
                </Text>

                {/* Subtitle */}
                <Text
                  style={{
                    fontSize: 15,
                    color: s.subColor,
                    textAlign: 'center',
                    lineHeight: 24,
                    maxWidth: 300,
                  }}
                >
                  {s.subtitle}
                </Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Dot indicators */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <View
                style={{
                  height: 8,
                  width: i === current ? 28 : 8,
                  borderRadius: 4,
                  backgroundColor: i === current ? slide.textColor : '#CBD5E1',
                  // Smooth width transition would need Animated.View with width interpolation
                  // Keeping it simple with instant update for dots
                }}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA button */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            style={{
              backgroundColor: slide.textColor,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
              {current < SLIDES.length - 1 ? 'Next →' : 'Get Started'}
            </Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}
