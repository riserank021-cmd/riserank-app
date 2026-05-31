/**
 * useAppVersion — fetches the server's app config on mount and
 * computes whether the user needs to update.
 *
 * Backend endpoint (add to your API):
 *   GET /app/config
 *   Response: { data: { minimumVersion: "1.0.0", latestVersion: "1.2.0" } }
 *
 * Returns:
 *   • forceUpdate  — current < minimumVersion (non-dismissable)
 *   • softUpdate   — current < latestVersion  (dismissable)
 *   • latestVersion — the latest available version string
 *
 * On network failure the hook returns false for both flags so the
 * app continues normally without blocking the user.
 */

import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { APP_VERSION } from '../utils/constants';
import { isOlderThan } from '../utils/semver';

interface AppConfig {
  minimumVersion: string;
  latestVersion: string;
  maintenanceMode?: boolean;
}

interface VersionState {
  forceUpdate: boolean;
  softUpdate: boolean;
  maintenanceMode: boolean;
  latestVersion: string;
  checked: boolean; // true once the check has completed (success or failure)
}

export function useAppVersion(): VersionState {
  const [state, setState] = useState<VersionState>({
    forceUpdate: false,
    softUpdate: false,
    maintenanceMode: false,
    latestVersion: APP_VERSION,
    checked: false,
  });

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<{ data: AppConfig }>('/app/config')
      .then(({ data }) => {
        if (cancelled) return;
        const { minimumVersion, latestVersion, maintenanceMode = false } = data.data;
        setState({
          forceUpdate: isOlderThan(APP_VERSION, minimumVersion),
          softUpdate:  isOlderThan(APP_VERSION, latestVersion),
          maintenanceMode,
          latestVersion,
          checked: true,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setState((s) => ({ ...s, checked: true }));
        }
      });
    return () => { cancelled = true; };
  }, []);

  return state;
}
