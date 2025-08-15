"use client"

import React, { PropsWithChildren } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { ChatLayout } from '@/src/features/chats/components/chat-layout'
import { ChatsSidebarList } from '@/src/features/chats/components/chats-sidebar-list'

export default function AdminChatsLayout ({ children }: PropsWithChildren) {
  const searchParams = useSearchParams()
  const orgSlug = searchParams.get('org')
  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : 'skip'
  )
  const rooms = useQuery(
    api.chats.queries.index.getChatRooms,
    orgSlug ? (organization === undefined ? 'skip' : { organizationId: organization?._id }) : {}
  )

  return (
    <div className="space-y-4">
      <ChatLayout
        title=""
        hideRightHeader
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


