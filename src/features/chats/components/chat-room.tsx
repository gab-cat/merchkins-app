"use client"

import React, { useMemo } from 'react'
import { useMutation, useQuery } from 'convex/react'
import type { Id, Doc } from '@/convex/_generated/dataModel'
import { api } from '@/convex/_generated/api'
import { ChatLayout } from './chat-layout'
import { ChatsSidebarList } from './chats-sidebar-list'
import { ChatThread } from './chat-thread'
import { ChatInput } from './chat-input'
import { useAuth } from '@clerk/nextjs'

export function ChatRoom ({ roomId, hideSidebar = false }: { roomId: Id<'chatRooms'>; hideSidebar?: boolean }) {
  const room = useQuery(api.chats.queries.index.getChatRoomById, { chatRoomId: roomId })
  const messages = useQuery(api.chats.queries.index.getMessages, { chatRoomId: roomId, limit: 200 })
  const sendMessage = useMutation(api.chats.mutations.index.sendMessage)

  const { userId: clerkId } = useAuth()
  const me = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip')
  const rooms = useQuery(api.chats.queries.index.getChatRooms, {})

  const loading = room === undefined || messages === undefined
  const list = useMemo(() => messages || [], [messages])

  async function handleSend (content: string) {
    await sendMessage({ chatRoomId: roomId, content })
  }

  if (loading) return <div className="py-12">Loading...</div>
  if (room === null) return <div className="py-12">Chat not found or access denied.</div>

  return (
    <div className="container mx-auto px-3 py-4">
      <ChatLayout
        title={room.name || 'Chat room'}
        subtitle={(room.embeddedParticipants || []).map((p: { email: string }) => p.email).join(', ')}
        sidebar={hideSidebar ? undefined : <ChatsSidebarList rooms={rooms || []} />}
      >
        <div className="flex h-full flex-col">
          <div className="min-h-0 flex-1">
            <ChatThread messages={list as Doc<"chatMessages">[]} currentUserId={me?._id ? String(me._id) : undefined} chatRoomId={String(roomId)} />
          </div>
          <div className="border-t">
            <ChatInput onSend={handleSend} disabled={!me} />
          </div>
        </div>
      </ChatLayout>
    </div>
  )
}

export default ChatRoom


