"use client"

import React, { PropsWithChildren } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { ChatLayout } from '@/src/features/chats/components/chat-layout'
import { ChatsSidebarList } from '@/src/features/chats/components/chats-sidebar-list'

export default function AdminChatsLayout ({ children }: PropsWithChildren) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const orgSlug = searchParams.get('org')

  // Check if we're on an individual chat page (has /chats/[id] pattern)
  const isChatDetailPage = pathname.includes('/chats/') && pathname.split('/').length > 3

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : 'skip'
  )
  const rooms = useQuery(
    api.chats.queries.index.getChatRooms,
    orgSlug ? (organization === undefined ? 'skip' : { organizationId: organization?._id }) : {}
  )

  // Get chat room info if on detail page
  let chatRoomTitle = ""
  let chatRoomSubtitle = ""
  if (isChatDetailPage) {
    const chatId = pathname.split('/chats/')[1]?.split('?')[0]
    if (chatId) {
      const room = rooms?.find(r => r._id === chatId)
      if (room) {
        chatRoomTitle = room.name || 'Chat room'
        chatRoomSubtitle = (room.embeddedParticipants || []).map((p) => p.email).join(', ')
      }
    }
  }

  return (
    <div className="space-y-4">
      <ChatLayout
        title={chatRoomTitle}
        subtitle={chatRoomSubtitle}
        hideRightHeader={!isChatDetailPage}
        sidebar={
          <ChatsSidebarList
            rooms={(rooms) || []}
            baseHref={`/admin/chats${orgSlug ? `?org=${orgSlug}` : ''}`}
          />
        }
      >
        {children}
      </ChatLayout>
    </div>
  )
}


