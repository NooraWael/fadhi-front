import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useTheme } from '@/hooks/useThemeColor';
import { signIn } from '@/services/auth';
import { useAuth } from '@/providers/AuthProvider';

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const theme = useTheme();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Determine which assets to use based on theme
  const isDarkMode = theme.text === '#FAF7F0'; // Assuming this indicates dark mode
  
  const backgroundImage = isDarkMode 
    ? require('@/assets/images/background-dark.png') // Your dark background
    : require('@/assets/images/background-light.png'); // Your light background
    
  const logoImage = isDarkMode 
    ? require('@/assets/images/logo-dark.png') // Your dark mode logo
    : require('@/assets/images/logo-light.png'); // Your light mode logo

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (): Promise<void> => {
    // Input validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      // Sign in with Firebase
      await signIn(email.trim(), password);
      
      // Navigation will be handled by auth state change in AuthProvider
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async (): Promise<void> => {
    try {
      // TODO: Implement biometric authentication
      Alert.alert('Biometric Login', 'Biometric authentication will be implemented here');
    } catch (error) {
      console.error('Biometric login error:', error);
      Alert.alert('Biometric Login Failed', 'Please try again or use email/password');
    }
  };

  const handleSignUp = (): void => {
    router.push('/auth/signup');
  };

  const handleBack = (): void => {
    router.replace('/');
  };

  return (
    <ImageBackground 
      source={backgroundImage} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          backgroundColor="transparent"
          translucent
        />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header with Back Button */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={[styles.backButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}
                onPress={handleBack}
              >
                <Feather name="arrow-left" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <Image 
                source={logoImage} 
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={[styles.subtitle, { color: theme.text, opacity: 0.8 }]}>
                Connect when you're free
              </Text>
            </View>

            {/* Form Section with Glass Effect */}
            <View style={[styles.formContainer, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.85)' }]}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper, 
                  { 
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                  }
                ]}>
                  <Feather name="mail" size={20} color={theme.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    placeholder="Email"
                    placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper, 
                  { 
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                  }
                ]}>
                  <Feather name="lock" size={20} color={theme.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    placeholder="Password"
                    placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    editable={!isLoading}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                    disabled={isLoading}
                  >
                    <Feather 
                      name={showPassword ? 'eye-off' : 'eye'} 
                      size={20} 
                      color={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity 
                style={[
                  styles.loginButton, 
                  { 
                    backgroundColor: isDarkMode ? '#8B4513' : '#D2691E', // Complementary brown colors
                    shadowColor: isDarkMode ? '#8B4513' : '#D2691E',
                  },
                  isLoading && { opacity: 0.6 }
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={[styles.loginButtonText, { color: '#FFFFFF' }]}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              {/* Biometric Login */}
              <TouchableOpacity 
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                disabled={isLoading}
              >
                <Feather 
                  name="user-check" 
                  size={24} 
                  color={isDarkMode ? '#DAA520' : '#B8860B'} 
                />
                <Text style={[
                  styles.biometricText, 
                  { color: isDarkMode ? '#DAA520' : '#B8860B' }
                ]}>
                  Use Biometric
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.text, opacity: 0.8 }]}>
                Don't have an account? 
              </Text>
              <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
                <Text style={[
                  styles.footerLink, 
                  { color: isDarkMode ? '#DAA520' : '#B8860B' }
                ]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: width * 0.6, // 60% of screen width
    height: width * 0.3, // Maintain aspect ratio
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  formContainer: {
    marginHorizontal: 8,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  passwordToggle: {
    padding: 4,
  },
  loginButton: {
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 12,
  },
  biometricText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
