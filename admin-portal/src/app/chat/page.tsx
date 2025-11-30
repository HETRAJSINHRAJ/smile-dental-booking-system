'use client';

import { useState, useEffect } from 'react';
import { ChatService } from '@/lib/chat/ChatService';
import { Conversation } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { MessageSquare, Users, MessageCircle } from 'lucide-react';
import { ChatConversationList } from '@/components/chat/ChatConversationList';
import { ChatMessagePanel } from '@/components/chat/ChatMessagePanel';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatManagementPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const unsubscribe = ChatService.listenToConversations((convs) => {
        setConversations(convs);
        setLoading(false);
        
        // Update selected conversation if it's in the new list
        if (selectedConversation) {
          const updated = convs.find(c => c.id === selectedConversation.id);
          if (updated) {
            setSelectedConversation(updated);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Chat</h1>
          <p className="text-muted-foreground mt-2">
            Manage patient conversations and support requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Conversations</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-2xl font-bold mt-2">{conversations.length}</p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-2xl font-bold mt-2">{totalUnread}</p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
              <p className="text-2xl font-bold mt-2">100%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ChatConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            loading={loading}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedConversation ? (
            <ChatMessagePanel 
              key={selectedConversation.id}
              conversation={selectedConversation} 
            />
          ) : (
            <Card className="h-[calc(100vh-20rem)] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-2">Choose a patient conversation to view messages</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
