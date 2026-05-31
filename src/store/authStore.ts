/**
 * Auth store — manages access/refresh tokens, user object, and session state.
 *
 * Hydration: call `authStore.getState().hydrate()` on app start to reload
 * persisted tokens from AsyncStorage before rendering the navigator.
 */

import { create } from 'zustand';
import { authService } from '../api/auth.service';
import { userService } from '../api/user.service';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { setCrashReporterUser, clearCrashReporterUser } from '../services/crashReporter';
import { signOutFromGoogle } from '../services/googleAuth.service';
import type { User, LoginPayload, RegisterPayload } from '../types/api.types';

interface AuthState {
  // ── State ─────────────────────────────────────────────────────────────────
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;        // true after AsyncStorage has been read
  isLoading: boolean;
  error: string | null;

  // ── Actions ───────────────────────────────────────────────────────────────
  hydrate: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  googleSignIn: (idToken: string) => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  sessionId: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoading: false,
  error: null,

  // ── Hydrate from storage ──────────────────────────────────────────────────
  hydrate: async () => {
    try {
      const [accessToken, refreshToken, sessionId, cachedUser] = await Promise.all([
        storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN),
        storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN),
        storage.get<string>(STORAGE_KEYS.SESSION_ID),
        storage.get<User>(STORAGE_KEYS.USER),
      ]);

      // Restore from cache immediately so the UI isn't blank
      set({
        accessToken,
        refreshToken,
        sessionId,
        user: cachedUser,
        isAuthenticated: !!accessToken,
        isHydrated: true,
      });

      if (cachedUser && accessToken) {
        setCrashReporterUser(cachedUser._id, cachedUser.email);
      }

      // If authenticated, fetch a fresh user profile in the background so
      // stats (streak, totalCorrect, totalTimeSpentSeconds, etc.) are always current.
      if (accessToken) {
        try {
          const { data } = await userService.getProfile();
          const freshUser = data.data;
          if (freshUser) {
            set({ user: freshUser });
            await storage.set(STORAGE_KEYS.USER, freshUser);
          }
        } catch {
          // Non-critical — cached user already set above; will retry on next hydrate
        }
      }
    } catch {
      set({ isHydrated: true });
    }
  },

  // ── Register ──────────────────────────────────────────────────────────────
  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.register({ ...payload, device: 'android' });
      const { accessToken, refreshToken, sessionId, user } = data.data!;

      await Promise.all([
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        storage.set(STORAGE_KEYS.SESSION_ID, sessionId),
        storage.set(STORAGE_KEYS.USER, user),
      ]);

      set({ accessToken, refreshToken, sessionId, user, isAuthenticated: true, isLoading: false });
      setCrashReporterUser(user._id, user.email);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Registration failed. Try again.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ── Login ─────────────────────────────────────────────────────────────────
  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.login({ ...payload, device: 'android' });
      const { accessToken, refreshToken, sessionId, user } = data.data!;

      await Promise.all([
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        storage.set(STORAGE_KEYS.SESSION_ID, sessionId),
        storage.set(STORAGE_KEYS.USER, user),
      ]);

      set({ accessToken, refreshToken, sessionId, user, isAuthenticated: true, isLoading: false });
      setCrashReporterUser(user._id, user.email);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Login failed. Check your credentials.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ── Google Sign-In ────────────────────────────────────────────────────────
  googleSignIn: async (idToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.googleSignIn(idToken, 'android');
      const { accessToken, refreshToken, sessionId, user, isNewUser } = data.data!;

      await Promise.all([
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        storage.set(STORAGE_KEYS.SESSION_ID, sessionId),
        storage.set(STORAGE_KEYS.USER, user),
      ]);

      set({ accessToken, refreshToken, sessionId, user, isAuthenticated: true, isLoading: false });
      setCrashReporterUser(user._id, user.email);
      return { isNewUser: !!isNewUser };
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Google Sign-In failed. Try again.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  // ── Logout ────────────────────────────────────────────────────────────────
  logout: async () => {
    try {
      await Promise.all([authService.logout(), signOutFromGoogle()]);
    } catch {
      // Fire-and-forget — clear local state even if server call fails
    }
    clearCrashReporterUser();
    await Promise.all([
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN),
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN),
      storage.remove(STORAGE_KEYS.SESSION_ID),
      storage.remove(STORAGE_KEYS.USER),
    ]);
    set({ user: null, accessToken: null, refreshToken: null, sessionId: null, isAuthenticated: false });
  },

  // ── Helpers ───────────────────────────────────────────────────────────────
  setUser: (user) => {
    set({ user });
    storage.set(STORAGE_KEYS.USER, user);
  },

  clearError: () => set({ error: null }),
}));
