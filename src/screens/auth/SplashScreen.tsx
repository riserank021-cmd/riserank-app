/**
 * SplashScreen — animated launch screen.
 *
 * Animation sequence:
 *  0ms   → trophy icon fades in + scales from 0.3 → 1 (spring)
 *  300ms → logo text fades in
 *  500ms → tagline slides up from +20px
 *  700ms → progress bar fills over 800ms
 * 1600ms → navigation.replace('Login')
 *
 * No external Lottie dependency — uses React Native Animated only.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Dimensions } from 'react-native';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';
import type { AuthScreenProps } from '../../types/navigation.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function SplashScreen({ navigation }: AuthScreenProps<'Splash'>) {
  // ── Animated values ──────────────────────────────────────────
  const trophyOpacity  = useRef(new Animated.Value(0)).current;
  const trophyScale    = useRef(new Animated.Value(0.3)).current;
  const titleOpacity   = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY       = useRef(new Animated.Value(20)).current;
  const progressWidth  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Trophy entrance (spring)
    Animated.parallel([
      Animated.timing(trophyOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(trophyScale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Title fade-in
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 350,
      delay: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // 3. Tagline slide up + fade
    Animated.parallel([
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 350,
        delay: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(taglineY, {
        toValue: 0,
        duration: 350,
        delay: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // 4. Progress bar fills to full width
    Animated.timing(progressWidth, {
      toValue: SCREEN_WIDTH - 80, // 40px margin each side
      duration: 900,
      delay: 650,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, // width cannot use native driver
    }).start();

    // 5. Navigate after animation completes
    const timer = setTimeout(async () => {
      const onboardingDone = await storage.get<boolean>(STORAGE_KEYS.ONBOARDING_DONE);
      if (onboardingDone) {
        navigation.replace('Login');
      } else {
        navigation.replace('Onboarding');
      }
    }, 1700);

    return () => clearTimeout(timer);
  }, [navigation]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563EB', // primary-600
      }}
    >
      {/* ── Animated trophy icon ── */}
      <Animated.View
        style={{
          opacity: trophyOpacity,
          transform: [{ scale: trophyScale }],
          marginBottom: 4,
        }}
      >
        <Text style={{ fontSize: 80 }}>🏆</Text>
      </Animated.View>

      {/* ── App name ── */}
      <Animated.Text
        style={{
          opacity: titleOpacity,
          fontSize: 40,
          fontWeight: '800',
          color: '#FFFFFF',
          letterSpacing: 1.5,
          marginTop: 8,
        }}
      >
        RiseRank
      </Animated.Text>

      {/* ── Tagline ── */}
      <Animated.Text
        style={{
          opacity: taglineOpacity,
          transform: [{ translateY: taglineY }],
          fontSize: 15,
          color: '#BFDBFE', // primary-200
          marginTop: 8,
          letterSpacing: 0.3,
        }}
      >
        Crack your government exam
      </Animated.Text>

      {/* ── Progress bar ── */}
      <View
        style={{
          position: 'absolute',
          bottom: 80,
          left: 40,
          right: 40,
          height: 3,
          backgroundColor: 'rgba(255,255,255,0.25)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            width: progressWidth,
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
          }}
        />
      </View>

      {/* ── Footer tagline ── */}
      <View style={{ position: 'absolute', bottom: 40 }}>
        <Text
          style={{
            color: '#93C5FD', // primary-300
            fontSize: 12,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          Prepare · Practice · Succeed
        </Text>
      </View>
    </View>
  );
}
