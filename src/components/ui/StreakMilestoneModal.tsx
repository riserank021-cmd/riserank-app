/**
 * StreakMilestoneModal — full-screen celebration when the user hits a
 * streak milestone (7, 30, or 100 days).
 *
 * Animates: floating emoji particles + scale-in hero card.
 * Includes a Share button so users can brag on social media.
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Share,
} from 'react-native';
import type { StreakMilestone } from '../../utils/constants';

const { width: W, height: H } = Dimensions.get('window');

// ── Milestone metadata ────────────────────────────────────────────────────────

interface MilestoneInfo {
  emoji: string;
  badge: string;
  title: string;
  subtitle: string;
  color: string;
}

const MILESTONE_META: Record<StreakMilestone, MilestoneInfo> = {
  7: {
    emoji: '🔥',
    badge: '7-Day Streak',
    title: 'One Week Strong!',
    subtitle: 'You have studied 7 days in a row. Keep the fire burning!',
    color: '#F97316', // orange
  },
  30: {
    emoji: '⭐',
    badge: '30-Day Streak',
    title: 'A Month of Mastery!',
    subtitle: 'Thirty consecutive days of learning. You are unstoppable!',
    color: '#2563EB', // blue
  },
  100: {
    emoji: '🏆',
    badge: '100-Day Streak',
    title: 'Century Achieved!',
    subtitle: '100 days of relentless preparation. Exam-ready and unstoppable!',
    color: '#7C3AED', // purple
  },
};

// ── Floating particle ─────────────────────────────────────────────────────────

function Particle({ emoji, delay }: { emoji: string; delay: number }) {
  const y = useRef(new Animated.Value(H * 0.8)).current;
  const x = useRef(new Animated.Value(Math.random() * W)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5 + Math.random() * 1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(y, {
          toValue: -60,
          duration: 2000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.particle,
        { transform: [{ translateX: x }, { translateY: y }, { scale }], opacity },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

interface StreakMilestoneModalProps {
  visible: boolean;
  milestone: StreakMilestone;
  onDismiss: () => void;
}

const PARTICLES = ['⭐', '🌟', '✨', '💫', '🎉', '🎊'];

export function StreakMilestoneModal({
  visible,
  milestone,
  onDismiss,
}: StreakMilestoneModalProps) {
  const meta = MILESTONE_META[milestone];
  const cardScale = useRef(new Animated.Value(0.6)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 7 }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  const handleShare = async () => {
    const message =
      `🔥 I just hit a ${milestone}-day streak on RiseRank!\n` +
      `${meta.emoji} ${meta.title}\n\n` +
      `Preparing for SSC, Railway & Banking exams — join me at https://riserank.in`;
    try {
      await Share.share({ message });
    } catch {
      // Share sheet dismissed
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        {/* Floating particles — only render when visible */}
        {visible &&
          PARTICLES.map((emoji, i) =>
            Array.from({ length: 3 }, (_, j) => (
              <Particle
                key={`${i}-${j}`}
                emoji={emoji}
                delay={i * 80 + j * 250}
              />
            ))
          )}

        {/* Hero card */}
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: cardScale }], opacity: cardOpacity },
          ]}
        >
          {/* Glow circle */}
          <View style={[styles.glowCircle, { backgroundColor: meta.color + '22' }]}>
            <Text style={styles.heroEmoji}>{meta.emoji}</Text>
          </View>

          {/* Badge */}
          <View style={[styles.badge, { backgroundColor: meta.color }]}>
            <Text style={styles.badgeText}>{meta.badge}</Text>
          </View>

          <Text style={styles.title}>{meta.title}</Text>
          <Text style={styles.subtitle}>{meta.subtitle}</Text>

          {/* Share */}
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: meta.color }]}
            activeOpacity={0.85}
            onPress={handleShare}
          >
            <Text style={styles.shareBtnText}>📤 Share Achievement</Text>
          </TouchableOpacity>

          {/* Dismiss */}
          <TouchableOpacity style={styles.dismissBtn} activeOpacity={0.7} onPress={onDismiss}>
            <Text style={styles.dismissBtnText}>Continue →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  particle: {
    position: 'absolute',
    fontSize: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  glowCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroEmoji: {
    fontSize: 52,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginBottom: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  shareBtn: {
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  dismissBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  dismissBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
});
