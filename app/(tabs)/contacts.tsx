import React, { useState, useEffect, useCallback } from 'react';
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
  Platform,
  RefreshControl,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '@/hooks/useThemeColor';
import { 
  AppContact, 
  getContacts, 
  refreshContacts, 
  searchContacts,
  getAppUserContacts,
  requestContactsPermission 
} from '@/services/contacts';
import { formatPhoneForDisplay } from '@/utils/phoneUtils';
import { SearchResult, debouncedSearchUsers } from '@/services/userSearch';

const { width, height } = Dimensions.get('window');

const ContactsPage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.text === '#FAF7F0';
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<'contacts' | 'search'>('contacts');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [contacts, setContacts] = useState<AppContact[]>([]);
  const [searchResults, setSearchResults] = useState<AppContact[]>([]);
  const [userSearchResults, setUserSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Background image based on theme
  const backgroundImage = isDarkMode 
    ? require('@/assets/images/background-dark.png')
    : require('@/assets/images/background-light.png');

  // Load contacts when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [])
  );

  const loadContacts = async () => {
    try {
      console.log('📱 Loading contacts...');
      setIsLoading(true);
      
      // Check permission first
      const permission = await requestContactsPermission();
      setHasPermission(permission);
      
      if (!permission) {
        setIsLoading(false);
        return;
      }

      // Get all contacts (both app users and non-app users)
      const allContacts = await getContacts();
      setContacts(allContacts);
      
      console.log(`📱 Loaded ${allContacts.length} total contacts`);
      console.log(`📱 App users: ${allContacts.filter(c => c.isAppUser).length}`);
      console.log(`📱 Invitable: ${allContacts.filter(c => !c.isAppUser).length}`);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const freshContacts = await refreshContacts();
      const appUserContacts = freshContacts.filter(contact => contact.isAppUser);
      setContacts(appUserContacts);
    } catch (error) {
      console.error('Error refreshing contacts:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (selectedTab === 'contacts') {
      // Search within existing contacts
      if (query.trim().length > 0) {
        setIsLoading(true);
        try {
          const results = await searchContacts(query);
          setSearchResults(results);
        } catch (error) {
          console.error('Error searching contacts:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    } else {
      // Search for users in Firebase (Add People tab)
      handleUserSearch(query);
    }
  };

  const handleUserSearch = (query: string) => {
    if (query.trim().length > 0) {
      setIsSearching(true);
      debouncedSearchUsers(query, (results: SearchResult[]) => {
        setUserSearchResults(results);
        setIsSearching(false);
      });
    } else {
      setUserSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleInviteContact = (contact: AppContact) => {
    const phoneNumber = contact.phoneNumbers[0];
    const message = `Hey! I'm using فاضي - a secure messaging app. Join me! Download it here: [App Store Link]`;
    
    Alert.alert(
      'Invite to فاضي',
      `Invite ${contact.name} to join فاضي?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send SMS', 
          onPress: () => {
            Linking.openURL(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
          }
        },
        { 
          text: 'Share', 
          onPress: () => {
            // TODO: Implement share functionality
            Alert.alert('Share', 'Share functionality will be implemented');
          }
        }
      ]
    );
  };

  const handleScanQR = () => {
    Alert.alert('QR Scanner', 'QR code scanner will be implemented here');
  };

  const handleStartChat = (contact: AppContact) => {
    if (contact.isAppUser && contact.userProfile) {
      router.push(`/chat/${contact.userProfile.uid}`);
    }
  };

  const handleRequestPermission = async () => {
    const permission = await requestContactsPermission();
    setHasPermission(permission);
    if (permission) {
      loadContacts();
    } else {
      Alert.alert(
        'Permission Required',
        'To find your friends on فاضي, we need access to your contacts. You can enable this in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
    }
  };

  const renderUserSearchResult = ({ item }: { item: SearchResult }) => {
    const displayImage = item.profilePicture ? { uri: item.profilePicture } : null;
    const displayName = `${item.firstName} ${item.lastName}`.trim();
    const phoneDisplay = item.phone ? formatPhoneForDisplay(item.phone) : '';

    return (
      <TouchableOpacity 
        style={[
          styles.contactItem,
          { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)' }
        ]}
        onPress={() => router.push(`/chat/${item.uid}`)}
      >
        <View style={styles.contactContent}>
          <View style={styles.profileContainer}>
            {displayImage ? (
              <Image source={displayImage} style={styles.profilePic} />
            ) : (
              <View style={[styles.profilePic, styles.defaultProfilePic, { backgroundColor: theme.primary }]}>
                <Text style={[styles.defaultProfileText, { color: '#FFFFFF' }]}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {item.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactHeader}>
              <Text style={[styles.contactName, { color: theme.text }]} numberOfLines={1}>
                {displayName}
              </Text>
              {item.username && (
                <Text style={[styles.username, { color: theme.text, opacity: 0.6 }]} numberOfLines={1}>
                  @{item.username}
                </Text>
              )}
            </View>
            
            {item.bio && (
              <Text style={[styles.bio, { color: theme.text, opacity: 0.7 }]} numberOfLines={1}>
                {item.bio}
              </Text>
            )}
            
            <View style={styles.contactMeta}>
              <Text style={[styles.metaText, { color: theme.text, opacity: 0.5 }]}>
                {item.matchType === 'phone' ? phoneDisplay : 
                 item.matchType === 'email' ? item.email :
                 item.matchType === 'username' ? `@${item.username}` :
                 `Match: ${item.matchText}`}
              </Text>
              <Text style={[styles.statusText, { color: theme.text, opacity: 0.6 }]}>
                {item.isOnline ? 'Online' : 'Last seen recently'}
              </Text>
            </View>
          </View>
          
          <View style={styles.contactActions}>
            <TouchableOpacity style={styles.chatButton}>
              <Feather name="message-circle" size={16} color={isDarkMode ? '#DAA520' : '#B8860B'} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContact = ({ item }: { item: AppContact }) => {
    const displayImage = item.isAppUser && item.userProfile?.profilePicture 
      ? { uri: item.userProfile.profilePicture }
      : item.imageUri 
        ? { uri: item.imageUri }
        : null;

    const displayName = item.isAppUser && item.userProfile 
      ? `${item.userProfile.firstName} ${item.userProfile.lastName}`.trim()
      : item.name;

    const phoneDisplay = item.phoneNumbers.length > 0 
      ? formatPhoneForDisplay(item.phoneNumbers[0])
      : '';

    return (
      <TouchableOpacity 
        style={[
          styles.contactItem,
          { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)' }
        ]}
        onPress={() => item.isAppUser ? handleStartChat(item) : handleInviteContact(item)}
      >
        <View style={styles.contactContent}>
          <View style={styles.profileContainer}>
            {displayImage ? (
              <Image source={displayImage} style={styles.profilePic} />
            ) : (
              <View style={[styles.profilePic, styles.defaultProfilePic, { backgroundColor: theme.primary }]}>
                <Text style={[styles.defaultProfileText, { color: '#FFFFFF' }]}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {item.isAppUser && item.isOnline && <View style={styles.onlineIndicator} />}
          </View>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactHeader}>
              <Text style={[styles.contactName, { color: theme.text }]} numberOfLines={1}>
                {displayName}
              </Text>
              {item.isAppUser && item.userProfile?.username && (
                <Text style={[styles.username, { color: theme.text, opacity: 0.6 }]} numberOfLines={1}>
                  @{item.userProfile.username}
                </Text>
              )}
            </View>
            
            {item.isAppUser && item.userProfile?.bio && (
              <Text style={[styles.bio, { color: theme.text, opacity: 0.7 }]} numberOfLines={1}>
                {item.userProfile.bio}
              </Text>
            )}
            
            <View style={styles.contactMeta}>
              <Text style={[styles.metaText, { color: theme.text, opacity: 0.5 }]}>
                {phoneDisplay}
              </Text>
              {item.isAppUser && (
                <Text style={[styles.statusText, { color: theme.text, opacity: 0.6 }]}>
                  {item.isOnline ? 'Online' : 'Last seen recently'}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.contactActions}>
            {!item.isAppUser ? (
              <TouchableOpacity 
                style={[styles.inviteButton, { backgroundColor: isDarkMode ? '#8B4513' : '#D2691E' }]}
                onPress={() => handleInviteContact(item)}
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
  };

// WhatsApp-style contacts list component
interface WhatsAppStyleContactsListProps {
  contacts: AppContact[];
  theme: any;
  isDarkMode: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onStartChat: (contact: AppContact) => void;
  onInviteContact: (contact: AppContact) => void;
  renderContact: ({ item }: { item: AppContact }) => React.ReactElement;
}

interface SectionData {
  title: string;
  data: AppContact[];
  key: string;
}

const WhatsAppStyleContactsList: React.FC<WhatsAppStyleContactsListProps> = ({
  contacts,
  theme,
  isDarkMode,
  isLoading,
  isRefreshing,
  onRefresh,
  onStartChat,
  onInviteContact,
  renderContact
}) => {
  // Separate contacts into app users and invitable contacts
  const appUserContacts = contacts.filter(contact => contact.isAppUser);
  const invitableContacts = contacts.filter(contact => !contact.isAppUser);

  // Create sections data for SectionList-like behavior
  const sectionsData: SectionData[] = [];
  
  if (appUserContacts.length > 0) {
    sectionsData.push({
      title: `Contacts on فاضي (${appUserContacts.length})`,
      data: appUserContacts,
      key: 'app-users'
    });
  }
  
  if (invitableContacts.length > 0) {
    sectionsData.push({
      title: `Invite to فاضي (${invitableContacts.length})`,
      data: invitableContacts,
      key: 'invitable'
    });
  }

  const renderSectionHeader = (title: string) => (
    <View style={[
      styles.sectionHeader,
      { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)' }
    ]}>
      <Text style={[styles.sectionHeaderText, { color: theme.text, opacity: 0.8 }]}>
        {title}
      </Text>
    </View>
  );

  const renderAllContacts = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={isDarkMode ? '#8B4513' : '#D2691E'} 
          />
          <Text style={[styles.loadingText, { color: theme.text, opacity: 0.7 }]}>
            Loading contacts...
          </Text>
        </View>
      );
    }

    if (contacts.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Feather name="users" size={48} color={theme.text} style={{ opacity: 0.3 }} />
          <Text style={[styles.emptyText, { color: theme.text, opacity: 0.6 }]}>
            No contacts found
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.text, opacity: 0.5 }]}>
            Make sure you have contacts with phone numbers
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={sectionsData}
        keyExtractor={(section) => section.key}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[isDarkMode ? '#8B4513' : '#D2691E']}
            tintColor={isDarkMode ? '#8B4513' : '#D2691E'}
          />
        }
        renderItem={({ item: section }) => (
          <View key={section.key}>
            {renderSectionHeader(section.title)}
            {section.data.map((contact, index) => (
              <View key={`${section.key}-${contact.id}-${index}`}>
                {renderContact({ item: contact })}
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={styles.contactsList}
      />
    );
  };

  return renderAllContacts();
};

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
          <WhatsAppStyleContactsList 
            contacts={contacts}
            theme={theme}
            isDarkMode={isDarkMode}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            onStartChat={handleStartChat}
            onInviteContact={handleInviteContact}
            renderContact={renderContact}
          />
        ) : (
          <View style={styles.searchContent}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator 
                  size="large" 
                  color={isDarkMode ? '#8B4513' : '#D2691E'} 
                />
                <Text style={[styles.loadingText, { color: theme.text, opacity: 0.7 }]}>
                  Searching users...
                </Text>
              </View>
            ) : searchQuery.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="search" size={48} color={theme.text} style={{ opacity: 0.3 }} />
                <Text style={[styles.emptyText, { color: theme.text, opacity: 0.6 }]}>
                  Search for people
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.text, opacity: 0.5 }]}>
                  Enter a username, name, phone number, or email
                </Text>
              </View>
            ) : (
              <FlatList
                data={userSearchResults}
                renderItem={renderUserSearchResult}
                keyExtractor={item => item.uid}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contactsList}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Feather name="user-x" size={48} color={theme.text} style={{ opacity: 0.3 }} />
                    <Text style={[styles.emptyText, { color: theme.text, opacity: 0.6 }]}>
                      No users found
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
  },
  defaultProfilePic: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultProfileText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inviteButton: {
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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default ContactsPage;
