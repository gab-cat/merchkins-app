"use client"

import React, { PropsWithChildren } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { ChatLayout } from '@/src/features/chats/components/chat-layout'
import { ChatsSidebarList } from '@/src/features/chats/components/chats-sidebar-list'

export default function ChatsLayout ({ children }: PropsWithChildren) {
  const rooms = useQuery(api.chats.queries.index.getChatRooms, {}) as Array<{ _id: string }> | undefined

  return (
    <div className="container mx-auto px-3 py-4">
      <ChatLayout title="" hideRightHeader sidebar={<ChatsSidebarList rooms={(rooms as unknown as any[]) || []} />}>
        {children}
      </ChatLayout>
    </div>
  )
}


