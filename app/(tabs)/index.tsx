import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  FlatList,
  Image,
  Dimensions,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useTheme } from '@/hooks/useThemeColor';

const { width, height } = Dimensions.get('window');

interface SpotifyActivity {
  id: string;
  username: string;
  profilePicture: string;
  currentSong: string;
  artist: string;
  albumCover: string;
  isPlaying: boolean;
}

interface ChatItem {
  id: string;
  name: string;
  profilePicture: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messageType: 'text' | 'voice' | 'photo' | 'video';
  isOnline: boolean;
  hasDoubleCheck: boolean;
  isSecretChat: boolean;
}

const ChatsMainPage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.text === '#FAF7F0';
  
  const [isSpotifyExpanded, setIsSpotifyExpanded] = useState<boolean>(true);
  
  // Mock data for friends' Spotify activity
  const [spotifyActivities] = useState<SpotifyActivity[]>([
    {
      id: '1',
      username: 'Ahmad',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      currentSong: 'Fairuz - Ya Msafer',
      artist: 'Fairuz',
      albumCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
      isPlaying: true,
    },
    {
      id: '2',
      username: 'Layla',
      profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      currentSong: 'Amr Diab - Tamally Maak',
      artist: 'Amr Diab',
      albumCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
      isPlaying: true,
    },
    {
      id: '3',
      username: 'Omar',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      currentSong: 'Mashrou Leila - Lil Watan',
      artist: 'Mashrou Leila',
      albumCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
      isPlaying: false,
    },
  ]);

  // Mock data for chats
  const [chats] = useState<ChatItem[]>([
    {
      id: '1',
      name: 'Ahmad Hassan',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Hey! Are you free for coffee today?',
      timestamp: '12:35 PM',
      unreadCount: 2,
      messageType: 'text',
      isOnline: true,
      hasDoubleCheck: false,
      isSecretChat: false,
    },
    {
      id: '2',
      name: 'Layla Al-Rashid',
      profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'What kind of strategy is better?',
      timestamp: '11:55 AM',
      unreadCount: 0,
      messageType: 'text',
      isOnline: false,
      hasDoubleCheck: true,
      isSecretChat: true,
    },
    {
      id: '3',
      name: 'Omar Farid',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      lastMessage: '',
      timestamp: 'Yesterday',
      unreadCount: 0,
      messageType: 'voice',
      isOnline: false,
      hasDoubleCheck: true,
      isSecretChat: false,
    },
    {
      id: '4',
      name: 'Fatima Zahra',
      profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Bro, I have a good idea!',
      timestamp: 'Yesterday',
      unreadCount: 0,
      messageType: 'text',
      isOnline: true,
      hasDoubleCheck: true,
      isSecretChat: false,
    },
    {
      id: '5',
      name: 'Khalid Work Group',
      profilePicture: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Actually I wanted to check with you about the project deadline...',
      timestamp: 'Wednesday',
      unreadCount: 0,
      messageType: 'text',
      isOnline: false,
      hasDoubleCheck: true,
      isSecretChat: false,
    },
  ]);

  const renderSpotifyActivity = ({ item }: { item: SpotifyActivity }) => (
    <TouchableOpacity style={styles.spotifyCard}>
      {/* Album Cover Section */}
      <View style={styles.albumCoverContainer}>
        <Image source={{ uri: item.albumCover }} style={styles.albumCover} />
        
        {/* Play Button Overlay */}
        <View style={styles.playButtonContainer}>
          <View style={[styles.playButton, { backgroundColor: item.isPlaying ? '#1DB954' : '#A7A7A7' }]}>
            <MaterialIcons 
              name={item.isPlaying ? 'pause' : 'play-arrow'} 
              size={16} 
              color="#000000" 
            />
          </View>
        </View>
      </View>
      
      {/* Content Section */}
      <View style={styles.spotifyContent}>
        <View style={styles.spotifyHeader2}>
          <Image source={{ uri: item.profilePicture }} style={styles.spotifyProfilePic} />
          <Text style={styles.listeningLabel}>Listening to</Text>
        </View> 
   
        
        <Text style={styles.songTitle} numberOfLines={2}>
          {item.currentSong}
        </Text>
        
        <Text style={styles.artistName} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity 
      style={[styles.chatItem, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF' }]}
      // onPress={() => router.push(`/chat/${item.id}`)} for later
    >
      <View style={styles.chatContent}>
        <View style={styles.profileContainer}>
          <Image source={{ uri: item.profilePicture }} style={styles.profilePic} />
          {item.isOnline && <View style={styles.onlineIndicator} />}
          {item.isSecretChat && (
            <View style={styles.secretChatBadge}>
              <Feather name="shield" size={12} color="#FFD700" />
            </View>
          )}
        </View>
        
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatName, { color: theme.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.timestamp, { color: theme.text, opacity: 0.6 }]}>
              {item.timestamp}
            </Text>
          </View>
          
          <View style={styles.chatMessage}>
            <View style={styles.messageContent}>
              {item.messageType === 'voice' && (
                <View style={styles.voiceMessage}>
                  <Feather name="mic" size={14} color={isDarkMode ? '#1DB954' : '#25D366'} />
                  <Text style={[styles.voiceDuration, { color: theme.text, opacity: 0.7 }]}>
                    0:14
                  </Text>
                </View>
              )}
              {item.messageType === 'photo' && (
                <View style={styles.mediaMessage}>
                  <Feather name="camera" size={14} color={theme.text} />
                  <Text style={[styles.mediaText, { color: theme.text, opacity: 0.7 }]}>
                    Photo
                  </Text>
                </View>
              )}
              {item.messageType === 'text' && (
                <Text style={[styles.lastMessage, { color: theme.text, opacity: 0.7 }]} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              )}
            </View>
            
            <View style={styles.messageStatus}>
              {item.hasDoubleCheck && (
                <Feather name="check-circle" size={14} color={isDarkMode ? '#1DB954' : '#25D366'} />
              )}
              {item.unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: isDarkMode ? '#1DB954' : '#25D366' }]}>
                  <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background}
      />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
      <View style={[styles.headerContent, styles.headerContentAbsolute]}>
  <TouchableOpacity>
    <Feather name="more-horizontal" size={24} color={theme.text} />
  </TouchableOpacity>
  
  <Text style={[styles.headerTitle, styles.headerTitleAbsolute, { color: theme.text }]}>
    Chats
  </Text>
  
  <View style={styles.headerActions}>
    <TouchableOpacity style={styles.headerButton}>
      <Feather name="camera" size={24} color={theme.text} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.headerButton}>
      <Feather name="plus" size={24} color={theme.text} />
    </TouchableOpacity>
  </View>
