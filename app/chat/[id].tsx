import React, { useState, useRef, useEffect } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  Alert,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useTheme } from '@/hooks/useThemeColor';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  messageType: 'text' | 'voice' | 'image' | 'video';
  isRead: boolean;
  duration?: number; // for voice messages
  voiceUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
}

interface ChatUser {
  id: string;
  name: string;
  profilePicture: string;
  isOnline: boolean;
  lastSeen?: Date;
  isTyping: boolean;
  currentSong?: {
    title: string;
    artist: string;
    albumCover: string;
    isPlaying: boolean;
  };
}

const ChatPage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.text === '#FAF7F0';
  const currentUserId = 'user1'; // Mock current user ID
  const flatListRef = useRef<FlatList>(null);
  
  // Mock chat user data
  const [chatUser] = useState<ChatUser>({
    id: 'user2',
    name: 'Ahmad Hassan',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    isTyping: false,
    currentSong: {
      title: 'Fairuz - Ya Msafer',
      artist: 'Fairuz',
      albumCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
      isPlaying: true,
    }
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! How are you doing?',
      senderId: 'user2',
      timestamp: new Date(Date.now() - 3600000),
      messageType: 'text',
      isRead: true,
    },
    {
      id: '2',
      text: 'I\'m doing great! Just finished listening to some Fairuz 🎵',
      senderId: 'user1',
      timestamp: new Date(Date.now() - 3500000),
      messageType: 'text',
      isRead: true,
    },
    {
      id: '3',
      text: 'Nice! I love her music too. Are you free for coffee today?',
      senderId: 'user2',
      timestamp: new Date(Date.now() - 3400000),
      messageType: 'text',
      isRead: true,
    },
    {
      id: '4',
      text: 'Absolutely! What time works for you?',
      senderId: 'user1',
      timestamp: new Date(Date.now() - 3300000),
      messageType: 'text',
      isRead: true,
    },
    {
      id: '5',
      text: '',
      senderId: 'user2',
      timestamp: new Date(Date.now() - 1800000),
      messageType: 'voice',
      isRead: false,
      duration: 12,
      voiceUrl: 'mock_voice_url',
    },
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  // Background image based on theme
  const backgroundImage = isDarkMode 
    ? require('@/assets/images/background-dark.png')
    : require('@/assets/images/background-light.png');

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        senderId: currentUserId,
        timestamp: new Date(),
        messageType: 'text',
        isRead: false,
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      
      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleVoicePress = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setRecordingDuration(0);
      Alert.alert('Voice Message', 'Voice recording stopped');
    } else {
      // Start recording
      setIsRecording(true);
      Alert.alert('Voice Message', 'Voice recording started');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === currentUserId;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? [
            styles.ownMessage,
            { backgroundColor: isDarkMode ? '#8B4513' : '#D2691E' }
          ] : [
            styles.otherMessage,
            { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)' }
          ]
        ]}>
          {item.messageType === 'text' && (
            <Text style={[
              styles.messageText,
              { color: isOwnMessage ? '#FFFFFF' : theme.text }
            ]}>
              {item.text}
            </Text>
          )}
          
          {item.messageType === 'voice' && (
            <View style={styles.voiceMessage}>
              <TouchableOpacity style={styles.voicePlayButton}>
                <MaterialIcons 
                  name="play-arrow" 
                  size={20} 
                  color={isOwnMessage ? '#FFFFFF' : theme.text} 
                />
              </TouchableOpacity>
              <View style={styles.voiceWaveform}>
                <View style={[styles.voiceWave, { backgroundColor: isOwnMessage ? '#FFFFFF' : theme.text }]} />
                <View style={[styles.voiceWave, { backgroundColor: isOwnMessage ? '#FFFFFF' : theme.text }]} />
                <View style={[styles.voiceWave, { backgroundColor: isOwnMessage ? '#FFFFFF' : theme.text }]} />
                <View style={[styles.voiceWave, { backgroundColor: isOwnMessage ? '#FFFFFF' : theme.text }]} />
              </View>
              <Text style={[
                styles.voiceDuration,
                { color: isOwnMessage ? '#FFFFFF' : theme.text }
              ]}>
                {item.duration}s
              </Text>
            </View>
          )}
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              { color: isOwnMessage ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)' }
            ]}>
              {formatTime(item.timestamp)}
            </Text>
            
            {isOwnMessage && (
              <MaterialIcons 
                name={item.isRead ? 'done-all' : 'done'} 
                size={16} 
                color={item.isRead ? '#1DB954' : 'rgba(255, 255, 255, 0.8)'} 
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderSpotifyStatus = () => {
    if (!chatUser.currentSong) return null;
    
    return (
      <View style={[
        styles.spotifyStatus, 
        { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)' }
      ]}>
        <Image source={{ uri: chatUser.currentSong.albumCover }} style={styles.spotifyAlbum} />
        <View style={styles.spotifyInfo}>
          <Text style={[styles.spotifyText, { color: theme.text }]} numberOfLines={1}>
            🎵 {chatUser.currentSong.title}
          </Text>
          <Text style={[styles.spotifyArtist, { color: theme.text, opacity: 0.7 }]} numberOfLines={1}>
            {chatUser.currentSong.artist}
          </Text>
        </View>
        <MaterialIcons 
          name={chatUser.currentSong.isPlaying ? 'music-note' : 'pause'} 
          size={16} 
          color="#1DB954" 
        />
      </View>
    );
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.container}>
        {/* Header */}
        <View style={[
          styles.header, 
          { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)' }
        ]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.userInfo}>
            <Image source={{ uri: chatUser.profilePicture }} style={styles.headerProfilePic} />
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: theme.text }]}>{chatUser.name}</Text>
              <Text style={[styles.userStatus, { color: theme.text, opacity: 0.7 }]}>
                {chatUser.isOnline ? 'online' : 'last seen recently'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Feather name="phone" size={20} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Feather name="video" size={20} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Feather name="more-vertical" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Spotify Status */}
        {renderSpotifyStatus()}
      <SafeAreaView style={styles.safeArea}>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          backgroundColor="transparent"
          translucent
        />
        
      


        {/* Messages */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
          
          {/* Input Area */}
          <View style={[
            styles.inputContainer,
            { backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)' }
          ]}>
            <View style={[
              styles.inputWrapper,
              { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)' }
            ]}>
              <TouchableOpacity style={styles.inputButton}>
                <Feather name="plus" size={20} color={theme.text} />
              </TouchableOpacity>
              
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                placeholder="Type a message..."
                placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
              />
              
              <TouchableOpacity style={styles.inputButton}>
                <Feather name="camera" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            {inputText.trim() ? (
              <TouchableOpacity 
                style={[styles.sendButton, { backgroundColor: isDarkMode ? '#8B4513' : '#D2691E' }]}
                onPress={handleSendMessage}
              >
                <Feather name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.voiceButton, 
                  { backgroundColor: isRecording ? '#FF6B6B' : (isDarkMode ? '#8B4513' : '#D2691E') }
                ]}
                onPress={handleVoicePress}
              >
                <Feather name="mic" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 70
  },
  backButton: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerProfilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
  },
  spotifyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  spotifyAlbum: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
  },
  spotifyInfo: {
    flex: 1,
  },
  spotifyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  spotifyArtist: {
    fontSize: 10,
    marginTop: 1,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginVertical: 4,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ownMessage: {
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 180,
  },
  voicePlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  voiceWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 8,
  },
  voiceWave: {
    width: 3,
    height: 12,
    borderRadius: 2,
    opacity: 0.7,
  },
  voiceDuration: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '400',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    minHeight: 50,
  },
  inputButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
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
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  voiceButton: {
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
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default ChatPage;