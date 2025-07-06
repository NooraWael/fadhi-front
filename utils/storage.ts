import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage utility for فاضي؟ app
 * Handles all AsyncStorage operations with proper error handling
 */

// Storage keys - centralized for consistency
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  THEME_PREFERENCE: 'theme_preference',
  NOTIFICATION_SETTINGS: 'notification_settings',
  CHAT_SETTINGS: 'chat_settings',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

/**
 * Get data from AsyncStorage
 * @param key - Storage key
 * @returns Promise with the stored data or null if not found
 */
export const getData = async <T = any>(key: StorageKey): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) {
      return null;
    }
    
    // Try to parse JSON, return as string if parsing fails
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return null;
  }
};

/**
 * Set data in AsyncStorage
 * @param key - Storage key
 * @param value - Value to store
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const setData = async <T = any>(key: StorageKey, value: T): Promise<boolean> => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    console.error(`Error setting data for key ${key}:`, error);
    return false;
  }
};

/**
 * Remove data from AsyncStorage
 * @param key - Storage key
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const removeData = async (key: StorageKey): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    return false;
  }
};

/**
 * Clear all data from AsyncStorage
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const clearAllData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};

/**
 * Check if a key exists in AsyncStorage
 * @param key - Storage key
 * @returns Promise<boolean> - true if key exists, false otherwise
 */
export const hasData = async (key: StorageKey): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error(`Error checking if key ${key} exists:`, error);
    return false;
  }
};

/**
 * Get multiple values at once
 * @param keys - Array of storage keys
 * @returns Promise with object containing key-value pairs
 */
export const getMultipleData = async <T = any>(
  keys: StorageKey[]
): Promise<Record<string, T | null>> => {
  try {
    const values = await AsyncStorage.multiGet(keys);
    const result: Record<string, T | null> = {};
    
    values.forEach(([key, value]) => {
      if (value === null) {
        result[key] = null;
      } else {
        try {
          result[key] = JSON.parse(value) as T;
        } catch {
          result[key] = value as T;
        }
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error getting multiple data:', error);
    return {};
  }
};

/**
 * Set multiple values at once
 * @param data - Object with key-value pairs to store
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const setMultipleData = async <T = any>(
  data: Record<StorageKey, T>
): Promise<boolean> => {
  try {
    const keyValuePairs: [string, string][] = Object.entries(data).map(([key, value]) => [
      key,
      typeof value === 'string' ? value : JSON.stringify(value),
    ]);
    
    await AsyncStorage.multiSet(keyValuePairs);
    return true;
  } catch (error) {
    console.error('Error setting multiple data:', error);
    return false;
  }
};

// Type-safe helper functions for common storage operations

/**
 * User-specific storage helpers
 */
export const userStorage = {
  getToken: () => getData<string>(STORAGE_KEYS.USER_TOKEN),
  setToken: (token: string) => setData(STORAGE_KEYS.USER_TOKEN, token),
  removeToken: () => removeData(STORAGE_KEYS.USER_TOKEN),
  
  getUserData: () => getData<any>(STORAGE_KEYS.USER_DATA),
  setUserData: (userData: any) => setData(STORAGE_KEYS.USER_DATA, userData),
  removeUserData: () => removeData(STORAGE_KEYS.USER_DATA),
};

/**
 * Settings storage helpers
 */
export const settingsStorage = {
  getBiometricEnabled: () => getData<boolean>(STORAGE_KEYS.BIOMETRIC_ENABLED),
  setBiometricEnabled: (enabled: boolean) => setData(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled),
  
  getThemePreference: () => getData<'light' | 'dark' | 'system'>(STORAGE_KEYS.THEME_PREFERENCE),
  setThemePreference: (theme: 'light' | 'dark' | 'system') => setData(STORAGE_KEYS.THEME_PREFERENCE, theme),
  
  getOnboardingCompleted: () => getData<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED),
  setOnboardingCompleted: (completed: boolean) => setData(STORAGE_KEYS.ONBOARDING_COMPLETED, completed),
};