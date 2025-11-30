import { Timestamp } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'admin';
  message: string;
  type: 'text' | 'image' | 'document';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  timestamp: number; // Unix timestamp for Realtime Database
  read: boolean;
  readAt?: number;
}

export interface Conversation {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  status: 'active' | 'archived';
  lastMessage?: string;
  lastMessageTimestamp?: number;
  unreadCount: number; // Unread messages for patient
  createdAt: number;
  updatedAt: number;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: number;
}

export interface ChatParticipant {
  userId: string;
  userName: string;
  userRole: 'patient' | 'admin';
  online: boolean;
  lastSeen: number;
}
