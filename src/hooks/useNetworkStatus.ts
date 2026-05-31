/**
 * useNetworkStatus — subscribes to @react-native-community/netinfo and
 * keeps appStore.isOnline in sync.
 *
 * Call this ONCE at the top of App.tsx:
 *   useNetworkStatus();
 *
 * NOTE: Add @react-native-community/netinfo to package.json if not present.
 */

import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

export function useNetworkStatus() {
  const setOnline = useAppStore((s) => s.setOnline);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Dynamic import so the app doesn't crash if the package isn't installed yet
    import('@react-native-community/netinfo')
      .then((NetInfo) => {
        unsubscribe = NetInfo.default.addEventListener((state) => {
          setOnline(state.isConnected ?? true);
        });
      })
      .catch(() => {
        // netinfo not installed — assume online
        setOnline(true);
      });

    return () => { unsubscribe?.(); };
  }, [setOnline]);
}
