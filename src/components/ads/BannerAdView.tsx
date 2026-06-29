/**
 * BannerAdView
 * Renders a Google AdMob banner. Silently hides itself on error.
 * Use at the bottom of list screens (Home, QuizList, CurrentAffairs).
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../../services/ads.service';

interface Props {
  /** Defaults to BANNER (320×50). Use ADAPTIVE_BANNER for full-width. */
  size?: BannerAdSize;
}

export function BannerAdView({ size = BannerAdSize.ADAPTIVE_BANNER }: Props) {
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <View className="items-center bg-surface py-1">
      <BannerAd
        unitId={AD_UNITS.BANNER}
        size={size}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={() => setHasError(true)}
      />
    </View>
  );
}
