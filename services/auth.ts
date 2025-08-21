import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  collection, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '@/configs/firebase';
import { UserSettings } from './settings';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  bio: string;
  profilePicture: string | null;
  profilePicturePath?: string | null; // Storage path for deletion
  settings?: UserSettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isOnline: boolean;
  lastSeen: Timestamp;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

// Check if username is available
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const usernameQuery = query(
      collection(db, 'users'),
      where('username', '==', username.toLowerCase())
    );
    const querySnapshot = await getDocs(usernameQuery);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw new Error('Failed to check username availability');
  }
};

// Create user profile in Firestore
export const createUserProfile = async (user: User, additionalData: Omit<SignUpData, 'email' | 'password'>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      const defaultSettings: UserSettings = {
        readReceipts: true,
        lastSeen: true,
        biometricAuth: true,
        secretChatNotifications: true,
        notifications: true,
        autoDownloadMedia: false,
        spotifyIntegration: true,
      };

      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        firstName: additionalData.firstName,
        lastName: additionalData.lastName,
        username: additionalData.username.toLowerCase(),
        phone: additionalData.phone,
        bio: "Hey there! I'm new to فاضي ✨",
        profilePicture: null,
        settings: defaultSettings,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        isOnline: true,
        lastSeen: serverTimestamp() as Timestamp,
      };

      await setDoc(userRef, userProfile);
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
};

// Sign up with email and password
export const signUp = async (userData: SignUpData): Promise<User> => {
  try {
    // Check if username is available
    const isUsernameAvailable = await checkUsernameAvailability(userData.username);
    if (!isUsernameAvailable) {
      throw new Error('Username is already taken');
    }

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );

    // Create user profile in Firestore
    await createUserProfile(userCredential.user, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      phone: userData.phone,
    });

    return userCredential.user;
  } catch (error: any) {
    console.error('Sign up error:', error);
    
    // Handle Firebase auth errors
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('This email is already registered');
      case 'auth/invalid-email':
        throw new Error('Invalid email address');
      case 'auth/weak-password':
        throw new Error('Password should be at least 6 characters');
      default:
        throw new Error(error.message || 'Failed to create account');
    }
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update user's online status
    const userRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userRef, {
      isOnline: true,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return userCredential.user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    // Handle Firebase auth errors
    switch (error.code) {
      case 'auth/user-not-found':
        throw new Error('No account found with this email');
      case 'auth/wrong-password':
        throw new Error('Incorrect password');
      case 'auth/invalid-email':
        throw new Error('Invalid email address');
      case 'auth/user-disabled':
        throw new Error('This account has been disabled');
      case 'auth/too-many-requests':
        throw new Error('Too many failed attempts. Please try again later');
      default:
        throw new Error(error.message || 'Failed to sign in');
    }
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    console.log('🔴 SignOut function called');
    // Update user's online status before signing out
    if (auth.currentUser) {
      console.log('🔴 Updating user online status to false');
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      console.log('🔴 User status updated successfully');
    }

    console.log('🔴 Calling Firebase signOut');
    await firebaseSignOut(auth);
    console.log('🔴 Firebase signOut completed successfully');
  } catch (error) {
    console.error('🔴 Sign out error:', error);
    throw new Error('Failed to sign out');
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    
    switch (error.code) {
      case 'auth/user-not-found':
        throw new Error('No account found with this email');
      case 'auth/invalid-email':
        throw new Error('Invalid email address');
      default:
        throw new Error('Failed to send password reset email');
    }
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    console.log('🔍 getUserProfile called for uid:', uid);
    const userRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userRef);
    
    console.log('🔍 Document exists:', userSnapshot.exists());
    
    if (userSnapshot.exists()) {
      const data = userSnapshot.data();
      console.log('🔍 Raw document data:', data);
      
      // Convert the data to UserProfile format
      const userProfile = data as UserProfile;
      console.log('🔍 Converted UserProfile:', userProfile);
      
      return userProfile;
    }
    
    console.log('🔍 No document found for uid:', uid);
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to get user profile');
  }
};

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
};
