import { 
  collection, 
  query, 
  where, 
  orderBy,
  startAt,
  endAt,
  limit,
  getDocs,
  or,
  and
} from 'firebase/firestore';
import { db } from '@/configs/firebase';
import { UserProfile } from './auth';
import { normalizeToE164 } from '@/utils/phoneUtils';

export interface SearchResult extends UserProfile {
  matchType: 'phone' | 'email' | 'username' | 'name';
  matchText: string;
}

/**
 * Search users by phone number
 */
export const searchUsersByPhone = async (phoneQuery: string): Promise<SearchResult[]> => {
  try {
    console.log('🔍 Searching users by phone:', phoneQuery);
    
    // Normalize the phone number
    const normalizedPhone = normalizeToE164(phoneQuery);
    if (!normalizedPhone) {
      return [];
    }
    
    // Search for exact phone match
    const phoneSearchQuery = query(
      collection(db, 'users'),
      where('phone', '==', normalizedPhone.substring(1)), // Remove + for storage format
      limit(10)
    );
    
    const querySnapshot = await getDocs(phoneSearchQuery);
    const results: SearchResult[] = [];
    
    querySnapshot.forEach(doc => {
      const userData = doc.data() as UserProfile;
      results.push({
        ...userData,
        matchType: 'phone',
        matchText: userData.phone
      });
    });
    
    console.log(`🔍 Found ${results.length} users by phone`);
    return results;
  } catch (error) {
    console.error('Error searching users by phone:', error);
    return [];
  }
};

/**
 * Search users by email
 */
export const searchUsersByEmail = async (emailQuery: string): Promise<SearchResult[]> => {
  try {
    console.log('🔍 Searching users by email:', emailQuery);
    
    const emailLower = emailQuery.toLowerCase().trim();
    if (emailLower.length < 3) {
      return [];
    }
    
    // Search for email prefix match
    const emailSearchQuery = query(
      collection(db, 'users'),
      orderBy('email'),
      startAt(emailLower),
      endAt(emailLower + '\uf8ff'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(emailSearchQuery);
    const results: SearchResult[] = [];
    
    querySnapshot.forEach(doc => {
      const userData = doc.data() as UserProfile;
      results.push({
        ...userData,
        matchType: 'email',
        matchText: userData.email
      });
    });
    
    console.log(`🔍 Found ${results.length} users by email`);
    return results;
  } catch (error) {
    console.error('Error searching users by email:', error);
    return [];
  }
};

/**
 * Search users by username
 */
export const searchUsersByUsername = async (usernameQuery: string): Promise<SearchResult[]> => {
  try {
    console.log('🔍 Searching users by username:', usernameQuery);
    
    const usernameLower = usernameQuery.toLowerCase().trim();
    if (usernameLower.length < 2) {
      return [];
    }
    
    // Search for username prefix match
    const usernameSearchQuery = query(
      collection(db, 'users'),
      orderBy('username'),
      startAt(usernameLower),
      endAt(usernameLower + '\uf8ff'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(usernameSearchQuery);
    const results: SearchResult[] = [];
    
    querySnapshot.forEach(doc => {
      const userData = doc.data() as UserProfile;
      results.push({
        ...userData,
        matchType: 'username',
        matchText: userData.username
      });
    });
    
    console.log(`🔍 Found ${results.length} users by username`);
    return results;
  } catch (error) {
    console.error('Error searching users by username:', error);
    return [];
  }
};

/**
 * Search users by name (firstName or lastName)
 */
export const searchUsersByName = async (nameQuery: string): Promise<SearchResult[]> => {
  try {
    console.log('🔍 Searching users by name:', nameQuery);
    
    const nameLower = nameQuery.toLowerCase().trim();
    if (nameLower.length < 2) {
      return [];
    }
    
    const results: SearchResult[] = [];
    
    // Search by firstName
    try {
      const firstNameQuery = query(
        collection(db, 'users'),
        orderBy('firstName'),
        startAt(nameLower),
        endAt(nameLower + '\uf8ff'),
        limit(5)
      );
      
      const firstNameSnapshot = await getDocs(firstNameQuery);
      firstNameSnapshot.forEach(doc => {
        const userData = doc.data() as UserProfile;
        results.push({
          ...userData,
          matchType: 'name',
          matchText: userData.firstName
        });
      });
    } catch (error) {
      console.log('FirstName search failed, might need index');
    }
    
    // Search by lastName
    try {
      const lastNameQuery = query(
        collection(db, 'users'),
        orderBy('lastName'),
        startAt(nameLower),
        endAt(nameLower + '\uf8ff'),
        limit(5)
      );
      
      const lastNameSnapshot = await getDocs(lastNameQuery);
      lastNameSnapshot.forEach(doc => {
        const userData = doc.data() as UserProfile;
        // Avoid duplicates
        if (!results.find(r => r.uid === userData.uid)) {
          results.push({
            ...userData,
            matchType: 'name',
            matchText: userData.lastName
          });
        }
      });
    } catch (error) {
      console.log('LastName search failed, might need index');
    }
    
    console.log(`🔍 Found ${results.length} users by name`);
    return results.slice(0, 10); // Limit total results
  } catch (error) {
    console.error('Error searching users by name:', error);
    return [];
  }
};

/**
 * Comprehensive user search across all fields
 */
export const searchUsers = async (searchQuery: string): Promise<SearchResult[]> => {
  try {
    const query = searchQuery.trim();
    if (query.length < 2) {
      return [];
    }
    
    console.log('🔍 Comprehensive user search:', query);
    
    // Determine search type based on query format
    const isEmail = query.includes('@');
    const isPhone = /^\+?[\d\s\-\(\)]+$/.test(query);
    const isUsername = query.startsWith('@') || /^[a-zA-Z0-9_]+$/.test(query);
    
    const allResults: SearchResult[] = [];
    
    // Search by different criteria based on query type
    if (isPhone) {
      const phoneResults = await searchUsersByPhone(query);
      allResults.push(...phoneResults);
    }
    
    if (isEmail) {
      const emailResults = await searchUsersByEmail(query);
      allResults.push(...emailResults);
    }
    
    if (isUsername) {
      const cleanUsername = query.startsWith('@') ? query.substring(1) : query;
      const usernameResults = await searchUsersByUsername(cleanUsername);
      allResults.push(...usernameResults);
    }
    
    // Always search by name unless it's clearly a phone/email
    if (!isPhone && !isEmail) {
      const nameResults = await searchUsersByName(query);
      allResults.push(...nameResults);
    }
    
    // Remove duplicates based on uid
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex(r => r.uid === result.uid)
    );
    
    console.log(`🔍 Total unique search results: ${uniqueResults.length}`);
    return uniqueResults.slice(0, 20); // Limit to 20 results
  } catch (error) {
    console.error('Error in comprehensive user search:', error);
    return [];
  }
};

/**
 * Debounced search function
 */
let searchTimeout: number | null = null;

export const debouncedSearchUsers = (
  searchQuery: string, 
  callback: (results: SearchResult[]) => void,
  delay: number = 300
): void => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(async () => {
    const results = await searchUsers(searchQuery);
    callback(results);
  }, delay);
};
