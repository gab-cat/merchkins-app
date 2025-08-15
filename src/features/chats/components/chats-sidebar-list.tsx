"use client"

import React from 'react'
import Link from 'next/link'
import type { Doc } from '@/convex/_generated/dataModel'
import { useCursorPagination } from '@/src/hooks/use-pagination'
import { api } from '@/convex/_generated/api'
import { LoadMore } from '@/src/components/ui/pagination'

interface ChatsSidebarListProps {
  rooms: Array<Doc<'chatRooms'>>
  baseHref?: string
}

type RoomListItem = Doc<'chatRooms'>

export function ChatsSidebarList ({ rooms, baseHref = '/chats' }: ChatsSidebarListProps) {
  const { items, isLoading, hasMore, loadMore } = useCursorPagination<RoomListItem, Record<string, never>>({
    query: api.chats.queries.index.getChatRoomsPage,
    baseArgs: {},
    limit: 25,
    selectPage: (res: { page?: ReadonlyArray<RoomListItem>, isDone?: boolean, continueCursor?: string | null }) => ({
      page: res.page || [],
      isDone: !!res.isDone,
      continueCursor: res.continueCursor ?? null,
    })
  })
  const list: ReadonlyArray<RoomListItem> = (items && items.length > 0) ? items : rooms

  return (
    <div className="space-y-1">
      {list.map((r) => (
        <React.Suspense key={String(r._id)} fallback={null}>
          <Link prefetch={false} href={`${baseHref}/${r._id}`} className="block rounded p-2 hover:bg-accent">
            <div className="truncate text-sm font-medium">{r.name || 'Direct chat'}</div>
            <div className="truncate text-xs text-muted-foreground">{r.lastMessagePreview || 'No messages yet'}</div>
          </Link>
        </React.Suspense>
      ))}
      {list.length === 0 && (
        <div className="p-4 text-center text-sm text-muted-foreground">No chats yet.</div>
      )}
      <LoadMore onClick={loadMore} disabled={isLoading} isVisible={hasMore} />
    </div>
  )
}

export default ChatsSidebarList


