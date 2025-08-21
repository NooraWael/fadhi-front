import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  ImageBackground,
  Switch,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '@/hooks/useThemeColor';
import { useAuth } from '@/providers/AuthProvider';
import { signOut, updateUserProfile } from '@/services/auth';
import { uploadProfilePicture } from '@/services/imageUpload';
import { 
  UserSettings, 
  DeviceSettings, 
  updateUserSetting, 
  updateDeviceSetting, 
  subscribeToUserSettings, 
  loadDeviceSettings,
  initializeUserSettings 
} from '@/services/settings';

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
  currentSong?: {
    title: string;
    artist: string;
    albumCover: string;
    isPlaying: boolean;
  };
}

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.text === '#FAF7F0';
  const { user, userProfile, refreshProfile } = useAuth();
  
  // Debug logging
  console.log('🔍 ProfilePage - user:', user?.uid);
  console.log('🔍 ProfilePage - userProfile:', userProfile);
  
  // Separate user settings (Firestore) and device settings (local storage)
  const [userSettings, setUserSettings] = useState<UserSettings>({
    readReceipts: true,
    lastSeen: true,
    biometricAuth: true,
    secretChatNotifications: true,
    notifications: true,
    autoDownloadMedia: false,
    spotifyIntegration: true,
  });

  const [deviceSettings, setDeviceSettings] = useState<DeviceSettings>({
    darkMode: isDarkMode,
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Create display profile from Firebase data
  const displayProfile: UserProfile = {
    id: user?.uid || 'unknown',
    username: userProfile?.username || 'Loading...',
    fullName: userProfile ? `${userProfile.firstName} ${userProfile.lastName}`.trim() : 'Loading...',
    profilePicture: userProfile?.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    bio: userProfile?.bio || "Hey there! I'm new to فاضي ✨",
    phoneNumber: userProfile?.phone || '+973 0000 0000',
    email: userProfile?.email || user?.email || 'you@example.com',
    joinDate: userProfile?.createdAt ? (
      typeof userProfile.createdAt.toDate === 'function' 
        ? userProfile.createdAt.toDate() 
        : new Date(userProfile.createdAt.seconds * 1000)
    ) : new Date(),
    isOnline: userProfile?.isOnline || false,
    currentSong: {
      title: 'Umm Kulthum - Alf Leila wa Leila',
      artist: 'Umm Kulthum',
      albumCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
      isPlaying: true,
    }
  };

  // Load settings on component mount
  useEffect(() => {
    let unsubscribeUserSettings: (() => void) | null = null;

    const initializeSettings = async () => {
      try {
        // Load device settings from local storage
        const loadedDeviceSettings = await loadDeviceSettings();
        setDeviceSettings(loadedDeviceSettings);

        // Initialize and subscribe to user settings from Firestore
        if (user?.uid) {
          // First, ensure user has settings initialized
          await initializeUserSettings(user.uid);
          
          // Then subscribe to settings changes
          unsubscribeUserSettings = subscribeToUserSettings(user.uid, (settings) => {
            setUserSettings(settings);
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    initializeSettings();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeUserSettings) {
        unsubscribeUserSettings();
      }
    };
  }, [user?.uid]);

  // Background image based on theme
  const backgroundImage = isDarkMode 
    ? require('@/assets/images/background-dark.png')
    : require('@/assets/images/background-light.png');

  const handleEditProfile = () => {
   // Alert.alert('Edit Profile', 'Profile editing will be implemented here');
    router.push(`/profile/${displayProfile.id}`);
  };

  const handleChangeProfilePicture = async () => {
    if (isUploadingImage) return; // Prevent multiple uploads

    try {
      // Request permissions
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Camera and photo library permissions are required to change your profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Profile Picture',
        'Choose an option',
        [
          { 
            text: 'Camera', 
            onPress: () => pickImageFromCamera() 
          },
          { 
            text: 'Gallery', 
            onPress: () => pickImageFromGallery() 
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image from camera:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const uploadImage = async (imageUri: string) => {
    if (!user?.uid) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsUploadingImage(true);

    try {
      console.log('🔄 Uploading profile picture...');
      console.log('🔍 Current userProfile.profilePicturePath:', userProfile?.profilePicturePath);
      
      // Upload image to Firebase Storage and get the actual storage path
      const uploadResult = await uploadProfilePicture(
        imageUri,
        user.uid,
        userProfile?.profilePicturePath || undefined
      );

      console.log('✅ Profile picture uploaded:', uploadResult.downloadURL);
      console.log('✅ Storage path:', uploadResult.path);

      // Update user profile in Firestore with the correct path
      await updateUserProfile(user.uid, {
        profilePicture: uploadResult.downloadURL,
        profilePicturePath: uploadResult.path
      });

      console.log('✅ Profile updated in Firestore');
      
      // Refresh the profile data to update the UI
      await refreshProfile();
      console.log('✅ Profile refreshed in UI');
      
      Alert.alert('Success', 'Profile picture updated successfully!');

    } catch (error: any) {
      console.error('❌ Error uploading profile picture:', error);
      Alert.alert(
        'Upload Failed', 
        error.message || 'Failed to upload profile picture. Please try again.'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle user setting changes (auto-save to Firestore)
  const handleUserSettingChange = async (key: keyof UserSettings, value: boolean) => {
    if (!user?.uid) return;
    
    try {
      // Update local state immediately for responsive UI
      setUserSettings(prev => ({ ...prev, [key]: value }));
      
      // Auto-save to Firestore
      await updateUserSetting(user.uid, key, value);
    } catch (error) {
      console.error(`Error updating ${key} setting:`, error);
      // Revert local state on error
      setUserSettings(prev => ({ ...prev, [key]: !value }));
      Alert.alert('Settings Error', `Failed to update ${key} setting`);
    }
  };

  // Handle device setting changes (save to local storage)
  const handleDeviceSettingChange = async (key: keyof DeviceSettings, value: boolean) => {
    try {
      // Update local state immediately for responsive UI
      setDeviceSettings(prev => ({ ...prev, [key]: value }));
      
      // Auto-save to device storage
      await updateDeviceSetting(key, value);
    } catch (error) {
      console.error(`Error updating device ${key} setting:`, error);
      // Revert local state on error
      setDeviceSettings(prev => ({ ...prev, [key]: !value }));
      Alert.alert('Settings Error', `Failed to update ${key} setting`);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Navigate directly to login screen
              router.replace('/auth/login');
            } catch (error: any) {
              console.error('Logout error:', error);
              Alert.alert('Logout Failed', error.message || 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted');
          }
        }
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    icon: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={[
      styles.settingItem,
      { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)' }
    ]}>
      <View style={styles.settingContent}>
        <Feather name={icon as any} size={20} color={theme.text} style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.settingSubtitle, { color: theme.text, opacity: 0.6 }]}>{subtitle}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ 
            false: isDarkMode ? '#767577' : '#E8E8E8', 
            true: isDarkMode ? '#8B4513' : '#D2691E' 
          }}
          thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
        />
      </View>
    </View>
  );

  const renderActionItem = (
    title: string,
    subtitle: string,
    icon: string,
    onPress: () => void,
    isDestructive: boolean = false
  ) => (
    <TouchableOpacity 
      style={[
        styles.actionItem,
        { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)' }
      ]}
      onPress={onPress}
    >
      <View style={styles.actionContent}>
        <Feather 
          name={icon as any} 
          size={20} 
          color={isDestructive ? '#FF6B6B' : theme.text} 
          style={styles.actionIcon} 
        />
        <View style={styles.actionText}>
          <Text style={[
            styles.actionTitle, 
            { color: isDestructive ? '#FF6B6B' : theme.text }
          ]}>
            {title}
          </Text>
          <Text style={[styles.actionSubtitle, { color: theme.text, opacity: 0.6 }]}>
            {subtitle}
          </Text>
        </View>
        <Feather 
          name="chevron-right" 
          size={16} 
          color={theme.text} 
          style={{ opacity: 0.6 }} 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={backgroundImage} style={styles.container}>
        
       
         <View style={[
      styles.headerExtended,
      { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)' }
    ]}>
      <SafeAreaView>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Profile
          </Text>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Feather name="edit-2" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>


        </View>
   
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          backgroundColor="transparent"
          translucent
        />
        
     

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Section */}
          <View style={[
            styles.profileSection,
            { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)' }
          ]}>
            <TouchableOpacity 
              style={styles.profileImageContainer}
              onPress={handleChangeProfilePicture}
              disabled={isUploadingImage}
            >
              <Image source={{ uri: displayProfile.profilePicture }} style={styles.profileImage} />
              <View style={styles.profileImageOverlay}>
                {isUploadingImage ? (
                  <MaterialIcons name="hourglass-empty" size={20} color="#FFFFFF" />
                ) : (
                  <Feather name="camera" size={20} color="#FFFFFF" />
                )}
              </View>
              {displayProfile.isOnline && <View style={styles.onlineIndicator} />}
            </TouchableOpacity>
            
            <View style={styles.profileInfo}>
              <Text style={[styles.fullName, { color: theme.text }]}>
                {displayProfile.fullName}
              </Text>
              <Text style={[styles.username, { color: theme.text, opacity: 0.7 }]}>
                @{displayProfile.username}
              </Text>
              <Text style={[styles.bio, { color: theme.text, opacity: 0.8 }]}>
                {displayProfile.bio}
              </Text>
              
              {displayProfile.currentSong && (
                <View style={styles.musicStatus}>
                  <Image source={{ uri: displayProfile.currentSong.albumCover }} style={styles.albumCover} />
                  <View style={styles.musicInfo}>
                    <Text style={[styles.musicTitle, { color: theme.text }]} numberOfLines={1}>
                      🎵 {displayProfile.currentSong.title}
                    </Text>
                    <Text style={[styles.musicArtist, { color: theme.text, opacity: 0.7 }]} numberOfLines={1}>
                      {displayProfile.currentSong.artist}
                    </Text>
                  </View>
                  <MaterialIcons 
                    name={displayProfile.currentSong.isPlaying ? 'music-note' : 'pause'} 
                    size={16} 
                    color="#1DB954" 
                  />
                </View>
              )}
            </View>
          </View>

          {/* Stats Section */}
          <View style={[
            styles.statsSection,
            { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)' }
          ]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>127</Text>
              <Text style={[styles.statLabel, { color: theme.text, opacity: 0.7 }]}>Messages</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>23</Text>
              <Text style={[styles.statLabel, { color: theme.text, opacity: 0.7 }]}>Contacts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>5</Text>
              <Text style={[styles.statLabel, { color: theme.text, opacity: 0.7 }]}>Groups</Text>
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Privacy & Security</Text>
            
            {renderSettingItem(
              'Read Receipts',
              'Let others know when you read their messages',
              'check-circle',
              userSettings.readReceipts,
              (value) => handleUserSettingChange('readReceipts', value)
            )}
            
            {renderSettingItem(
              'Last Seen',
              'Show when you were last online',
              'clock',
              userSettings.lastSeen,
              (value) => handleUserSettingChange('lastSeen', value)
            )}
            
            {renderSettingItem(
              'Biometric Authentication',
              'Use fingerprint or face unlock',
              'shield',
              userSettings.biometricAuth,
              (value) => handleUserSettingChange('biometricAuth', value)
            )}
            
            {renderSettingItem(
              'Secret Chat Notifications',
              'Show notifications for encrypted chats',
              'lock',
              userSettings.secretChatNotifications,
              (value) => handleUserSettingChange('secretChatNotifications', value)
            )}
          </View>

          {/* App Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>App Settings</Text>
            
            {renderSettingItem(
              'Notifications',
              'Receive push notifications',
              'bell',
              userSettings.notifications,
              (value) => handleUserSettingChange('notifications', value)
            )}
            
            {renderSettingItem(
              'Dark Mode',
              'Use dark theme (device-specific)',
              'moon',
              deviceSettings.darkMode,
              (value) => handleDeviceSettingChange('darkMode', value)
            )}
            
            {renderSettingItem(
              'Auto-Download Media',
              'Download photos and videos automatically',
              'download',
              userSettings.autoDownloadMedia,
              (value) => handleUserSettingChange('autoDownloadMedia', value)
            )}
            
            {renderSettingItem(
              'Spotify Integration',
              'Share what you\'re listening to',
              'music',
              userSettings.spotifyIntegration,
              (value) => handleUserSettingChange('spotifyIntegration', value)
            )}
          </View>

          {/* Actions Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
            
            {renderActionItem(
              'Account Information',
              'View your account details',
              'info',
              () => Alert.alert('Account Info', 'Account information will be shown here')
            )}
            
            {renderActionItem(
              'Data Export',
              'Download your data',
              'download',
              () => Alert.alert('Export Data', 'Data export will be implemented here')
            )}
            
            {renderActionItem(
              'Help & Support',
              'Get help and contact support',
              'help-circle',
              () => Alert.alert('Help', 'Help center will be implemented here')
            )}
            
            {renderActionItem(
              'About',
              'App version and information',
              'info',
              () => Alert.alert('About فاضي', 'Version 1.0.0\nBuilt with love in Bahrain 🇧🇭')
            )}
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#FF6B6B' }]}>Danger Zone</Text>
            
            {renderActionItem(
              'Logout',
              'Sign out of your account',
              'log-out',
              handleLogout,
              true
            )}
            
            {renderActionItem(
              'Delete Account',
              'Permanently delete your account',
              'trash-2',
              handleDeleteAccount,
              true
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.text, opacity: 0.5 }]}>
              فاضي • Connect when you're free
            </Text>
            <Text style={[styles.footerText, { color: theme.text, opacity: 0.4 }]}>
              Made with ❤️ in Bahrain
            </Text>
          </View>
        </ScrollView>

    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,

  },
  headerTopShadow: {
    height: 20,
    marginTop: -20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 0, 
  },
  profileSection: {
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
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#25D366',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  musicStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(29, 185, 84, 0.2)',
  },
  albumCover: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
  },
  musicInfo: {
    flex: 1,
  },
  musicTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  musicArtist: {
    fontSize: 10,
    marginTop: 1,
  },
  statsSection: {
    margin: 16,
    marginTop: 0,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  actionItem: {
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
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

  },
  safeAreaContent: {
    flex: 1,
  },
});

export default ProfilePage;
