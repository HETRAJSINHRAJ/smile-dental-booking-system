import { database } from '../config/firebase';
import { ChatMessage, Conversation, TypingIndicator } from '../types/chat';

export class ChatService {
  static async getOrCreateConversation(
    patientId: string,
    patientName: string,
    patientEmail: string
  ): Promise<string> {
    const conversationsRef = database().ref('conversations');
    const snapshot = await conversationsRef.once('value');
    
    if (snapshot.exists()) {
      const conversations = snapshot.val();
      for (const [id, conv] of Object.entries(conversations)) {
        const conversation = conv as Conversation;
        if (conversation.patientId === patientId) {
          return id;
        }
      }
    }
    
    const newConvRef = conversationsRef.push();
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
    
    await newConvRef.set(conversation);
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
    const messagesRef = database().ref(`messages/${conversationId}`);
    const newMessageRef = messagesRef.push();
    const messageId = newMessageRef.key!;
    const now = Date.now();
    
    const chatMessage: ChatMessage = {
      id: messageId,
      conversationId,
      senderId,
      senderName,
      senderRole,
      message,
      type,
      fileUrl,
      fileName,
      fileSize,
      timestamp: now,
      read: false,
    };
    
    await newMessageRef.set(chatMessage);
    
    const conversationRef = database().ref(`conversations/${conversationId}`);
    await conversationRef.update({
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
    const messagesRef = database()
      .ref(`messages/${conversationId}`)
      .orderByChild('timestamp')
      .limitToLast(limit);
    
    const listener = messagesRef.on('value', (snapshot) => {
      const messages: ChatMessage[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          messages.push(childSnapshot.val() as ChatMessage);
          return undefined;
        });
      }
      callback(messages);
    });
    
    return () => messagesRef.off('value', listener);
  }

  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const messagesRef = database().ref(`messages/${conversationId}`);
    const snapshot = await messagesRef.once('value');
    
    if (snapshot.exists()) {
      const updates: Record<string, any> = {};
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val() as ChatMessage;
        if (message.senderId !== userId && !message.read) {
          updates[`${childSnapshot.key}/read`] = true;
          updates[`${childSnapshot.key}/readAt`] = Date.now();
        }
        return undefined;
      });
      
      if (Object.keys(updates).length > 0) {
        await messagesRef.update(updates);
      }
    }
    
    const conversationRef = database().ref(`conversations/${conversationId}`);
    await conversationRef.update({ unreadCount: 0 });
  }

  static async setTypingIndicator(
    conversationId: string,
    userId: string,
    userName: string,
    isTyping: boolean
  ): Promise<void> {
    const typingRef = database().ref(`typing/${conversationId}/${userId}`);
    
    if (isTyping) {
      const indicator: TypingIndicator = {
        conversationId,
        userId,
        userName,
        isTyping: true,
        timestamp: Date.now(),
      };
      await typingRef.set(indicator);
    } else {
      await typingRef.set(null);
    }
  }

  static listenToTypingIndicators(
    conversationId: string,
    callback: (indicators: TypingIndicator[]) => void
  ): () => void {
    const typingRef = database().ref(`typing/${conversationId}`);
    
    const listener = typingRef.on('value', (snapshot) => {
      const indicators: TypingIndicator[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const indicator = childSnapshot.val() as TypingIndicator;
          if (Date.now() - indicator.timestamp < 5000) {
            indicators.push(indicator);
          }
          return undefined;
        });
      }
      callback(indicators);
    });
    
    return () => typingRef.off('value', listener);
  }

  static async getConversation(conversationId: string): Promise<Conversation | null> {
    const conversationRef = database().ref(`conversations/${conversationId}`);
    const snapshot = await conversationRef.once('value');
    
    if (snapshot.exists()) {
      return snapshot.val() as Conversation;
    }
    return null;
  }
}
