import React, { useState } from 'react';
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
  currentSong?: {
    title: string;
    artist: string;
    albumCover: string;
    isPlaying: boolean;
  };
}

interface Settings {
  notifications: boolean;
  darkMode: boolean;
  readReceipts: boolean;
  lastSeen: boolean;
  biometricAuth: boolean;
  autoDownloadMedia: boolean;
  secretChatNotifications: boolean;
  spotifyIntegration: boolean;
}

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.text === '#FAF7F0';
  
  // Mock user profile data
  const [userProfile] = useState<UserProfile>({
    id: 'user1',
    username: 'you_username',
    fullName: 'Your Name',
    profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    bio: 'Love music, coffee, and good conversations ✨',
    phoneNumber: '+973 9876 5432',
    email: 'you@example.com',
    joinDate: new Date('2024-01-15'),
    isOnline: true,
    currentSong: {
      title: 'Umm Kulthum - Alf Leila wa Leila',
      artist: 'Umm Kulthum',
      albumCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
      isPlaying: true,
    }
  });

  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    darkMode: isDarkMode,
    readReceipts: true,
    lastSeen: true,
    biometricAuth: true,
    autoDownloadMedia: false,
    secretChatNotifications: true,
    spotifyIntegration: true,
  });

  // Background image based on theme
  const backgroundImage = isDarkMode 
    ? require('@/assets/images/background-dark.png')
    : require('@/assets/images/background-light.png');

  const handleEditProfile = () => {
   // Alert.alert('Edit Profile', 'Profile editing will be implemented here');
    router.push(`/profile/${userProfile.id}`);
  };

  const handleChangeProfilePicture = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => console.log('Camera selected') },
        { text: 'Gallery', onPress: () => console.log('Gallery selected') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSettingChange = (key: keyof Settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
          onPress: () => {
            // Clear user data and navigate to auth
            router.replace('/auth/login');
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
            >
              <Image source={{ uri: userProfile.profilePicture }} style={styles.profileImage} />
              <View style={styles.profileImageOverlay}>
                <Feather name="camera" size={20} color="#FFFFFF" />
              </View>
              {userProfile.isOnline && <View style={styles.onlineIndicator} />}
            </TouchableOpacity>
            
            <View style={styles.profileInfo}>
              <Text style={[styles.fullName, { color: theme.text }]}>
                {userProfile.fullName}
              </Text>
              <Text style={[styles.username, { color: theme.text, opacity: 0.7 }]}>
                @{userProfile.username}
              </Text>
              <Text style={[styles.bio, { color: theme.text, opacity: 0.8 }]}>
                {userProfile.bio}
              </Text>
              
              {userProfile.currentSong && (
                <View style={styles.musicStatus}>
                  <Image source={{ uri: userProfile.currentSong.albumCover }} style={styles.albumCover} />
                  <View style={styles.musicInfo}>
                    <Text style={[styles.musicTitle, { color: theme.text }]} numberOfLines={1}>
                      🎵 {userProfile.currentSong.title}
                    </Text>
                    <Text style={[styles.musicArtist, { color: theme.text, opacity: 0.7 }]} numberOfLines={1}>
                      {userProfile.currentSong.artist}
                    </Text>
                  </View>
                  <MaterialIcons 
                    name={userProfile.currentSong.isPlaying ? 'music-note' : 'pause'} 
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
              settings.readReceipts,
              (value) => handleSettingChange('readReceipts', value)
            )}
            
            {renderSettingItem(
              'Last Seen',
              'Show when you were last online',
              'clock',
              settings.lastSeen,
              (value) => handleSettingChange('lastSeen', value)
            )}
            
            {renderSettingItem(
              'Biometric Authentication',
              'Use fingerprint or face unlock',
              'shield',
              settings.biometricAuth,
              (value) => handleSettingChange('biometricAuth', value)
            )}
            
            {renderSettingItem(
              'Secret Chat Notifications',
              'Show notifications for encrypted chats',
              'lock',
              settings.secretChatNotifications,
              (value) => handleSettingChange('secretChatNotifications', value)
            )}
          </View>

          {/* App Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>App Settings</Text>
            
            {renderSettingItem(
              'Notifications',
              'Receive push notifications',
              'bell',
              settings.notifications,
              (value) => handleSettingChange('notifications', value)
            )}
            
            {renderSettingItem(
              'Auto-Download Media',
              'Download photos and videos automatically',
              'download',
              settings.autoDownloadMedia,
              (value) => handleSettingChange('autoDownloadMedia', value)
            )}
            
            {renderSettingItem(
              'Spotify Integration',
              'Share what you\'re listening to',
              'music',
              settings.spotifyIntegration,
              (value) => handleSettingChange('spotifyIntegration', value)
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