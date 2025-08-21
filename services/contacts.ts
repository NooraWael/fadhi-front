import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/configs/firebase';
import { UserProfile } from './auth';
import { 
  normalizePhoneNumber, 
  normalizeToE164,
  formatPhoneForDisplay 
} from '@/utils/phoneUtils';

export interface DeviceContact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers: string[];
  normalizedPhones: string[];
  imageUri?: string;
}

export interface AppContact extends DeviceContact {
  userProfile?: UserProfile;
  isAppUser: boolean;
  lastSeen?: Date;
  isOnline?: boolean;
}

interface ContactSyncCache {
  lastSyncTime: number;
  contacts: DeviceContact[];
  appUsers: { [phoneNumber: string]: UserProfile };
}

const CACHE_KEY = 'contacts_cache';
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Prevent multiple simultaneous syncs
let isSyncing = false;
let syncPromise: Promise<AppContact[]> | null = null;

/**
 * Request contacts permission
 */
export const requestContactsPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting contacts permission:', error);
    return false;
  }
};

/**
 * Fetch device contacts
 */
export const fetchDeviceContacts = async (): Promise<DeviceContact[]> => {
  try {
    console.log('📱 Fetching device contacts...');
    
    const hasPermission = await requestContactsPermission();
    if (!hasPermission) {
      console.log('📱 Contacts permission denied');
      return [];
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.FirstName,
        Contacts.Fields.LastName,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Image,
      ],
    });

    console.log(`📱 Found ${data.length} device contacts`);

    const deviceContacts: DeviceContact[] = data
      .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
      .map(contact => {
        const phoneNumbers = contact.phoneNumbers?.map(phone => phone.number || '') || [];
        const normalizedPhones = phoneNumbers
          .map(phone => normalizeToE164(phone))
          .filter(phone => phone !== null) as string[];

        return {
          id: contact.id || '',
          name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
          firstName: contact.firstName,
          lastName: contact.lastName,
          phoneNumbers,
          normalizedPhones,
          imageUri: contact.image?.uri,
        };
      })
      .filter(contact => contact.normalizedPhones.length > 0);

    console.log(`📱 Processed ${deviceContacts.length} contacts with phone numbers`);
    return deviceContacts;
  } catch (error) {
    console.error('Error fetching device contacts:', error);
    return [];
  }
};

/**
 * Find app users by phone numbers
 */
export const findAppUsersByPhones = async (phoneNumbers: string[]): Promise<{ [phone: string]: UserProfile }> => {
  try {
    console.log(`🔍 Searching for app users among ${phoneNumbers.length} phone numbers`);
    
    if (phoneNumbers.length === 0) {
      return {};
    }

    // Firestore 'in' queries are limited to 10 items, so we need to batch
    const batchSize = 10;
    const batches: string[][] = [];
    
    for (let i = 0; i < phoneNumbers.length; i += batchSize) {
      batches.push(phoneNumbers.slice(i, i + batchSize));
    }

    const userMap: { [phone: string]: UserProfile } = {};

    for (const batch of batches) {
      try {
        const usersQuery = query(
          collection(db, 'users'),
          where('phone', 'in', batch)
        );
        
        const querySnapshot = await getDocs(usersQuery);
        
        querySnapshot.forEach(doc => {
          const userData = doc.data() as UserProfile;
          if (userData.phone) {
            // Map the normalized phone number to the user
            const normalizedPhone = normalizeToE164(userData.phone);
            if (normalizedPhone) {
              userMap[normalizedPhone] = userData;
            }
          }
        });
      } catch (error) {
        console.error('Error in batch query:', error);
      }
    }

    console.log(`🔍 Found ${Object.keys(userMap).length} app users`);
    return userMap;
  } catch (error) {
    console.error('Error finding app users:', error);
    return {};
  }
};

/**
 * Get cached contact data
 */
const getCachedContacts = async (): Promise<ContactSyncCache | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error getting cached contacts:', error);
  }
  return null;
};

/**
 * Cache contact data
 */
const setCachedContacts = async (cache: ContactSyncCache): Promise<void> => {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error caching contacts:', error);
  }
};

/**
 * Check if cache is still valid
 */
const isCacheValid = (cache: ContactSyncCache): boolean => {
  const now = Date.now();
  return (now - cache.lastSyncTime) < SYNC_INTERVAL;
};

