/**
 * useInterstitialAd
 * Loads an interstitial ad on mount and exposes a `show()` function.
 * The ad reloads automatically after being dismissed.
 *
 * Usage:
 *   const { show } = useInterstitialAd();
 *   // Call show() at an appropriate moment (e.g. after quiz result loads)
 */

import { useEffect, useRef, useCallback } from 'react';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../services/ads.service';

export function useInterstitialAd() {
  const adRef = useRef<InterstitialAd | null>(null);
  const loadedRef = useRef(false);

  const load = useCallback(() => {
    const ad = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: false,
    });

    const onLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
    });

    const onClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      // Reload for next time
      load();
    });

    const onError = ad.addAdEventListener(AdEventType.ERROR, () => {
      loadedRef.current = false;
      // Retry after 30s on error
      setTimeout(load, 30_000);
    });

    ad.load();
    adRef.current = ad;

    return () => {
      onLoaded();
      onClosed();
      onError();
    };
  }, []);

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  const show = useCallback(() => {
    if (loadedRef.current && adRef.current) {
      adRef.current.show();
    }
    // If not loaded yet, silently skip — never block the user
  }, []);

  return { show };
}
