/**
 * RateAppModal — "Enjoying RiseRank? Rate us on Play Store" prompt.
 * Rendered by QuizResultScreen when useRateApp().shouldShowRatePrompt is true.
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface RateAppModalProps {
  visible: boolean;
  onRate: () => void;
  onLater: () => void;
  onNever: () => void;
}

export function RateAppModal({ visible, onRate, onLater, onNever }: RateAppModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Stars graphic */}
          <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>

          <Text style={styles.heading}>Enjoying RiseRank?</Text>
          <Text style={styles.body}>
            Help other students find us — it only takes a second and means a lot!
          </Text>

          {/* Rate now */}
          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={onRate}>
            <Text style={styles.primaryBtnText}>Rate on Play Store 🚀</Text>
          </TouchableOpacity>

          {/* Later */}
          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.75} onPress={onLater}>
            <Text style={styles.secondaryBtnText}>Maybe later</Text>
          </TouchableOpacity>

          {/* Never */}
          <TouchableOpacity activeOpacity={0.6} onPress={onNever}>
            <Text style={styles.neverText}>No thanks</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  stars: {
    fontSize: 36,
    letterSpacing: 4,
    marginBottom: 12,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  secondaryBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14,
  },
  neverText: {
    color: '#94A3B8',
    fontSize: 13,
    paddingVertical: 4,
  },
});
