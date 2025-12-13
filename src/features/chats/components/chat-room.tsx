'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { useQuery } from 'convex-helpers/react/cache/hooks';
import type { Id, Doc } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api';
import { ChatLayout } from './chat-layout';
import { ChatsSidebarList } from './chats-sidebar-list';
import { ChatThread } from './chat-thread';
import { ChatInput } from './chat-input';
import { ChatEmptyState } from './chat-empty-state';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

function ChatRoomSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className={`space-y-1 ${i % 2 === 0 ? 'items-end' : ''}`}>
              <Skeleton className={`h-4 w-16 rounded-full`} />
              <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-48' : 'w-64'} rounded-2xl`} />
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t">
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function ChatRoom({ roomId, hideSidebar = false }: { roomId: Id<'chatRooms'>; hideSidebar?: boolean }) {
  const room = useQuery(api.chats.queries.index.getChatRoomById, { chatRoomId: roomId });
  const messages = useQuery(api.chats.queries.index.getMessages, { chatRoomId: roomId, limit: 200 });
  const sendMessage = useMutation(api.chats.mutations.index.sendMessage);
  const setTyping = useMutation(api.chats.mutations.index.setTyping);
  const typingUsers = useQuery(api.chats.queries.index.getTypingUsers, { chatRoomId: roomId });

  const { userId: clerkId } = useAuth();
  const me = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip');
  const rooms = useQuery(api.chats.queries.index.getChatRooms, {});

  const [replyToId, setReplyToId] = useState<string | null>(null);

  const loading = room === undefined || messages === undefined;
  const list = useMemo(() => messages || [], [messages]);

  // Get typing users excluding self
  const othersTyping = useMemo(() => {
    if (!typingUsers || !me) return [];
    return typingUsers.filter((t: any) => String(t.userId) !== String(me._id)).map((t: any) => t.userName || 'Someone');
  }, [typingUsers, me]);

  // Get first participant for avatar
  const otherParticipant = useMemo(() => {
    if (!room?.embeddedParticipants) return null;
    return room.embeddedParticipants.find((p: any) => me && String(p.userId) !== String(me._id));
  }, [room, me]);

  const handleSend = useCallback(
    async (content: string) => {
      await sendMessage({
        chatRoomId: roomId,
        content,
        replyToId: replyToId as Id<'chatMessages'> | undefined,
      });
      setReplyToId(null);
    },
    [roomId, sendMessage, replyToId]
  );

  const handleTyping = useCallback(() => {
    setTyping({ chatRoomId: roomId, isTyping: true });
  }, [roomId, setTyping]);

  const handleReply = useCallback((messageId: string) => {
    setReplyToId(messageId);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-3 py-4">
        <ChatLayout title="" hideRightHeader sidebar={hideSidebar ? undefined : <ChatsSidebarList rooms={rooms || []} />}>
          <ChatRoomSkeleton />
        </ChatLayout>
      </div>
    );
  }

  if (room === null) {
    return (
      <div className="container mx-auto px-3 py-4">
        <ChatLayout title="" hideRightHeader sidebar={hideSidebar ? undefined : <ChatsSidebarList rooms={rooms || []} />}>
          <ChatEmptyState type="no-selection" />
        </ChatLayout>
      </div>
    );
  }

  const displayName = room.name || otherParticipant?.firstName || 'Chat';
  const subtitle = (room.embeddedParticipants || [])
    .map((p: { email: string }) => p.email.split('@')[0])
    .slice(0, 3)
    .join(', ');

  return (
    <div className="container mx-auto px-3 py-4">
      <ChatLayout
        title={displayName}
        subtitle={subtitle}
        avatarUrl={otherParticipant?.imageUrl}
        isOnline={true}
        sidebar={hideSidebar ? undefined : <ChatsSidebarList rooms={rooms || []} />}
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col">
          <div className="min-h-0 flex-1">
            <ChatThread
              messages={list as Doc<'chatMessages'>[]}
              currentUserId={me?._id ? String(me._id) : undefined}
              chatRoomId={String(roomId)}
              onReply={handleReply}
            />
          </div>
          <div className="border-t border-slate-100">
            <ChatInput
              onSend={handleSend}
              disabled={!me}
              typingUsers={othersTyping}
              onTyping={handleTyping}
              placeholder={replyToId ? 'Type your reply...' : 'Type a message...'}
            />
          </div>
        </motion.div>
      </ChatLayout>
    </div>
  );
}

export default ChatRoom;
