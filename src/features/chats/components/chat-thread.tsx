'use client';

import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { MessageBubble } from './message-bubble';
import { ChatEmptyState } from './chat-empty-state';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatThreadProps {
  messages: Array<Doc<'chatMessages'>>;
  currentUserId?: string;
  chatRoomId?: string;
  onReply?: (messageId: string) => void;
}

function formatDateDivider(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function ChatThread({ messages, currentUserId, chatRoomId, onReply }: ChatThreadProps) {
  const ref = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const list = useMemo(() => messages || [], [messages]);
  const markRead = useMutation(api.chats.mutations.index.markRoomRead);
  const togglePinMessage = useMutation(api.chats.mutations.index.togglePinMessage);
  const deleteMessage = useMutation(api.chats.mutations.index.deleteMessage);
  const reactToMessage = useMutation(api.chats.mutations.index.reactToMessage);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: Doc<'chatMessages'>[] }[] = [];
    let currentDate = '';

    for (const msg of list) {
      const msgDate = formatDateDivider(msg.createdAt);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }

    return groups;
  }, [list]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (ref.current && bottomRef.current) {
      // Use instant scroll on initial load, smooth for subsequent updates
      const behavior = isInitialLoad.current ? 'auto' : 'smooth';
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior,
      });
      // Mark initial load as complete after first scroll
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
      }
    }
  }, [list]);

  // Track scroll position for scroll-to-bottom button
  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    const { scrollTop, scrollHeight, clientHeight } = ref.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  }, []);

  useEffect(() => {
    const container = ref.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Mark room as read
  useEffect(() => {
    if (chatRoomId) {
      markRead({ chatRoomId: chatRoomId as Id<'chatRooms'> });
    }
  }, [chatRoomId, markRead, list]);

  // Action handlers
  const handleReact = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        await reactToMessage({
          messageId: messageId as Id<'chatMessages'>,
          emoji,
        });
      } catch {
        // Silently fail
      }
    },
    [reactToMessage]
  );

  const handlePin = useCallback(
    async (messageId: string, currentlyPinned: boolean) => {
      try {
        await togglePinMessage({ messageId: messageId as Id<'chatMessages'>, isPinned: !currentlyPinned });
      } catch {
        // Silently fail
      }
    },
    [togglePinMessage]
  );

  const handleDelete = useCallback(
    async (messageId: string) => {
      try {
        await deleteMessage({ messageId: messageId as Id<'chatMessages'> });
      } catch {
        // Silently fail
      }
    },
    [deleteMessage]
  );

  const scrollToBottom = useCallback(() => {
    if (ref.current) {
      // Scroll the container, not the entire page
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  if (list.length === 0) {
    return <ChatEmptyState type="no-messages" />;
  }

  return (
    <div ref={ref} className="relative flex h-full flex-col overflow-y-auto bg-gradient-to-b from-slate-50/50 to-white">
      {/* Messages */}
      <div className="flex-1 p-4 space-y-6">
        <AnimatePresence mode="popLayout">
          {groupedMessages.map((group, groupIndex) => (
            <motion.div
              key={group.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.05 }}
              className="space-y-3"
            >
              {/* Date divider */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide bg-white px-2">{group.date}</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Messages in group */}
              <div className="space-y-2">
                {group.messages.map((m, msgIndex) => {
                  const isMe = String(m.senderId) === String(currentUserId);
                  const prevMsg = msgIndex > 0 ? group.messages[msgIndex - 1] : null;
                  const showAvatar = !prevMsg || String(prevMsg.senderId) !== String(m.senderId);

                  return (
                    <MessageBubble
                      key={String(m._id)}
                      message={m}
                      isMe={isMe}
                      showAvatar={showAvatar}
                      onReply={onReply}
                      onReact={handleReact}
                      onPin={handlePin}
                      onDelete={handleDelete}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
          >
            <Button
              onClick={scrollToBottom}
              size="sm"
              className="h-9 px-3 rounded-full bg-white shadow-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#1d43d8]"
            >
              <ArrowDown className="h-4 w-4 mr-1" />
              New messages
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatThread;
