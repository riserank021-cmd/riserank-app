/**
 * Typed wrappers around @react-native-async-storage/async-storage.
 * All functions are async and never throw — they catch internally
 * and return null / false on failure.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async get<T = string>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown): Promise<boolean> {
    try {
      const raw = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, raw);
      return true;
    } catch {
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};
