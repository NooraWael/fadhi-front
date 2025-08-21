import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/configs/firebase';
import { getUserProfile, UserProfile } from '@/services/auth';

type AuthCtx = {
  user: User | null;
  userProfile: UserProfile | null;
  initializing: boolean;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ 
  user: null, 
  userProfile: null, 
  initializing: true,
  refreshProfile: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const refreshProfile = async (retryCount = 0) => {
    if (user) {
      setProfileLoading(true);
      try {
        console.log('🔍 Fetching profile for user:', user.uid, retryCount > 0 ? `(retry ${retryCount})` : '');
        const profile = await getUserProfile(user.uid);
        console.log('🔍 Profile fetched successfully:', profile ? 'Found' : 'Not found');
        console.log('🔍 Profile data:', profile);
        setUserProfile(profile);
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        
        // Retry up to 2 times with delay
        if (retryCount < 2) {
          console.log('🔄 Retrying profile fetch in 1 second...');
          setTimeout(() => refreshProfile(retryCount + 1), 1000);
        } else {
          console.error('❌ Failed to fetch profile after retries');
          setUserProfile(null);
        }
      } finally {
        setProfileLoading(false);
      }
    } else {
      console.log('🔍 No user, clearing profile');
      setUserProfile(null);
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 Setting up auth state listener...');
    
    const unsub = onAuthStateChanged(auth, async (u) => {
      console.log('🔍 Auth state changed, user:', u?.uid || 'null');
      console.log('🔍 User email:', u?.email || 'null');
      console.log('🔍 User emailVerified:', u?.emailVerified || false);
      console.log('🔍 Auth persistence state: React Native default');
      
      setUser(u);
      
      if (u) {
        // Fetch user profile when user is authenticated
        setProfileLoading(true);
        try {
          console.log('🔍 Fetching profile in useEffect for user:', u.uid);
          
          // Add a small delay to ensure Firestore is ready
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const profile = await getUserProfile(u.uid);
          console.log('🔍 Profile fetched in useEffect:', profile ? 'Found' : 'Not found');
          
          if (profile) {
            // Validate that the profile has essential data
            const isValidProfile = profile.uid && profile.email && profile.firstName;
            console.log('🔍 Profile validation:', isValidProfile ? 'Valid' : 'Invalid/Incomplete');
            
            if (isValidProfile) {
              console.log('🔍 Profile details:', {
                uid: profile.uid,
                email: profile.email,
                firstName: profile.firstName,
                lastName: profile.lastName,
                username: profile.username,
                hasProfilePicture: !!profile.profilePicture,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt
              });
              setUserProfile(profile);
            } else {
              console.log('⚠️ Profile is incomplete, retrying in 1 second...');
              // If profile is incomplete, retry after a short delay
              setTimeout(async () => {
                try {
                  const retryProfile = await getUserProfile(u.uid);
                  console.log('🔄 Retry profile fetch result:', retryProfile ? 'Found' : 'Not found');
                  setUserProfile(retryProfile);
                } catch (retryError) {
                  console.error('❌ Retry profile fetch failed:', retryError);
                  setUserProfile(profile); // Use the incomplete profile as fallback
                }
              }, 1000);
            }
          } else {
            console.log('⚠️ Profile is null - user may not have completed profile setup');
            setUserProfile(null);
          }
        } catch (error: any) {
          console.error('❌ Error fetching user profile in useEffect:', error);
          console.error('❌ Error details:', {
            message: error?.message || 'Unknown error',
            code: error?.code || 'unknown',
            stack: error?.stack || 'No stack trace'
          });
          setUserProfile(null);
        } finally {
          setProfileLoading(false);
        }
      } else {
        console.log('🔍 No user, clearing profile');
        setUserProfile(null);
        setProfileLoading(false);
      }
      
      // Only set initializing to false after we've attempted to load the profile
      console.log('🔍 Auth initialization complete, initializing set to false');
      setInitializing(false);
    });
    
    return unsub;
  }, []);

  return (
    <Ctx.Provider value={{ user, userProfile, initializing, refreshProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
