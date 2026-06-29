/**
 * ads.service.ts
 * Centralized AdMob configuration.
 *
 * HOW TO GO LIVE:
 * 1. Go to https://admob.google.com → Apps → Add App → Android → "RiseRank"
 * 2. Copy the App ID and replace the value in AndroidManifest.xml:
 *      android:value="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
 * 3. Create ad units (Banner, Interstitial, Rewarded) in AdMob console
 * 4. Replace the PROD_* constants below with your real ad unit IDs
 * 5. Set IS_TEST_MODE = false before building the release APK
 */

import {
  MobileAds,
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';

// ── Toggle this to false when publishing to Play Store ───────────────────────
export const IS_TEST_MODE = __DEV__;

// ── Test Ad Unit IDs (Google's official test IDs — safe during development) ──
const TEST_BANNER       = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL = 'ca-app-pub-3940256099942544/1033173712';
const TEST_REWARDED     = 'ca-app-pub-3940256099942544/5224354917';

// ── Production Ad Unit IDs ────────────────────────────────────────────────────
const PROD_BANNER       = 'ca-app-pub-4897943258060219/5087673700';
const PROD_INTERSTITIAL = 'ca-app-pub-4897943258060219/3774592039';
const PROD_REWARDED     = 'ca-app-pub-4897943258060219/5747973082';

export const AD_UNITS = {
  BANNER:       IS_TEST_MODE ? TEST_BANNER       : PROD_BANNER,
  INTERSTITIAL: IS_TEST_MODE ? TEST_INTERSTITIAL : PROD_INTERSTITIAL,
  REWARDED:     IS_TEST_MODE ? TEST_REWARDED     : PROD_REWARDED,
};

// ── Initialize AdMob once on app start ───────────────────────────────────────
export async function initAds() {
  try {
    await MobileAds().initialize();
    await MobileAds().setRequestConfiguration({
      // G-rated content (exam prep app — all ages)
      maxAdContentRating: MaxAdContentRating.G,
      // Tag users under 16 for COPPA compliance if needed
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
  } catch (e) {
    // Non-fatal — app continues without ads if init fails
    console.warn('[Ads] Failed to initialize AdMob:', e);
  }
}
