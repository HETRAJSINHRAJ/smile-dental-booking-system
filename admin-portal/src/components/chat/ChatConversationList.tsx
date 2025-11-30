'use client';

import { Conversation } from '@/types/chat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';

interface ChatConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  loading: boolean;
}

export function ChatConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  loading,
}: ChatConversationListProps) {
  return (
    <Card className="h-[calc(100vh-20rem)]">
      <CardHeader className="border-b">
        <CardTitle className="text-lg">
          Conversations {!loading && `(${conversations.length})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-26rem)]">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm mt-1">Patient messages will appear here</p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className={`w-full p-4 text-left hover:bg-accent transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-sm truncate">{conv.patientName}</h3>
                        {conv.unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-2 shrink-0">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1 truncate">
                        {conv.patientEmail}
                      </p>
                      {conv.lastMessage && (
                        <p className="text-sm text-foreground/70 truncate mb-1">
                          {conv.lastMessage}
                        </p>
                      )}
                      {conv.lastMessageTimestamp && (
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.lastMessageTimestamp), { 
                            addSuffix: true 
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
