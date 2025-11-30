import { ref, push, set, onValue, off, update, query, orderByChild, limitToLast, get } from 'firebase/database';
import { realtimeDb, auth } from '../firebase/config';
import { ChatMessage, Conversation, TypingIndicator } from '@/types/chat';

export class ChatService {
  static async getOrCreateConversation(
    patientId: string,
    patientName: string,
    patientEmail: string
  ): Promise<string> {
    // Ensure user is authenticated and token is fresh
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to use chat');
    }
    
    // Force token refresh to ensure we have latest permissions
    try {
      await currentUser.getIdToken(true);
    } catch (error) {
      console.error('Error refreshing auth token:', error);
    }
    
    const conversationsRef = ref(realtimeDb, 'conversations');
    const snapshot = await get(conversationsRef);
    
    if (snapshot.exists()) {
      const conversations = snapshot.val();
      for (const [id, conv] of Object.entries(conversations)) {
        const conversation = conv as Conversation;
        if (conversation.patientId === patientId) {
          return id;
        }
      }
    }
    
    const newConvRef = push(conversationsRef);
    const conversationId = newConvRef.key!;
    const now = Date.now();
    
    const conversation: Conversation = {
      id: conversationId,
      patientId,
      patientName,
      patientEmail,
      status: 'active',
      unreadCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    
    await set(newConvRef, conversation);
    return conversationId;
  }

  static async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderRole: 'patient' | 'admin',
    message: string,
    type: 'text' | 'image' | 'document' = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number
  ): Promise<string> {
    const messagesRef = ref(realtimeDb, `messages/${conversationId}`);
    const newMessageRef = push(messagesRef);
    const messageId = newMessageRef.key!;
    const now = Date.now();
    
    // Build message object, only including optional fields if they have values
    const chatMessage: any = {
      id: messageId,
      conversationId,
      senderId,
      senderName,
      senderRole,
      message,
      type,
      timestamp: now,
      read: false,
    };
    
    // Only add optional fields if they're defined
    if (fileUrl !== undefined) chatMessage.fileUrl = fileUrl;
    if (fileName !== undefined) chatMessage.fileName = fileName;
    if (fileSize !== undefined) chatMessage.fileSize = fileSize;
    
    await set(newMessageRef, chatMessage);
    
    const conversationRef = ref(realtimeDb, `conversations/${conversationId}`);
    await update(conversationRef, {
      lastMessage: message,
      lastMessageTimestamp: now,
      updatedAt: now,
    });
    
    return messageId;
  }

  static listenToMessages(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void,
    limit: number = 50
  ): () => void {
    const messagesRef = ref(realtimeDb, `messages/${conversationId}`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(limit));
    
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const messages: ChatMessage[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          messages.push(childSnapshot.val() as ChatMessage);
        });
      }
      callback(messages);
    });
    
    return () => off(messagesQuery);
  }

  static listenToConversations(
    callback: (conversations: Conversation[]) => void
  ): () => void {
    const conversationsRef = ref(realtimeDb, 'conversations');
    const conversationsQuery = query(conversationsRef, orderByChild('updatedAt'));
    
    const unsubscribe = onValue(conversationsQuery, (snapshot) => {
      const conversations: Conversation[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const conv = childSnapshot.val() as Conversation;
          if (conv.status === 'active') {
            conversations.push(conv);
          }
        });
      }
      conversations.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      callback(conversations);
    });
    
    return () => off(conversationsQuery);
  }

  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const messagesRef = ref(realtimeDb, `messages/${conversationId}`);
    const snapshot = await get(messagesRef);
    
    if (snapshot.exists()) {
      const updates: Record<string, any> = {};
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val() as ChatMessage;
        if (message.senderId !== userId && !message.read) {
          updates[`${childSnapshot.key}/read`] = true;
          updates[`${childSnapshot.key}/readAt`] = Date.now();
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await update(messagesRef, updates);
      }
    }
    
    const conversationRef = ref(realtimeDb, `conversations/${conversationId}`);
    await update(conversationRef, { unreadCount: 0 });
  }

  static async setTypingIndicator(
    conversationId: string,
    userId: string,
    userName: string,
    isTyping: boolean
  ): Promise<void> {
    const typingRef = ref(realtimeDb, `typing/${conversationId}/${userId}`);
    
    if (isTyping) {
      const indicator: TypingIndicator = {
        conversationId,
        userId,
        userName,
        isTyping: true,
        timestamp: Date.now(),
      };
      await set(typingRef, indicator);
    } else {
      await set(typingRef, null);
    }
  }

  static listenToTypingIndicators(
    conversationId: string,
    callback: (indicators: TypingIndicator[]) => void
  ): () => void {
    const typingRef = ref(realtimeDb, `typing/${conversationId}`);
    
    const unsubscribe = onValue(typingRef, (snapshot) => {
      const indicators: TypingIndicator[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const indicator = childSnapshot.val() as TypingIndicator;
          if (Date.now() - indicator.timestamp < 5000) {
            indicators.push(indicator);
          }
        });
      }
      callback(indicators);
    });
    
    return () => off(typingRef);
  }

  static async archiveConversation(conversationId: string): Promise<void> {
    const conversationRef = ref(realtimeDb, `conversations/${conversationId}`);
    await update(conversationRef, {
      status: 'archived',
      updatedAt: Date.now(),
    });
  }

  static async getConversation(conversationId: string): Promise<Conversation | null> {
    const conversationRef = ref(realtimeDb, `conversations/${conversationId}`);
    const snapshot = await get(conversationRef);
    
    if (snapshot.exists()) {
      return snapshot.val() as Conversation;
    }
    return null;
  }
}
