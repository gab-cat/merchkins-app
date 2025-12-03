'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Doc } from '@/convex/_generated/dataModel';
import { useCursorPagination } from '@/src/hooks/use-pagination';
import { api } from '@/convex/_generated/api';
import { LoadMore } from '@/src/components/ui/pagination';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Clock, Inbox } from 'lucide-react';

interface ChatsSidebarListProps {
  rooms: Array<Doc<'chatRooms'>>;
  baseHref?: string;
}

type RoomListItem = Doc<'chatRooms'>;

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString();
}

function ChatRoomItem({ room, href, isActive, index }: { room: RoomListItem; href: string; isActive: boolean; index: number }) {
  // Get initials from room name or first participant
  const displayName = room.name || 'Direct Chat';
  const initials = displayName
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Get participant emails for subtitle
  const participants = (room.embeddedParticipants || [])
    .map((p) => p.email)
    .slice(0, 2)
    .join(', ');

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
      <Link
        prefetch={false}
        href={href}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
          'hover:bg-muted/70',
          isActive && 'bg-primary/10 border border-primary/20'
        )}
      >
        {/* Avatar */}
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className={cn('text-xs font-medium', isActive ? 'bg-primary text-white' : 'bg-muted')}>{initials}</AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={cn('font-medium text-sm truncate', isActive && 'text-primary')}>{displayName}</span>
            {room.updatedAt && <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(room.updatedAt)}</span>}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{room.lastMessagePreview || participants || 'No messages yet'}</p>
        </div>

        {/* Unread indicator (placeholder) */}
        {'unreadMessageCount' in room && (room as any).unreadMessageCount > 0 && (
          <span className="h-5 min-w-5 rounded-full bg-primary text-white text-xs font-medium flex items-center justify-center px-1.5">
            {(room as any).unreadMessageCount > 99 ? '99+' : (room as any).unreadMessageCount}
          </span>
        )}
      </Link>
    </motion.div>
  );
}

export function ChatsSidebarList({ rooms, baseHref = '/chats' }: ChatsSidebarListProps) {
  const pathname = usePathname();

  const { items, isLoading, hasMore, loadMore } = useCursorPagination<RoomListItem, Record<string, never>>({
    query: api.chats.queries.index.getChatRoomsPage,
    baseArgs: {},
    limit: 25,
    selectPage: (res: unknown) => {
      const result = res as {
        page?: ReadonlyArray<RoomListItem>;
        isDone?: boolean;
        continueCursor?: string | null;
      };
      return {
        page: (result.page || []) as ReadonlyArray<RoomListItem>,
        isDone: !!result.isDone,
        continueCursor: result.continueCursor ?? null,
      };
    },
  });

  const list: ReadonlyArray<RoomListItem> = items && items.length > 0 ? items : rooms;

  if (list.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium mb-1">No conversations yet</p>
        <p className="text-xs text-muted-foreground">Start a chat to begin messaging</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {list.map((room, index) => {
        const href = `${baseHref}/${room._id}`;
        const isActive = pathname === href || pathname.includes(String(room._id));

        return (
          <React.Suspense key={String(room._id)} fallback={null}>
            <ChatRoomItem room={room} href={href} isActive={isActive} index={index} />
          </React.Suspense>
        );
      })}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2 mt-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && !isLoading && <LoadMore onClick={loadMore} disabled={isLoading} isVisible={hasMore} />}
    </div>
  );
}

export default ChatsSidebarList;
