'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatService } from '@/lib/chat/ChatService';
import { ChatMessage, Conversation } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Archive } from 'lucide-react';
import { uploadToUploadcare } from '@/lib/uploadcare';
import { toast } from 'sonner';

interface ChatMessagePanelProps {
  conversation: Conversation;
}

export function ChatMessagePanel({ conversation }: ChatMessagePanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (conversation) {
      const unsubscribe = ChatService.listenToMessages(conversation.id, (msgs) => {
        setMessages(msgs);
        scrollToBottom();
        if (user) {
          ChatService.markMessagesAsRead(conversation.id, user.uid);
        }
      });

      return () => unsubscribe();
    }
  }, [conversation, user]);

  useEffect(() => {
    if (conversation && user) {
      const unsubscribe = ChatService.listenToTypingIndicators(conversation.id, (indicators) => {
        const patientTyping = indicators.some(
          (ind) => ind.userId !== user.uid && ind.isTyping
        );
        setIsTyping(patientTyping);
      });

      return () => unsubscribe();
    }
  }, [conversation, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      await ChatService.sendMessage(
        conversation.id,
        user.uid,
        user.displayName || user.email || 'Admin',
        'admin',
        newMessage.trim()
      );
      setNewMessage('');
      handleStopTyping();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (!user) return;

    ChatService.setTypingIndicator(
      conversation.id,
      user.uid,
      user.displayName || user.email || 'Admin',
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
    if (!user) return;

    ChatService.setTypingIndicator(
      conversation.id,
      user.uid,
      user.displayName || user.email || 'Admin',
      false
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

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
        conversation.id,
        user.uid,
        user.displayName || user.email || 'Admin',
        'admin',
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

  const handleArchive = async () => {
    try {
      await ChatService.archiveConversation(conversation.id);
      toast.success('Conversation archived');
    } catch (error) {
      console.error('Error archiving conversation:', error);
      toast.error('Failed to archive conversation');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-[calc(100vh-20rem)] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {conversation.patientName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <CardTitle className="text-lg">{conversation.patientName}</CardTitle>
            <p className="text-sm text-muted-foreground">{conversation.patientEmail}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleArchive}>
          <Archive className="w-4 h-4 mr-2" />
          Archive
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground mt-8">
              <p className="font-medium">No messages yet</p>
              <p className="text-sm mt-1">Start the conversation by sending a message</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      msg.senderRole === 'admin'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-xs font-semibold mb-1 opacity-90">{msg.senderName}</p>
                    {msg.type === 'text' && <p className="text-sm whitespace-pre-wrap">{msg.message}</p>}
                    {msg.type === 'image' && (
                      <div>
                        <img
                          src={msg.fileUrl}
                          alt="Shared image"
                          className="rounded max-w-full mb-1 max-h-64 object-cover"
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
                          className="text-sm underline hover:no-underline"
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
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      {conversation.patientName} is typing
                      <span className="animate-pulse">...</span>
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
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
              title="Attach file"
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
            <Button 
              onClick={handleSendMessage} 
              disabled={!newMessage.trim() || uploading}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {uploading && (
            <p className="text-xs text-muted-foreground mt-2">Uploading file...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
