'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Paperclip } from 'lucide-react';
import { ChatService } from '@/lib/chat/ChatService';
import { ChatMessage } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { uploadToUploadcare } from '@/lib/uploadcare';
import { toast } from 'sonner';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      initializeChat();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (conversationId) {
      const unsubscribe = ChatService.listenToMessages(conversationId, (msgs) => {
        setMessages(msgs);
        scrollToBottom();
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
    if (!user) {
      console.log('No user found, cannot initialize chat');
      return;
    }

    try {
      console.log('Initializing chat for user:', user.uid);
      const convId = await ChatService.getOrCreateConversation(
        user.uid,
        user.displayName || user.email || 'Patient',
        user.email || ''
      );
      console.log('Chat initialized with conversation ID:', convId);
      setConversationId(convId);
    } catch (error) {
      console.error('Error initializing chat:', error);
      // Show user-friendly error
      alert('Unable to connect to chat. Please make sure you are logged in and try again.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId || !user) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      // Upload to Uploadcare
      const fileUrl = await uploadToUploadcare(file);
      
      if (!fileUrl) {
        throw new Error('Failed to upload file');
      }

      const fileType = file.type.startsWith('image/') ? 'image' : 'document';

      await ChatService.sendMessage(
        conversationId,
        user.uid,
        user.displayName || user.email || 'Patient',
        'patient',
        fileType === 'image' ? 'Sent an image' : `Sent ${file.name}`,
        fileType,
        fileUrl,
        file.name,
        file.size
      );
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Chat with Clinic</h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Start a conversation with our clinic staff</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderRole === 'patient' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        msg.senderRole === 'patient'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.type === 'text' && <p className="text-sm">{msg.message}</p>}
                      {msg.type === 'image' && (
                        <div>
                          <img
                            src={msg.fileUrl}
                            alt="Shared image"
                            className="rounded max-w-full mb-1"
                          />
                          <p className="text-xs opacity-75">{msg.message}</p>
                        </div>
                      )}
                      {msg.type === 'document' && (
                        <div>
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline"
                          >
                            {msg.fileName}
                          </a>
                          <p className="text-xs opacity-75 mt-1">
                            {(msg.fileSize! / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      )}
                      <p className="text-xs opacity-75 mt-1">{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Clinic staff is typing...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1"
                disabled={uploading}
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim() || uploading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
