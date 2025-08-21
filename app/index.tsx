import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useThemeColor';
import { useAuth } from '@/providers/AuthProvider';

const LandingScreen: React.FC = () => {
  const theme = useTheme();
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (!initializing) {
      if (user) {
        console.log('User is authenticated, navigating to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('User is not authenticated, showing landing page');
      }
    }
  }, [user, initializing]);

  const handleLogin = () => {
    console.log('Navigating to login');
    router.push('/auth/login');
  };

  const handleSignUp = () => {
    console.log('Navigating to sign up');
    // TODO: Create sign up screen
    router.push('/auth/signup');
  };

  const handleGuestMode = () => {
    console.log('Entering guest mode');
    // TODO: Implement guest mode
    router.replace('/(tabs)');
  };

  if (initializing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar 
          barStyle={theme.text === '#FAF7F0' ? 'light-content' : 'dark-content'} 
          backgroundColor={theme.background}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={theme.text === '#FAF7F0' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background}
      />
      
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={[styles.logo, { color: theme.text }]}>فاضي؟</Text>
        <Text style={[styles.subtitle, { color: theme.text, opacity: 0.7 }]}>
          Connect when you're free
        </Text>
        <Text style={[styles.description, { color: theme.text, opacity: 0.6 }]}>
          Secure messaging with end-to-end encryption, biometric authentication, and real-time music sharing.
        </Text>
      </View>

      {/* Features Section */}
      <View style={styles.featuresContainer}>
        <View style={styles.feature}>
          <Feather name="shield" size={24} color={theme.primary} />
          <Text style={[styles.featureText, { color: theme.text }]}>
            End-to-end encryption
          </Text>
        </View>
        
        <View style={styles.feature}>
          <Feather name="user-check" size={24} color={theme.primary} />
          <Text style={[styles.featureText, { color: theme.text }]}>
            Biometric authentication
          </Text>
        </View>
        
        <View style={styles.feature}>
          <Feather name="music" size={24} color={theme.primary} />
          <Text style={[styles.featureText, { color: theme.text }]}>
            Real-time music sharing
          </Text>
        </View>
      </View>

      {/* Actions Section */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
          onPress={handleLogin}
        >
          <Text style={[styles.primaryButtonText, { color: theme.background }]}>
            Sign In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.secondaryButton, { borderColor: theme.primary }]}
          onPress={handleSignUp}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>
            Create Account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.guestButton}
          onPress={handleGuestMode}
        >
          <Text style={[styles.guestButtonText, { color: theme.accent }]}>
            Continue as Guest
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logo: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    paddingVertical: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
  actionsContainer: {
    paddingBottom: 40,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  guestButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LandingScreen;
