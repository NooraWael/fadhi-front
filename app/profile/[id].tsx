import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  ImageBackground,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useTheme } from '@/hooks/useThemeColor';

const { width, height } = Dimensions.get('window');

interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  profilePicture: string;
  bio: string;
  phoneNumber: string;
  email: string;
  joinDate: Date;
  isOnline: boolean;
}

const EditProfilePage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.text === '#FAF7F0';
  
  // Mock current user profile data
  const [originalProfile] = useState<UserProfile>({
    id: 'user1',
    username: 'you_username',
    fullName: 'Your Name',
    profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    bio: 'Love music, coffee, and good conversations ✨',
    phoneNumber: '+973 9876 5432',
    email: 'you@example.com',
    joinDate: new Date('2024-01-15'),
    isOnline: true,
  });

  // Form states
  const [fullName, setFullName] = useState(originalProfile.fullName);
  const [username, setUsername] = useState(originalProfile.username);
  const [bio, setBio] = useState(originalProfile.bio);
  const [phoneNumber, setPhoneNumber] = useState(originalProfile.phoneNumber);
  const [email, setEmail] = useState(originalProfile.email);
  const [profilePicture, setProfilePicture] = useState(originalProfile.profilePicture);
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Background image based on theme
  const backgroundImage = isDarkMode 
    ? require('@/assets/images/background-dark.png')
    : require('@/assets/images/background-light.png');

  // Check if there are any changes
  React.useEffect(() => {
    const changes = 
      fullName !== originalProfile.fullName ||
      username !== originalProfile.username ||
      bio !== originalProfile.bio ||
      phoneNumber !== originalProfile.phoneNumber ||
      email !== originalProfile.email ||
      profilePicture !== originalProfile.profilePicture;
    
    setHasChanges(changes);
  }, [fullName, username, bio, phoneNumber, email, profilePicture]);

  const handleGoBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Stay', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => router.back()
          }
        ]
      );
    } else {
      router.back();
    }
  };

  const handleChangeProfilePicture = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => console.log('Camera selected') },
        { text: 'Gallery', onPress: () => console.log('Gallery selected') },
        { text: 'Remove Photo', style: 'destructive', onPress: () => setProfilePicture('') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => router.back()
          }
        ]
      );
    }, 1500);
  };

  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    multiline: boolean = false,
    maxLength?: number,
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric'
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: theme.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.textInputMultiline,
          { 
            color: theme.text,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
        multiline={multiline}
        maxLength={maxLength}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        autoCorrect={keyboardType !== 'email-address'}
      />
      {maxLength && (
        <Text style={[styles.characterCount, { color: theme.text, opacity: 0.5 }]}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );

  return (
    <ImageBackground source={backgroundImage} style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent
      />
      
      {/* Header */}
      <View style={[
        styles.headerExtended,
        { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)' }
      ]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleGoBack}
            >
              <Feather name="arrow-left" size={24} color={theme.text} />
            </TouchableOpacity>
            
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Edit Profile
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.saveButton,
                { 
                  backgroundColor: hasChanges 
                    ? (isDarkMode ? '#8B4513' : '#D2691E') 
                    : 'transparent'
                }
              ]}
              onPress={handleSaveProfile}
              disabled={!hasChanges || isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingIndicator}>
                  <Text style={[styles.saveButtonText, { color: '#FFFFFF' }]}>•••</Text>
                </View>
              ) : (
                <Text style={[
                  styles.saveButtonText, 
                  { color: hasChanges ? '#FFFFFF' : (isDarkMode ? '#8B4513' : '#D2691E') }
                ]}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Picture Section */}
          <View style={[
            styles.profilePictureSection,
            { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)' }
          ]}>
            <TouchableOpacity 
              style={styles.profileImageContainer}
              onPress={handleChangeProfilePicture}
            >
              {profilePicture ? (
                <Image source={{ uri: profilePicture }} style={styles.profileImage} />
              ) : (
                <View style={[styles.placeholderImage, { backgroundColor: isDarkMode ? '#444' : '#E0E0E0' }]}>
                  <Feather name="user" size={40} color={theme.text} style={{ opacity: 0.5 }} />
                </View>
              )}
              <View style={styles.profileImageOverlay}>
                <Feather name="camera" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <Text style={[styles.changePhotoText, { color: theme.text, opacity: 0.7 }]}>
              Tap to change profile photo
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {renderInputField(
              'Full Name',
              fullName,
              setFullName,
              'Enter your full name',
              false,
              50
            )}

            {renderInputField(
              'Username',
              username,
              setUsername,
              'Choose a username',
              false,
              30
            )}

            {renderInputField(
              'Bio',
              bio,
              setBio,
              'Tell us about yourself...',
              true,
              150
            )}

            {renderInputField(
              'Phone Number',
              phoneNumber,
              setPhoneNumber,
              '+973 XXXX XXXX',
              false,
              20,
              'phone-pad'
            )}

            {renderInputField(
              'Email',
              email,
              setEmail,
              'your.email@example.com',
              false,
              100,
              'email-address'
            )}
          </View>

          {/* Account Info */}
          <View style={[
            styles.accountInfoSection,
            { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)' }
          ]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Account Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.text, opacity: 0.7 }]}>User ID:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{originalProfile.id}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.text, opacity: 0.7 }]}>Member since:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {originalProfile.joinDate.toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Privacy Notice */}
          <View style={[
            styles.privacySection,
            { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)' }
          ]}>
            <View style={styles.privacyHeader}>
              <Feather name="shield" size={16} color={isDarkMode ? '#DAA520' : '#B8860B'} />
              <Text style={[styles.privacyTitle, { color: theme.text }]}>Privacy</Text>
            </View>
            <Text style={[styles.privacyText, { color: theme.text, opacity: 0.7 }]}>
              Your profile information is only visible to your contacts. We never share your personal data with third parties.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerExtended: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profilePictureSection: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: 14,
    textAlign: 'center',
  },
  formContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
    marginRight: 4,
  },
  accountInfoSection: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
  },
  privacySection: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default EditProfilePage;