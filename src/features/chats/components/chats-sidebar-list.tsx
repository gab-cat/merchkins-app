'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { Doc } from '@/convex/_generated/dataModel';
import { useCursorPagination } from '@/src/hooks/use-pagination';
import { api } from '@/convex/_generated/api';
import { LoadMore } from '@/src/components/ui/pagination';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Inbox, ChevronRight, Users, User, MessageCircle } from 'lucide-react';

interface ChatsSidebarListProps {
  rooms: Array<Doc<'chatRooms'>>;
  baseHref?: string;
}

type RoomListItem = Doc<'chatRooms'>;

type FilterType = 'ALL' | 'UNREAD' | 'DIRECT' | 'GROUP';

const filterConfig: Array<{ key: FilterType; label: string; icon: React.ElementType }> = [
  { key: 'ALL', label: 'All', icon: MessageCircle },
  { key: 'UNREAD', label: 'Unread', icon: MessageSquare },
  { key: 'DIRECT', label: 'Direct', icon: User },
  { key: 'GROUP', label: 'Groups', icon: Users },
];

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
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatRelativeDate(ts: number) {
  const now = Date.now();
  const diff = now - ts;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: new Date(ts).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
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
    .map((p) => p.email?.split('@')[0])
    .slice(0, 2)
    .join(', ');

  // Get first participant's avatar if available
  const firstParticipant = room.embeddedParticipants?.[0];
  const isGroup = room.type === 'group' || (room.embeddedParticipants?.length || 0) > 2;
  const hasUnread = 'unreadMessageCount' in room && (room as any).unreadMessageCount > 0;

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
      <Link
        prefetch={false}
        href={href}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group',
          'border border-transparent',
          'hover:bg-slate-50 hover:border-slate-200 hover:shadow-sm',
          isActive && 'bg-[#1d43d8]/5 border-[#1d43d8]/20 shadow-sm'
        )}
      >
        {/* Avatar */}
        <div className="relative">
          <Avatar
            className={cn(
              'h-11 w-11 shrink-0 ring-2 ring-offset-2',
              isActive ? 'ring-[#1d43d8]/30' : 'ring-transparent',
              hasUnread && !isActive && 'ring-[#adfc04]/50'
            )}
          >
            {firstParticipant?.imageUrl ? <AvatarImage src={firstParticipant.imageUrl} alt={displayName} /> : null}
            <AvatarFallback
              className={cn(
                'text-xs font-semibold',
                isActive ? 'bg-[#1d43d8] text-white' : hasUnread ? 'bg-[#1d43d8]/10 text-[#1d43d8]' : 'bg-slate-100 text-slate-600'
              )}
            >
              {isGroup ? <Users className="h-4 w-4" /> : initials}
            </AvatarFallback>
          </Avatar>
          {/* Online indicator placeholder */}
          {!isGroup && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span
              className={cn(
                'font-semibold text-sm truncate',
                isActive ? 'text-[#1d43d8]' : 'text-slate-900',
                hasUnread && !isActive && 'text-slate-900'
              )}
            >
              {displayName}
            </span>
            {room.updatedAt && (
              <span className={cn('text-[10px] shrink-0 font-medium', hasUnread ? 'text-[#1d43d8]' : 'text-slate-400')}>
                {formatRelativeTime(room.updatedAt)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className={cn('text-xs truncate flex-1', hasUnread ? 'text-slate-700 font-medium' : 'text-slate-500')}>
              {room.lastMessagePreview || participants || 'No messages yet'}
            </p>

            {/* Unread badge */}
            {hasUnread && (
              <span className="h-5 min-w-5 rounded-full bg-[#1d43d8] text-white text-[10px] font-bold flex items-center justify-center px-1.5 shadow-sm shadow-[#1d43d8]/25">
                {(room as any).unreadMessageCount > 99 ? '99+' : (room as any).unreadMessageCount}
              </span>
            )}

            {/* Chevron on hover */}
            <ChevronRight
              className={cn(
                'h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0',
                isActive && 'opacity-100 text-[#1d43d8]'
              )}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ChatsSidebarList({ rooms, baseHref = '/chats' }: ChatsSidebarListProps) {
  const pathname = usePathname();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');

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

  // Filter rooms based on selection
  const filteredList = useMemo(() => {
    if (selectedFilter === 'ALL') return list;
    if (selectedFilter === 'UNREAD') {
      return list.filter((r) => 'unreadMessageCount' in r && (r as any).unreadMessageCount > 0);
    }
    if (selectedFilter === 'DIRECT') {
      return list.filter((r) => r.type === 'direct' || (r.embeddedParticipants?.length || 0) <= 2);
    }
    if (selectedFilter === 'GROUP') {
      return list.filter((r) => r.type === 'group' || (r.embeddedParticipants?.length || 0) > 2);
    }
    return list;
  }, [list, selectedFilter]);

  // Group rooms by relative date
  const grouped = useMemo(() => {
    const map = new Map<string, RoomListItem[]>();
    for (const r of filteredList) {
      const key = formatRelativeDate(r.updatedAt || r._creationTime);
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [filteredList]);

  // Count for header badge
  const totalCount = list.length;
  const unreadCount = list.filter((r) => 'unreadMessageCount' in r && (r as any).unreadMessageCount > 0).length;

  if (list.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#1d43d8]/10 to-[#adfc04]/10 flex items-center justify-center">
            <Inbox className="h-8 w-8 text-[#1d43d8]/50" />
          </div>
          <h3 className="text-sm font-semibold mb-1 text-slate-900">No conversations yet</h3>
          <p className="text-xs text-slate-500">Start a chat to begin messaging</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter chips - horizontal scroll */}
      <div className="-mx-2 px-2">
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {filterConfig.map((f) => {
            const Icon = f.icon;
            const isSelected = selectedFilter === f.key;
            const count = f.key === 'UNREAD' ? unreadCount : f.key === 'ALL' ? totalCount : undefined;

            return (
              <button
                key={f.key}
                onClick={() => setSelectedFilter(f.key)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all duration-200',
                  isSelected ? 'bg-[#1d43d8] text-white shadow-md shadow-[#1d43d8]/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                <Icon className="h-3 w-3" />
                {f.label}
                {count !== undefined && count > 0 && (
                  <span className={cn('ml-0.5 text-[10px] font-bold', isSelected ? 'text-white/80' : 'text-slate-400')}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat list grouped by date */}
      <AnimatePresence mode="wait">
        {grouped.map(([label, roomList], groupIndex) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.05 }}
            className="space-y-1"
          >
            {/* Date label */}
            <div className="flex items-center gap-2 px-2 pt-2 pb-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Room cards */}
            {roomList.map((room, index) => {
              const href = `${baseHref}/${room._id}`;
              const isActive = pathname === href || pathname.includes(String(room._id));

              return (
                <React.Suspense key={String(room._id)} fallback={null}>
                  <ChatRoomItem room={room} href={href} isActive={isActive} index={index} />
                </React.Suspense>
              );
            })}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Filtered empty state */}
      {filteredList.length === 0 && list.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center px-4">
          <div className="h-10 w-10 mx-auto mb-2 rounded-xl bg-slate-100 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500">No {selectedFilter.toLowerCase()} conversations</p>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2 mt-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
              <div className="h-11 w-11 rounded-full bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded-full bg-slate-100 animate-pulse" />
                <div className="h-3 w-1/2 rounded-full bg-slate-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && !isLoading && (
        <div className="pt-2">
          <LoadMore onClick={loadMore} disabled={isLoading} isVisible={hasMore} />
        </div>
      )}
    </div>
  );
}

export default ChatsSidebarList;