</View>
      </View>

      {/* Spotify Activity Section */}
      <View style={[styles.spotifySection, { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.9)' }]}>
        <TouchableOpacity 
          style={styles.spotifyHeader}
          onPress={() => setIsSpotifyExpanded(!isSpotifyExpanded)}
        >
          <View style={styles.spotifyTitleContainer}>
            <MaterialIcons name="music-note" size={20} color="#1DB954" />
            <Text style={[styles.spotifyTitle, { color: theme.text }]}>
              Friends' Music
            </Text>
          </View>
          <View style={styles.spotifyHeaderRight}>
            <TouchableOpacity onPress={() => setIsSpotifyExpanded(!isSpotifyExpanded)}>
              <Text style={[styles.seeAll, { color: isDarkMode ? '#DAA520' : '#B8860B' }]}>
                {isSpotifyExpanded ? 'Hide' : 'See All'}
              </Text>
            </TouchableOpacity>
            <Feather 
              name={isSpotifyExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={theme.text} 
              style={{ marginLeft: 8 }}
            />
          </View>
        </TouchableOpacity>
        
        {isSpotifyExpanded && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.spotifyScroll}
          >
            {spotifyActivities.map(item => (
              <View key={item.id}>
                {renderSpotifyActivity({ item })}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Chats List */}
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.chatsList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
  },
  spotifySection: {
    paddingVertical: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  spotifyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  spotifyHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotifyTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotifyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  spotifyScroll: {
    paddingHorizontal: 16,
  },
  spotifyCard: {
    width: 160,
    height: 220,
    backgroundColor: '#282828',
    borderRadius: 8,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  albumCoverContainer: {
    position: 'relative',
    margin: 12,
    marginBottom: 8,
  },
  albumCover: {
    width: 136,
    height: 136,
    borderRadius: 6,
  },
  playButtonContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  spotifyContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    flex: 1,
  },
  spotifyHeader2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  spotifyProfilePic: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  listeningLabel: {
    color: '#A7A7A7',
    fontSize: 10,
    fontWeight: '400',
  },
  spotifyUsername: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    lineHeight: 16,
  },
  artistName: {
    color: '#A7A7A7',
    fontSize: 11,
    fontWeight: '400',
  },
  chatsList: {
    paddingTop: 8,
  },
  chatItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#25D366',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  secretChatBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '400',
  },
  chatMessage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
  },
  lastMessage: {
    fontSize: 14,
    fontWeight: '400',
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceDuration: {
    fontSize: 14,
    marginLeft: 6,
  },
  mediaMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaText: {
    fontSize: 14,
    marginLeft: 6,
  },
  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
 headerContentAbsolute: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  
headerTitleAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    zIndex: 1, 
  }
});

export default ChatsMainPage;