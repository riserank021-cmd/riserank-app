/**
 * App store — global UI state: language, connectivity, loading overlay, theme.
 * Language and theme are persisted to AsyncStorage.
 */

import { create } from 'zustand';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, LANGUAGES, type Language } from '../utils/constants';

export type Theme = 'light' | 'dark' | 'system';

interface AppState {
  language: Language;
  isOnline: boolean;
  globalLoading: boolean;
  theme: Theme;

  setLanguage: (lang: Language) => Promise<void>;
  setOnline: (online: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
  setTheme: (theme: Theme) => Promise<void>;
  hydrateLanguage: () => Promise<void>;
  hydrateTheme: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  language: LANGUAGES.EN,
  isOnline: true,
  globalLoading: false,
  theme: 'system',

  hydrateLanguage: async () => {
    const saved = await storage.get<Language>(STORAGE_KEYS.LANGUAGE);
    if (saved) set({ language: saved });
  },

  hydrateTheme: async () => {
    const saved = await storage.get<Theme>(STORAGE_KEYS.THEME);
    if (saved) set({ theme: saved });
  },

  setLanguage: async (lang) => {
    set({ language: lang });
    await storage.set(STORAGE_KEYS.LANGUAGE, lang);
  },

  setTheme: async (theme) => {
    set({ theme });
    await storage.set(STORAGE_KEYS.THEME, theme);
  },

  setOnline: (online) => set({ isOnline: online }),

  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));
