'use client';

import React, { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id, Doc } from '@/convex/_generated/dataModel';
import { ChatThread } from '@/src/features/chats/components/chat-thread';
import { ChatInput } from '@/src/features/chats/components/chat-input';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

type ChatMessage = Doc<'chatMessages'>;

export default function AdminChatDetailPage() {
  const params = useParams() as { id: string };
  const room = useQuery(api.chats.queries.index.getChatRoomById, { chatRoomId: params.id as Id<'chatRooms'> });
  const messages = useQuery(api.chats.queries.index.getMessages, { chatRoomId: params.id as Id<'chatRooms'>, limit: 100 });
  const sendMessage = useMutation(api.chats.mutations.index.sendMessage);
  const { userId: clerkId } = useAuth();
  const me = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip');

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const messagesLoading = messages === undefined;
  const list = messages ?? [];

  async function handleSend(content: string) {
    await sendMessage({ chatRoomId: params.id as Id<'chatRooms'>, content });
  }

  if (room === null) return <div className="py-12">Chat not found.</div>;

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        {messagesLoading ? (
          <div className="flex h-full flex-col gap-2 overflow-y-auto p-4 bg-card">
            {/* Loading skeleton messages */}
            {new Array(5).fill(null).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className={`flex items-end gap-2 ${i % 3 === 0 ? 'justify-end' : 'justify-start'}`}
              >
                {i % 3 !== 0 && <Skeleton className="h-7 w-7 rounded-full shrink-0" />}
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                    i % 3 === 0 ? 'bg-muted rounded-br-sm' : 'bg-muted rounded-bl-sm'
                  }`}
                >
                  <Skeleton className={`h-4 ${i % 2 === 0 ? 'w-48' : 'w-32'} rounded`} />
                  <Skeleton className="h-3 w-16 rounded mt-2" />
                </div>
                {i % 3 === 0 && <Skeleton className="h-7 w-7 rounded-full shrink-0" />}
              </div>
            ))}
            {/* Loading indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <MessageSquare className="h-4 w-4 text-muted-foreground animate-pulse" />
              <span className="text-xs text-muted-foreground">Loading messages...</span>
            </div>
          </div>
        ) : (
          <ChatThread messages={list as ChatMessage[]} currentUserId={me?._id ? String(me._id) : undefined} chatRoomId={String(params.id)} />
        )}
      </div>
      <div className="border-t">
        <ChatInput onSend={handleSend} disabled={!me || messagesLoading} />
      </div>
    </div>
  );
}
