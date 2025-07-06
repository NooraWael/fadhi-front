import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  FlatList,
  Image,
  Dimensions,
  Alert,
  ImageBackground,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useTheme } from '@/hooks/useThemeColor';

const { width, height } = Dimensions.get('window');

interface Contact {
  id: string;
  username: string;
  fullName: string;
  profilePicture: string;
  isOnline: boolean;
  lastSeen?: Date;
  bio?: string;
  phoneNumber?: string;
  isFriend: boolean;
  mutualFriends: number;
  currentSong?: {
    title: string;
    artist: string;
    albumCover: string;
    isPlaying: boolean;
  };
}

const ContactsPage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.text === '#FAF7F0';
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'contacts' | 'search'>('contacts');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchResults, setSearchResults] = useState<Contact[]>([]);

  // Background image based on theme
  const backgroundImage = isDarkMode 
    ? require('@/assets/images/background-dark.png')
    : require('@/assets/images/background-light.png');

  // Mock contacts data
  const mockContacts: Contact[] = [
    {
      id: '1',
      username: 'ahmad_hassan',
      fullName: 'Ahmad Hassan',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isOnline: true,
      bio: 'Love music and coffee ☕',
      phoneNumber: '+973 1234 5678',
      isFriend: true,
      mutualFriends: 5,
      currentSong: {
        title: 'Fairuz - Ya Msafer',
        artist: 'Fairuz',
        albumCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
        isPlaying: true,
      }
    },
    {
      id: '2',
      username: 'layla_alrashid',
      fullName: 'Layla Al-Rashid',
      profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      isOnline: false,
      lastSeen: new Date(Date.now() - 1800000),
      bio: 'Designer & Artist 🎨',
      phoneNumber: '+973 2345 6789',
      isFriend: true,
      mutualFriends: 3,
    },
    {
      id: '3',
      username: 'omar_farid',
      fullName: 'Omar Farid',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isOnline: true,
      bio: 'Software Engineer 💻',
      phoneNumber: '+973 3456 7890',
      isFriend: true,
      mutualFriends: 8,
    },
    {
      id: '4',
      username: 'fatima_zahra',
      fullName: 'Fatima Zahra',
      profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      isOnline: true,
      bio: 'Photographer 📸',
      phoneNumber: '+973 4567 8901',
      isFriend: false,
      mutualFriends: 2,
    },
    {
      id: '5',
      username: 'khalid_work',
      fullName: 'Khalid Al-Mansoori',
      profilePicture: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000),
      bio: 'Business Analyst 📊',
      phoneNumber: '+973 5678 9012',
      isFriend: false,
      mutualFriends: 1,
    },
  ];

  useEffect(() => {
    // Load contacts
    const friendContacts = mockContacts.filter(contact => contact.isFriend);
    setContacts(friendContacts);
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const results = mockContacts.filter(contact =>
          contact.username.toLowerCase().includes(query.toLowerCase()) ||
          contact.fullName.toLowerCase().includes(query.toLowerCase()) ||
          contact.phoneNumber?.includes(query)
        );
        setSearchResults(results);
        setIsLoading(false);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddContact = async (contactId: string) => {
    Alert.alert(
      'Add Contact',
      'Send friend request to this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: () => {
            // Update the contact's friend status
            setSearchResults(prev => 
              prev.map(contact => 
                contact.id === contactId 
                  ? { ...contact, isFriend: true }
                  : contact
              )
            );
            Alert.alert('Success', 'Friend request sent!');
          }
        }
      ]
    );
  };

  const handleScanQR = () => {
    Alert.alert('QR Scanner', 'QR code scanner will be implemented here');
  };

  const handleStartChat = (contact: Contact) => {
    router.push(`/chat/${contact.id}`);
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity 
      style={[
        styles.contactItem,
        { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)' }
      ]}
      onPress={() => handleStartChat(item)}
    >
      <View style={styles.contactContent}>
        <View style={styles.profileContainer}>
          <Image source={{ uri: item.profilePicture }} style={styles.profilePic} />
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.contactInfo}>
          <View style={styles.contactHeader}>
            <Text style={[styles.contactName, { color: theme.text }]} numberOfLines={1}>
              {item.fullName}
            </Text>
            <Text style={[styles.username, { color: theme.text, opacity: 0.6 }]} numberOfLines={1}>
              @{item.username}
            </Text>
          </View>
          
          {item.bio && (
            <Text style={[styles.bio, { color: theme.text, opacity: 0.7 }]} numberOfLines={1}>
              {item.bio}
            </Text>
          )}
          
          {item.currentSong && (
            <View style={styles.musicStatus}>
              <MaterialIcons name="music-note" size={14} color="#1DB954" />
              <Text style={[styles.musicText, { color: theme.text, opacity: 0.6 }]} numberOfLines={1}>
                {item.currentSong.title}
              </Text>
            </View>
          )}
          
          <View style={styles.contactMeta}>
            <Text style={[styles.metaText, { color: theme.text, opacity: 0.5 }]}>
              {item.mutualFriends} mutual friends
            </Text>
            <Text style={[styles.statusText, { color: theme.text, opacity: 0.6 }]}>
              {item.isOnline ? 'Online' : 'Last seen recently'}
            </Text>
          </View>
        </View>
        
        <View style={styles.contactActions}>
          {!item.isFriend ? (
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: isDarkMode ? '#8B4513' : '#D2691E' }]}
              onPress={() => handleAddContact(item.id)}
            >
              <Feather name="user-plus" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.chatButton}>
              <Feather name="message-circle" size={16} color={isDarkMode ? '#DAA520' : '#B8860B'} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

