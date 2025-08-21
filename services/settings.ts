import { doc, updateDoc, setDoc, onSnapshot, Unsubscribe, getDoc } from 'firebase/firestore';
import { db } from '@/configs/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserSettings {
  // Privacy & Security
  readReceipts: boolean;
  lastSeen: boolean;
  biometricAuth: boolean;
  secretChatNotifications: boolean;
  
  // App Settings
  notifications: boolean;
  autoDownloadMedia: boolean;
  spotifyIntegration: boolean;
}

export interface DeviceSettings {
  darkMode: boolean; // This stays on device only
}

const DEFAULT_USER_SETTINGS: UserSettings = {
  readReceipts: true,
  lastSeen: true,
  biometricAuth: true,
  secretChatNotifications: true,
  notifications: true,
  autoDownloadMedia: false,
  spotifyIntegration: true,
};

const DEFAULT_DEVICE_SETTINGS: DeviceSettings = {
  darkMode: false,
};

const DEVICE_SETTINGS_KEY = 'device_settings';

/**
 * Save user settings to Firestore (auto-save)
 */
export const saveUserSettings = async (userId: string, settings: UserSettings): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      settings: settings,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw new Error('Failed to save settings');
  }
};

/**
 * Subscribe to user settings changes from Firestore
 */
export const subscribeToUserSettings = (
  userId: string,
  onSettingsChange: (settings: UserSettings) => void
): Unsubscribe => {
  const userRef = doc(db, 'users', userId);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      const settings = userData.settings || DEFAULT_USER_SETTINGS;
      onSettingsChange(settings);
    } else {
      onSettingsChange(DEFAULT_USER_SETTINGS);
    }
  }, (error) => {
    console.error('Error listening to user settings:', error);
    onSettingsChange(DEFAULT_USER_SETTINGS);
  });
};

/**
 * Save device-specific settings to local storage
 */
export const saveDeviceSettings = async (settings: DeviceSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(DEVICE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving device settings:', error);
    throw new Error('Failed to save device settings');
  }
};

/**
 * Load device-specific settings from local storage
 */
export const loadDeviceSettings = async (): Promise<DeviceSettings> => {
  try {
    const settingsJson = await AsyncStorage.getItem(DEVICE_SETTINGS_KEY);
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
    return DEFAULT_DEVICE_SETTINGS;
  } catch (error) {
    console.error('Error loading device settings:', error);
    return DEFAULT_DEVICE_SETTINGS;
  }
};

/**
 * Initialize user settings if they don't exist
 */
export const initializeUserSettings = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (!userData.settings) {
        // User exists but doesn't have settings, add them
        await setDoc(userRef, {
          settings: DEFAULT_USER_SETTINGS,
          updatedAt: new Date(),
        }, { merge: true });
        console.log('Initialized settings for existing user:', userId);
      }
    }
  } catch (error) {
    console.error('Error initializing user settings:', error);
    throw new Error('Failed to initialize user settings');
  }
};

/**
 * Update a single user setting (auto-save to Firestore)
 */
export const updateUserSetting = async (
  userId: string,
  key: keyof UserSettings,
  value: boolean
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // First, ensure the user has settings initialized
    await initializeUserSettings(userId);
    
    // Now update the specific setting using setDoc with merge
    await setDoc(userRef, {
      settings: {
        [key]: value
      },
      updatedAt: new Date(),
    }, { merge: true });
    
    console.log(`Updated ${key} setting to ${value} for user ${userId}`);
  } catch (error) {
    console.error(`Error updating ${key} setting:`, error);
    throw new Error(`Failed to update ${key} setting`);
  }
};

/**
 * Update a single device setting (save to local storage)
 */
export const updateDeviceSetting = async (
  key: keyof DeviceSettings,
  value: boolean
): Promise<void> => {
  try {
    const currentSettings = await loadDeviceSettings();
    const updatedSettings = { ...currentSettings, [key]: value };
    await saveDeviceSettings(updatedSettings);
  } catch (error) {
    console.error(`Error updating device ${key} setting:`, error);
    throw new Error(`Failed to update device ${key} setting`);
  }
};
