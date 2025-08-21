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
import { signUp, checkUsernameAvailability } from '@/services/auth';
import { useAuth } from '@/providers/AuthProvider';

const { width, height } = Dimensions.get('window');

const SignUpScreen: React.FC = () => {
  const theme = useTheme();
  
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);

  // Determine which assets to use based on theme
  const isDarkMode = theme.text === '#FAF7F0';
  
  const backgroundImage = isDarkMode 
    ? require('@/assets/images/background-dark.png')
    : require('@/assets/images/background-light.png');
    
  const logoImage = isDarkMode 
    ? require('@/assets/images/logo-dark.png')
    : require('@/assets/images/logo-light.png');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const handleSignUp = async (): Promise<void> => {
    // Input validation
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!validateUsername(username.trim())) {
      Alert.alert('Error', 'Username must be 3-20 characters long and contain only letters, numbers, and underscores');
      return;
    }

    if (!validatePhone(phone.trim())) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);
    
    try {
      // Check username availability first
      const isUsernameAvailable = await checkUsernameAvailability(username.trim());
      if (!isUsernameAvailable) {
        Alert.alert('Error', 'Username is already taken. Please choose a different one.');
        setIsLoading(false);
        return;
      }

      // Create account with Firebase
      await signUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password,
      });
      
      // Navigation will be handled by auth state change in AuthProvider
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert('Sign Up Failed', error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async (): Promise<void> => {
    // TODO: Implement Google sign up
    Alert.alert('Google Sign Up', 'Google sign up will be implemented here');
  };

  const handleBackToLogin = (): void => {
    router.back();
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
                onPress={handleBackToLogin}
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
                Join our community
              </Text>
            </View>

            {/* Form Section with Glass Effect */}
            <View style={[styles.formContainer, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.85)' }]}>
              
              {/* Name Fields Row */}
              <View style={styles.nameRow}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <View style={[
                    styles.inputWrapper, 
                    { 
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                    }
                  ]}>
                    <Feather name="user" size={20} color={theme.text} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { color: theme.text }]}
                      placeholder="First Name"
                      placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'}
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <View style={[
                    styles.inputWrapper, 
                    { 
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                    }
                  ]}>
                    <TextInput
                      style={[styles.textInput, { color: theme.text }]}
                      placeholder="Last Name"
                      placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'}
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                  </View>
                </View>
              </View>

              {/* Username Input */}
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper, 
                  { 
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                  }
                ]}>
                  <Feather name="at-sign" size={20} color={theme.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    placeholder="Username"
                    placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
              </View>

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

              {/* Phone Input */}
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper, 
                  { 
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                  }
                ]}>
                  <Feather name="phone" size={20} color={theme.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    placeholder="Phone Number"
                    placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
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
                    autoComplete="new-password"
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

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper, 
                  { 
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                  }
                ]}>
                  <Feather name="shield" size={20} color={theme.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: theme.text }]}
                    placeholder="Confirm Password"
                    placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="new-password"
                    editable={!isLoading}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.passwordToggle}
                    disabled={isLoading}
                  >
                    <Feather 
                      name={showConfirmPassword ? 'eye-off' : 'eye'} 
                      size={20} 
                      color={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms and Conditions */}
              <TouchableOpacity 
                style={styles.termsContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                disabled={isLoading}
              >
                <View style={[
                  styles.checkbox,
                  { 
                    backgroundColor: agreeToTerms 
                      ? (isDarkMode ? '#DAA520' : '#B8860B') 
                      : 'transparent',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                  }
                ]}>
                  {agreeToTerms && (
                    <Feather name="check" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.termsText, { color: theme.text, opacity: 0.8 }]}>
                  I agree to the{' '}
                  <Text style={[styles.termsLink, { color: isDarkMode ? '#DAA520' : '#B8860B' }]}>
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text style={[styles.termsLink, { color: isDarkMode ? '#DAA520' : '#B8860B' }]}>
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Sign Up Button */}
              <TouchableOpacity 
                style={[
                  styles.signUpButton, 
                  { 
                    backgroundColor: isDarkMode ? '#8B4513' : '#D2691E',
                    shadowColor: isDarkMode ? '#8B4513' : '#D2691E',
                  },
                  (isLoading || !agreeToTerms) && { opacity: 0.6 }
                ]}
                onPress={handleSignUp}
                disabled={isLoading || !agreeToTerms}
              >
                <Text style={[styles.signUpButtonText, { color: '#FFFFFF' }]}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }]} />
                <Text style={[styles.dividerText, { color: theme.text, opacity: 0.6 }]}>or</Text>
                <View style={[styles.dividerLine, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' }]} />
              </View>

              {/* Google Sign Up */}
              <TouchableOpacity 
                style={[
                  styles.googleButton,
                  { 
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                  }
                ]}
                onPress={handleGoogleSignUp}
                disabled={isLoading}
              >
                <Feather name="globe" size={20} color={theme.text} />
                <Text style={[styles.googleButtonText, { color: theme.text }]}>
                  Continue with Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.text, opacity: 0.8 }]}>
                Already have an account? 
              </Text>
              <TouchableOpacity onPress={handleBackToLogin} disabled={isLoading}>
                <Text style={[
                  styles.footerLink, 
                  { color: isDarkMode ? '#DAA520' : '#B8860B' }
                ]}>
                  Sign In
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
    marginBottom: 30,
  },
  logoImage: {
    width: width * 0.5,
    height: width * 0.25,
    marginBottom: 12,
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
    paddingVertical: 28,
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
  nameRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  signUpButton: {
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
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

export default SignUpScreen;