// Replace your return statement with this fixed version:

return (
    <ImageBackground source={backgroundImage} style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent
      />
      
      {/* Header with extended background */}
      <View style={[
        styles.headerExtended,
        { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)' }
      ]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Contacts
            </Text>
            
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={handleScanQR}
            >
              <Feather name="camera" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
  
      {/* Search Bar */}
      <View style={[
        styles.searchContainer,
        { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.9)' }
      ]}>
        <View style={[
          styles.searchWrapper,
          { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)' }
        ]}>
          <Feather name="search" size={20} color={theme.text} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search by username, name, or phone..."
            placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Feather name="x" size={20} color={theme.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>
  
      {/* Tabs */}
      <View style={[
        styles.tabContainer,
        { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.9)' }
      ]}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'contacts' && [
              styles.activeTab,
              { backgroundColor: isDarkMode ? '#8B4513' : '#D2691E' }
            ]
          ]}
          onPress={() => setSelectedTab('contacts')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'contacts' ? '#FFFFFF' : theme.text }
          ]}>
            My Contacts ({contacts.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'search' && [
              styles.activeTab,
              { backgroundColor: isDarkMode ? '#8B4513' : '#D2691E' }
            ]
          ]}
          onPress={() => setSelectedTab('search')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'search' ? '#FFFFFF' : theme.text }
          ]}>
            Add People
          </Text>
        </TouchableOpacity>
      </View>
  
      {/* Content */}
      <View style={styles.contentContainer}>
        {selectedTab === 'contacts' ? (
          <FlatList
            data={contacts}
            renderItem={renderContact}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contactsList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="users" size={48} color={theme.text} style={{ opacity: 0.3 }} />
                <Text style={[styles.emptyText, { color: theme.text, opacity: 0.6 }]}>
                  No contacts yet
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.text, opacity: 0.5 }]}>
                  Search for people to add them
                </Text>
              </View>
            }
          />
        ) : (
          <View style={styles.searchContent}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator 
                  size="large" 
                  color={isDarkMode ? '#8B4513' : '#D2691E'} 
                />
                <Text style={[styles.loadingText, { color: theme.text, opacity: 0.7 }]}>
                  Searching...
                </Text>
              </View>
            ) : searchQuery.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="search" size={48} color={theme.text} style={{ opacity: 0.3 }} />
                <Text style={[styles.emptyText, { color: theme.text, opacity: 0.6 }]}>
                  Search for people
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.text, opacity: 0.5 }]}>
                  Enter a username, name, or phone number
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                renderItem={renderContact}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contactsList}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Feather name="user-x" size={48} color={theme.text} style={{ opacity: 0.3 }} />
                    <Text style={[styles.emptyText, { color: theme.text, opacity: 0.6 }]}>
                      No results found
                    </Text>
                    <Text style={[styles.emptySubtext, { color: theme.text, opacity: 0.5 }]}>
                      Try a different search term
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        )}
      </View>
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
  scanButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  contactsList: {
    paddingTop: 8,
  },
  contactItem: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#25D366',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  username: {
    fontSize: 12,
    fontWeight: '400',
  },
  bio: {
    fontSize: 14,
    marginBottom: 4,
  },
  musicStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  musicText: {
    fontSize: 12,
    marginLeft: 4,
  },
  contactMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
  },
  statusText: {
    fontSize: 11,
  },
  contactActions: {
    marginLeft: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  chatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
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

  }
});

export default ContactsPage;