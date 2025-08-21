import React, { useState, useEffect } from 'react';
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
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '@/hooks/useThemeColor';
import { useAuth } from '@/providers/AuthProvider';
import { updateUserProfile, checkUsernameAvailability } from '@/services/auth';
import { uploadProfilePicture } from '@/services/imageUpload';

const { width, height } = Dimensions.get('window');

interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
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
  const { user, userProfile, refreshProfile } = useAuth();
  
  // Debug logging
  console.log('🔍 EditProfilePage - user:', user?.uid);
  console.log('🔍 EditProfilePage - userProfile:', userProfile);
  
  // Form states - initialize with empty values, will be populated from Firebase
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  // Original values for comparison
  const [originalValues, setOriginalValues] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    phoneNumber: '',
    email: '',
    profilePicture: '',
  });

  // Load user data when component mounts
  useEffect(() => {
    if (userProfile && user) {
      const values = {
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        username: userProfile.username || '',
        bio: userProfile.bio || "Hey there! I'm new to فاضي ✨",
        phoneNumber: userProfile.phone || '',
        email: userProfile.email || user.email || '',
        profilePicture: userProfile.profilePicture || '',
      };
      
      setFirstName(values.firstName);
      setLastName(values.lastName);
      setUsername(values.username);
      setBio(values.bio);
      setPhoneNumber(values.phoneNumber);
      setEmail(values.email);
      setProfilePicture(values.profilePicture);
      setOriginalValues(values);
    }
  }, [userProfile, user]);

  // Background image based on theme
  const backgroundImage = isDarkMode 
    ? require('@/assets/images/background-dark.png')
    : require('@/assets/images/background-light.png');

  // Check if there are any changes
  React.useEffect(() => {
    const changes = 
      firstName !== originalValues.firstName ||
      lastName !== originalValues.lastName ||
      username !== originalValues.username ||
      bio !== originalValues.bio ||
      phoneNumber !== originalValues.phoneNumber ||
      email !== originalValues.email ||
      profilePicture !== originalValues.profilePicture;
    
    setHasChanges(changes);
  }, [firstName, lastName, username, bio, phoneNumber, email, profilePicture, originalValues]);

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
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Remove Photo', style: 'destructive', onPress: () => setProfilePicture('') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    try {
      // Request camera permissions
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraPermission.status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openGallery = async () => {
    try {
      // Request media library permissions
      const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (galleryPermission.status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery permission is required to select photos.');
        return;
      }

      // Launch gallery
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
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
    
    try {
      // Check username availability if it changed
      if (username !== originalValues.username) {
        const isAvailable = await checkUsernameAvailability(username);
        if (!isAvailable) {
          Alert.alert('Error', 'Username is already taken');
          setIsLoading(false);
          return;
        }
      }

      let finalProfilePictureURL = profilePicture;
      let profilePicturePath = userProfile?.profilePicturePath;

      // Handle profile picture upload if it's a local URI (starts with file://)
      if (profilePicture && profilePicture.startsWith('file://') && user?.uid) {
        console.log('🔍 Uploading new profile picture...');
        try {
          const uploadResult = await uploadProfilePicture(
            profilePicture,
            user.uid,
            userProfile?.profilePicturePath || undefined
          );
          finalProfilePictureURL = uploadResult.downloadURL;
          profilePicturePath = uploadResult.path;
          console.log('🔍 Profile picture uploaded successfully:', finalProfilePictureURL);
        } catch (uploadError) {
          console.error('Profile picture upload failed:', uploadError);
          Alert.alert('Upload Failed', 'Failed to upload profile picture. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      // Update profile in Firebase
      if (user?.uid) {
        const updateData: any = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.toLowerCase().trim(),
          phone: phoneNumber.trim(),
          email: email.trim(),
          bio: bio.trim(),
          profilePicture: finalProfilePictureURL || null,
        };

        // Only update profilePicturePath if we uploaded a new image
        if (profilePicture && profilePicture.startsWith('file://')) {
          updateData.profilePicturePath = profilePicturePath;
        }

        await updateUserProfile(user.uid, updateData);

        // Refresh profile data
        await refreshProfile();

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
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Update Failed', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
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
              'First Name',
              firstName,
              setFirstName,
              'Enter your first name',
              false,
              30
            )}

            {renderInputField(
              'Last Name',
              lastName,
              setLastName,
              'Enter your last name',
              false,
              30
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
              <Text style={[styles.infoValue, { color: theme.text }]}>{user?.uid || 'N/A'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.text, opacity: 0.7 }]}>Member since:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {userProfile?.createdAt ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
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
