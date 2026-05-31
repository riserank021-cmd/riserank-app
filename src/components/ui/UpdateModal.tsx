/**
 * UpdateModal — shown when the server reports a newer version is available.
 *
 * forceUpdate=true  → non-dismissable, "Update Now" is the only action.
 * softUpdate=true   → dismissable with "Update Now" and "Later" buttons.
 */

import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Linking,
} from 'react-native';
import { PLAY_STORE_URL } from '../../utils/constants';

interface UpdateModalProps {
  visible: boolean;
  latestVersion: string;
  forceUpdate: boolean;
  maintenanceMode?: boolean;
  onDismiss?: () => void; // only called for soft updates
}

export function UpdateModal({
  visible,
  latestVersion,
  forceUpdate,
  maintenanceMode = false,
  onDismiss,
}: UpdateModalProps) {
  // Block hardware back button when force update is required
  useEffect(() => {
    if (!visible || !forceUpdate) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [visible, forceUpdate]);

  const handleUpdate = () => {
    Linking.openURL(PLAY_STORE_URL).catch(() => {});
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={forceUpdate ? undefined : onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Icon */}
          <Text style={styles.icon}>
            {maintenanceMode ? '🔧' : forceUpdate ? '🔄' : '✨'}
          </Text>

          <Text style={styles.heading}>
            {maintenanceMode
              ? 'Under Maintenance'
              : forceUpdate
              ? 'Update Required'
              : 'New Version Available'}
          </Text>

          {!maintenanceMode && <Text style={styles.version}>v{latestVersion}</Text>}

          <Text style={styles.body}>
            {maintenanceMode
              ? "We're performing scheduled maintenance. RiseRank will be back shortly. Thank you for your patience!"
              : forceUpdate
              ? 'This version of RiseRank is no longer supported. Please update to continue.'
              : 'A new version of RiseRank is available with improvements and bug fixes.'}
          </Text>

          {!maintenanceMode && (
            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={handleUpdate}>
              <Text style={styles.primaryBtnText}>Update Now 🚀</Text>
            </TouchableOpacity>
          )}

          {!forceUpdate && !maintenanceMode && onDismiss && (
            <TouchableOpacity style={styles.laterBtn} activeOpacity={0.7} onPress={onDismiss}>
              <Text style={styles.laterBtnText}>Later</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
  icon: {
    fontSize: 56,
    marginBottom: 12,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  version: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 12,
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
  laterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  laterBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
});
