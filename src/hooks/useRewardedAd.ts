/**
 * useRewardedAd
 * Loads a rewarded ad and exposes a `show(onRewarded)` function.
 * Calls onRewarded() only when the user earns the reward (watched ad fully).
 *
 * Usage:
 *   const { show, isLoaded } = useRewardedAd();
 *   show(() => revealExplanation());
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../services/ads.service';

export function useRewardedAd() {
  const adRef = useRef<RewardedAd | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const rewardCallbackRef = useRef<(() => void) | null>(null);

  const load = useCallback(() => {
    const ad = RewardedAd.createForAdRequest(AD_UNITS.REWARDED, {
      requestNonPersonalizedAdsOnly: false,
    });

    const onLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setIsLoaded(true);
    });

    const onEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      rewardCallbackRef.current?.();
      rewardCallbackRef.current = null;
    });

    const onClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setIsLoaded(false);
      // Preload next ad
      load();
    });

    const onError = ad.addAdEventListener(AdEventType.ERROR, () => {
      setIsLoaded(false);
      setTimeout(load, 30_000);
    });

    ad.load();
    adRef.current = ad;

    return () => {
      onLoaded();
      onEarned();
      onClosed();
      onError();
    };
  }, []);

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  /**
   * Show the rewarded ad.
   * @param onRewarded - called only if user watches to completion and earns reward
   * @param onNotLoaded - called if ad isn't ready (optional fallback)
   */
  const show = useCallback(
    (onRewarded: () => void, onNotLoaded?: () => void) => {
      if (isLoaded && adRef.current) {
        rewardCallbackRef.current = onRewarded;
        adRef.current.show();
      } else {
        onNotLoaded?.();
      }
    },
    [isLoaded]
  );

  return { show, isLoaded };
}