/**
 * Sync contacts with app users (main function)
 */
export const syncContacts = async (forceSync: boolean = false): Promise<AppContact[]> => {
  try {
    // Prevent multiple simultaneous syncs
    if (isSyncing && syncPromise) {
      console.log('🔄 Sync already in progress, waiting for completion...');
      return await syncPromise;
    }

    console.log('🔄 Starting contact sync...', forceSync ? '(forced)' : '');
    
    // Check cache first
    if (!forceSync) {
      const cached = await getCachedContacts();
      if (cached && isCacheValid(cached)) {
        console.log('📦 Using cached contacts');
        return mergeContactsWithUsers(cached.contacts, cached.appUsers);
      }
    }

    // Set syncing flag and create promise
    isSyncing = true;
    syncPromise = performSync();
    
    const result = await syncPromise;
    
    // Reset syncing state
    isSyncing = false;
    syncPromise = null;
    
    return result;
  } catch (error) {
    // Reset syncing state on error
    isSyncing = false;
    syncPromise = null;
    console.error('Error syncing contacts:', error);
    return [];
  }
};

/**
 * Perform the actual sync operation
 */
const performSync = async (): Promise<AppContact[]> => {
  // Fetch fresh data
  const deviceContacts = await fetchDeviceContacts();
  
  if (deviceContacts.length === 0) {
    console.log('📱 No device contacts found');
    return [];
  }

  // Get all unique normalized phone numbers
  const allPhones = new Set<string>();
  deviceContacts.forEach(contact => {
    contact.normalizedPhones.forEach(phone => allPhones.add(phone));
  });

  // Find app users
  const appUsers = await findAppUsersByPhones(Array.from(allPhones));

  // Cache the results
  const cache: ContactSyncCache = {
    lastSyncTime: Date.now(),
    contacts: deviceContacts,
    appUsers,
  };
  await setCachedContacts(cache);

  console.log('✅ Contact sync completed');
  return mergeContactsWithUsers(deviceContacts, appUsers);
};

/**
 * Merge device contacts with app user data
 */
const mergeContactsWithUsers = (
  deviceContacts: DeviceContact[], 
  appUsers: { [phone: string]: UserProfile }
): AppContact[] => {
  return deviceContacts.map(contact => {
    // Check if any of this contact's phone numbers match an app user
    let userProfile: UserProfile | undefined;
    
    for (const phone of contact.normalizedPhones) {
      if (appUsers[phone]) {
        userProfile = appUsers[phone];
        break;
      }
    }

    const appContact: AppContact = {
      ...contact,
      isAppUser: !!userProfile,
      userProfile,
    };

    // If it's an app user, add additional info
    if (userProfile) {
      appContact.isOnline = userProfile.isOnline;
      appContact.lastSeen = userProfile.lastSeen ? new Date(userProfile.lastSeen.seconds * 1000) : undefined;
    }

    return appContact;
  });
};

/**
 * Get contacts (with automatic sync)
 */
export const getContacts = async (): Promise<AppContact[]> => {
  return await syncContacts(false);
};

/**
 * Force refresh contacts
 */
export const refreshContacts = async (): Promise<AppContact[]> => {
  return await syncContacts(true);
};

/**
 * Get only app user contacts
 */
export const getAppUserContacts = async (): Promise<AppContact[]> => {
  const allContacts = await getContacts();
  return allContacts.filter(contact => contact.isAppUser);
};

/**
 * Search contacts
 */
export const searchContacts = async (query: string): Promise<AppContact[]> => {
  const allContacts = await getContacts();
  const lowercaseQuery = query.toLowerCase();
  
  return allContacts.filter(contact => {
    // Search by name
    if (contact.name.toLowerCase().includes(lowercaseQuery)) {
      return true;
    }
    
    // Search by username (if app user)
    if (contact.userProfile?.username?.toLowerCase().includes(lowercaseQuery)) {
      return true;
    }
    
    // Search by phone number
    if (contact.phoneNumbers.some(phone => phone.includes(query))) {
      return true;
    }
    
    return false;
  });
};

/**
 * Clear contacts cache
 */
export const clearContactsCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Contacts cache cleared');
  } catch (error) {
    console.error('Error clearing contacts cache:', error);
  }
};
