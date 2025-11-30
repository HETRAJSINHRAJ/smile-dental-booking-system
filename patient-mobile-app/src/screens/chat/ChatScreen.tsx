import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { ChatService } from '../../services/ChatService';
import { ChatMessage } from '../../types/chat';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../config/firebase';

export const ChatScreen = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      initializeChat();
    }
  }, [user]);

  useEffect(() => {
    if (conversationId) {
      const unsubscribe = ChatService.listenToMessages(conversationId, (msgs) => {
        setMessages(msgs);
        if (user) {
          ChatService.markMessagesAsRead(conversationId, user.uid);
        }
      });

      return () => unsubscribe();
    }
  }, [conversationId, user]);

  useEffect(() => {
    if (conversationId && user) {
      const unsubscribe = ChatService.listenToTypingIndicators(conversationId, (indicators) => {
        const adminTyping = indicators.some(
          (ind) => ind.userId !== user.uid && ind.isTyping
        );
        setIsTyping(adminTyping);
      });

      return () => unsubscribe();
    }
  }, [conversationId, user]);

  const initializeChat = async () => {
    if (!user) return;

    try {
      const convId = await ChatService.getOrCreateConversation(
        user.uid,
        user.displayName || user.email || 'Patient',
        user.email || ''
      );
      setConversationId(convId);
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Failed to initialize chat');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user) return;

    try {
      await ChatService.sendMessage(
        conversationId,
        user.uid,
        user.displayName || user.email || 'Patient',
        'patient',
        newMessage.trim()
      );
      setNewMessage('');
      handleStopTyping();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleTyping = () => {
    if (!conversationId || !user) return;

    ChatService.setTypingIndicator(
      conversationId,
      user.uid,
      user.displayName || user.email || 'Patient',
      true
    );

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (!conversationId || !user) return;

    ChatService.setTypingIndicator(
      conversationId,
      user.uid,
      user.displayName || user.email || 'Patient',
      false
    );
  };

  const handleImagePicker = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets[0] && !conversationId || !user) return;

      const asset = result.assets[0];
      setUploading(true);

      const response = await fetch(asset.uri!);
      const blob = await response.blob();
      const fileRef = storage().ref(`chat/${conversationId}/${Date.now()}_${asset.fileName}`);
      await fileRef.put(blob);
      const fileUrl = await fileRef.getDownloadURL();

      await ChatService.sendMessage(
        conversationId!,
        user!.uid,
        user!.displayName || user!.email || 'Patient',
        'patient',
        'Sent an image',
        'image',
        fileUrl,
        asset.fileName,
        asset.fileSize
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isPatient = item.senderRole === 'patient';

    return (
      <View style={[styles.messageContainer, isPatient ? styles.patientMessage : styles.adminMessage]}>
        <View style={[styles.messageBubble, isPatient ? styles.patientBubble : styles.adminBubble]}>
          {item.type === 'text' && <Text style={styles.messageText}>{item.message}</Text>}
          {item.type === 'image' && (
            <View>
              <Image source={{ uri: item.fileUrl }} style={styles.messageImage} />
              <Text style={styles.messageText}>{item.message}</Text>
            </View>
          )}
          {item.type === 'document' && (
            <View>
              <Text style={styles.messageText}>{item.fileName}</Text>
              <Text style={styles.fileSizeText}>
                {((item.fileSize || 0) / 1024).toFixed(1)} KB
              </Text>
            </View>
          )}
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please log in to use chat</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Start a conversation with our clinic staff</Text>
          </View>
        }
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingContainer}>
              <Text style={styles.typingText}>Clinic staff is typing...</Text>
            </View>
          ) : null
        }
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={handleImagePicker}
          disabled={uploading}
        >
          <Text style={styles.attachButtonText}>📎</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={(text) => {
            setNewMessage(text);
            handleTyping();
          }}
          placeholder="Type a message..."
          multiline
          editable={!uploading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!newMessage.trim() || uploading) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  patientMessage: {
    alignItems: 'flex-end',
  },
  adminMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  patientBubble: {
    backgroundColor: '#007AFF',
  },
  adminBubble: {
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  fileSizeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  typingContainer: {
    padding: 12,
    marginBottom: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  attachButtonText: {
    fontSize: 24,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
