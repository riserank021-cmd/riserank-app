/**
 * crashReporter — thin adapter over @sentry/react-native.
 *
 * Initialisation is a no-op when:
 *   • The package isn't installed (lazy require catches the ModuleNotFoundError)
 *   • SENTRY_DSN is not provided at build time
 *
 * Usage:
 *   1. Install: npm install @sentry/react-native
 *   2. Run the Sentry wizard:  npx @sentry/wizard -i reactNative
 *   3. Add to android/app/build.gradle (the wizard does this automatically)
 *   4. Set SENTRY_DSN in your CI env / .env
 *
 * Wire-up in App.tsx:
 *   import { initCrashReporter, reportError } from './src/services/crashReporter';
 *   // call initCrashReporter() once at app start
 *   // pass reportError to <ErrorBoundary onError={reportError} />
 */

import type { ErrorInfo } from 'react';

// DSN injected at build time via Babel/Metro config, or empty string.
// Provide it through your CI secrets as SENTRY_DSN.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DSN: string = (global as any).__SENTRY_DSN__ ?? '';

let sentry: typeof import('@sentry/react-native') | null = null;

/** Lazily load @sentry/react-native — returns null if package is not installed. */
function getSentry(): typeof import('@sentry/react-native') | null {
  if (sentry !== null) return sentry;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    sentry = require('@sentry/react-native');
    return sentry;
  } catch {
    return null;
  }
}

/**
 * Call once in App.tsx before rendering the navigation tree.
 * Safe to call even when Sentry is not installed or DSN is empty.
 */
export function initCrashReporter(): void {
  if (!DSN) {
    if (__DEV__) {
      console.log('[crashReporter] SENTRY_DSN not set — crash reporting disabled.');
    }
    return;
  }
  const Sentry = getSentry();
  if (!Sentry) {
    if (__DEV__) {
      console.warn('[crashReporter] @sentry/react-native not installed — crash reporting disabled.');
    }
    return;
  }
  Sentry.init({
    dsn: DSN,
    environment: __DEV__ ? 'development' : 'production',
    // Sample 100 % of errors in dev, 10 % in prod (adjust as needed)
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    // Attach breadcrumbs to every event
    attachStacktrace: true,
    // Disable in dev so you don't pollute your Sentry project while testing
    enabled: !__DEV__,
  });
}

/**
 * Report a caught error to Sentry. Pass this as `onError` to <ErrorBoundary>.
 * Also works for manual reporting outside the boundary.
 */
export function reportError(error: Error, info?: ErrorInfo): void {
  if (__DEV__) {
    console.error('[crashReporter] Error reported:', error.message);
  }
  const Sentry = getSentry();
  if (!Sentry || !DSN) return;
  Sentry.withScope((scope) => {
    if (info?.componentStack) {
      scope.setExtra('componentStack', info.componentStack);
    }
    Sentry.captureException(error);
  });
}

/**
 * Tag the current user so Sentry events are linked to their account.
 * Call after login; call clearCrashReporterUser() after logout.
 */
export function setCrashReporterUser(userId: string, email?: string): void {
  const Sentry = getSentry();
  if (!Sentry || !DSN) return;
  Sentry.setUser({ id: userId, email });
}

/** Clear user context — call on logout. */
export function clearCrashReporterUser(): void {
  const Sentry = getSentry();
  if (!Sentry || !DSN) return;
  Sentry.setUser(null);
}
