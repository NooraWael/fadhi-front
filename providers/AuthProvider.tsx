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

  const refreshProfile = async (retryCount = 0) => {
    if (user) {
      try {
        console.log('🔍 Fetching profile for user:', user.uid, retryCount > 0 ? `(retry ${retryCount})` : '');
        const profile = await getUserProfile(user.uid);
        console.log('🔍 Profile fetched successfully:', profile ? 'Found' : 'Not found');
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        
        // Retry up to 2 times with delay
        if (retryCount < 2) {
          console.log('🔄 Retrying profile fetch in 1 second...');
          setTimeout(() => refreshProfile(retryCount + 1), 1000);
        } else {
          console.error('❌ Failed to fetch profile after retries');
          setUserProfile(null);
        }
      }
    } else {
      console.log('🔍 No user, clearing profile');
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      console.log('🔍 Auth state changed, user:', u?.uid || 'null');
      setUser(u);
      
      if (u) {
        // Fetch user profile when user is authenticated
        try {
          console.log('🔍 Fetching profile in useEffect for user:', u.uid);
          const profile = await getUserProfile(u.uid);
          console.log('🔍 Profile fetched in useEffect:', profile);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
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
