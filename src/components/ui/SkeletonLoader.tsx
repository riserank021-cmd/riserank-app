/**
 * SkeletonLoader — animated shimmer placeholder for loading states.
 *
 * Usage:
 *   <SkeletonLoader width="100%" height={20} borderRadius={8} />
 *   <QuizCardSkeleton />
 *   <CurrentAffairCardSkeleton />
 *   <DailyQuizSkeleton />
 *   <BookmarkCardSkeleton />
 *   <QuizHistoryCardSkeleton />
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, useColorScheme } from 'react-native';

// ── Core shimmer block ────────────────────────────────────────────────────────

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const isDark = useColorScheme() === 'dark';
  const baseColor = isDark ? '#334155' : '#CBD5E1';
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: baseColor },
        { opacity },
        style,
      ]}
    />
  );
}

// ── Quiz card skeleton (mirrors QuizCard layout) ──────────────────────────────

export function QuizCardSkeleton() {
  return (
    <View style={styles.cardContainer}>
      {/* Left content */}
      <View style={{ flex: 1, marginRight: 12 }}>
        {/* Category badge */}
        <SkeletonLoader width={80} height={18} borderRadius={12} />
        {/* Title line 1 */}
        <SkeletonLoader width="90%" height={16} borderRadius={6} style={{ marginTop: 8 }} />
        {/* Title line 2 */}
        <SkeletonLoader width="65%" height={16} borderRadius={6} style={{ marginTop: 6 }} />
        {/* Meta row */}
        <View style={styles.row}>
          <SkeletonLoader width={60} height={14} borderRadius={4} />
          <SkeletonLoader width={50} height={14} borderRadius={4} style={{ marginLeft: 12 }} />
        </View>
      </View>
      {/* Right chevron / icon placeholder */}
      <SkeletonLoader width={28} height={28} borderRadius={14} />
    </View>
  );
}

// ── Current affair card skeleton ──────────────────────────────────────────────

export function CurrentAffairCardSkeleton() {
  return (
    <View style={[styles.cardContainer, { marginHorizontal: 16, marginBottom: 12 }]}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <SkeletonLoader width={60} height={16} borderRadius={10} />
        <SkeletonLoader width="95%" height={15} borderRadius={5} style={{ marginTop: 8 }} />
        <SkeletonLoader width="75%" height={15} borderRadius={5} style={{ marginTop: 5 }} />
        <SkeletonLoader width={80} height={13} borderRadius={4} style={{ marginTop: 8 }} />
      </View>
      <SkeletonLoader width={64} height={64} borderRadius={12} />
    </View>
  );
}

// ── Daily quiz CTA skeleton ───────────────────────────────────────────────────

export function DailyQuizSkeleton() {
  return (
    <View style={styles.dailyContainer}>
      <View style={{ flex: 1, marginRight: 16 }}>
        <SkeletonLoader width={70} height={13} borderRadius={4} />
        <SkeletonLoader width="85%" height={17} borderRadius={5} style={{ marginTop: 8 }} />
        <SkeletonLoader width="65%" height={17} borderRadius={5} style={{ marginTop: 5 }} />
        <View style={[styles.row, { marginTop: 12 }]}>
          <SkeletonLoader width={55} height={13} borderRadius={4} />
          <SkeletonLoader width={50} height={13} borderRadius={4} style={{ marginLeft: 12 }} />
        </View>
      </View>
      <SkeletonLoader width={48} height={48} borderRadius={24} />
    </View>
  );
}

// ── Bookmark card skeleton (mirrors BookmarksScreen inline card) ──────────────

export function BookmarkCardSkeleton() {
  return (
    <View style={styles.cardContainer}>
      <View style={{ flex: 1 }}>
        {/* Question text lines */}
        <SkeletonLoader width="100%" height={15} borderRadius={5} />
        <SkeletonLoader width="85%" height={15} borderRadius={5} style={{ marginTop: 6 }} />
        <SkeletonLoader width="60%" height={15} borderRadius={5} style={{ marginTop: 6 }} />
        {/* Correct answer badge row */}
        <View style={styles.row}>
          <SkeletonLoader width={44} height={24} borderRadius={8} />
          <SkeletonLoader width={120} height={13} borderRadius={4} style={{ marginLeft: 8 }} />
        </View>
        {/* Difficulty + remove row */}
        <View style={[styles.row, { justifyContent: 'space-between', marginTop: 10 }]}>
          <SkeletonLoader width={52} height={20} borderRadius={10} />
          <SkeletonLoader width={52} height={13} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

// ── Quiz history card skeleton (mirrors QuizHistoryCard layout) ───────────────

export function QuizHistoryCardSkeleton() {
  return (
    <View style={styles.cardContainer}>
      <View style={{ flex: 1 }}>
        {/* Quiz title */}
        <SkeletonLoader width="80%" height={16} borderRadius={6} />
        <SkeletonLoader width="55%" height={14} borderRadius={5} style={{ marginTop: 6 }} />
        {/* Stats row */}
        <View style={[styles.row, { marginTop: 10, gap: 12 }]}>
          <SkeletonLoader width={55} height={32} borderRadius={8} />
          <SkeletonLoader width={55} height={32} borderRadius={8} />
          <SkeletonLoader width={55} height={32} borderRadius={8} />
        </View>
      </View>
      {/* Score circle */}
      <SkeletonLoader width={52} height={52} borderRadius={26} style={{ marginLeft: 12 }} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  dailyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
