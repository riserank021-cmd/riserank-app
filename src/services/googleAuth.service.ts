/**
 * googleAuth.service.ts
 *
 * Wraps @react-native-google-signin/google-signin so the rest of the app
 * never imports that library directly.  All Google-SDK calls live here.
 *
 * Setup (one-time, per environment):
 *   1. In Google Cloud Console create an OAuth 2.0 "Web application" client
 *      and an "Android" client (with your keystore SHA-1).
 *   2. Set GOOGLE_WEB_CLIENT_ID in .env  (the Web client ID is used for
 *      server-side verification even on Android).
 *   3. Place google-services.json in android/app/.
 *
 * The webClientId below reads from the Expo/RN env via react-native-config.
 * If you're not using react-native-config, replace Config.GOOGLE_WEB_CLIENT_ID
 * with your literal string for testing.
 */

import {
  GoogleSignin,
  statusCodes,
  type User as GoogleUser,
} from '@react-native-google-signin/google-signin';

// ---------------------------------------------------------------------------
// Initialise once (safe to call multiple times — idempotent after first call)
// ---------------------------------------------------------------------------

let _configured = false;

export function configureGoogleSignIn(webClientId: string): void {
  if (_configured) return;
  GoogleSignin.configure({
    webClientId,                // Required for server-side token verification
    offlineAccess: false,       // We don't need a server auth code
    forceCodeForRefreshToken: false,
  });
  _configured = true;
}

// ---------------------------------------------------------------------------
// Sign-in — returns the Google ID token for server verification
// ---------------------------------------------------------------------------

export interface GoogleSignInResult {
  idToken: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    photo: string | null;
  };
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const userInfo: GoogleUser = await GoogleSignin.signIn();

  const idToken = userInfo.data?.idToken;
  if (!idToken) {
    throw new Error('Google Sign-In did not return an ID token.');
  }

  return {
    idToken,
    user: {
      id: userInfo.data?.user.id ?? '',
      name: userInfo.data?.user.name ?? null,
      email: userInfo.data?.user.email ?? '',
      photo: userInfo.data?.user.photo ?? null,
    },
  };
}

// ---------------------------------------------------------------------------
// Sign-out (clears Google session — our JWT logout is handled separately)
// ---------------------------------------------------------------------------

export async function signOutFromGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Not critical — swallow silently
  }
}

// ---------------------------------------------------------------------------
// Error classifier — turns SDK error codes into user-friendly messages
// ---------------------------------------------------------------------------

export function getGoogleErrorMessage(err: unknown): string | null {
  if (!err || typeof err !== 'object') return null;

  const code = (err as any).code;

  switch (code) {
    case statusCodes.SIGN_IN_CANCELLED:
      return null; // User dismissed — no toast needed
    case statusCodes.IN_PROGRESS:
      return 'Sign-in already in progress. Please wait.';
    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
      return 'Google Play Services not available on this device.';
    default:
      return 'Google Sign-In failed. Please try again.';
  }
}
