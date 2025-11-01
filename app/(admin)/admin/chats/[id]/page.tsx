"use client"

import React, { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id, Doc } from '@/convex/_generated/dataModel'
import { ChatThread } from '@/src/features/chats/components/chat-thread'
import { ChatInput } from '@/src/features/chats/components/chat-input'
import { useAuth } from '@clerk/nextjs'

type ChatMessage = Doc<"chatMessages">

export default function AdminChatDetailPage () {
  const params = useParams() as { id: string }
  const room = useQuery(api.chats.queries.index.getChatRoomById, { chatRoomId: params.id as Id<'chatRooms'> })
  const messages = useQuery(api.chats.queries.index.getMessages, { chatRoomId: params.id as Id<'chatRooms'>, limit: 100 })
  const sendMessage = useMutation(api.chats.mutations.index.sendMessage)
  const { userId: clerkId } = useAuth()
  const me = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip')

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  const messagesLoading = messages === undefined
  const list = messages ?? []

  async function handleSend (content: string) {
    await sendMessage({ chatRoomId: params.id as Id<'chatRooms'>, content })
  }

  if (room === null) return <div className="py-12">Chat not found.</div>

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        {messagesLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading messages...</div>
          </div>
        ) : (
          <ChatThread messages={list as ChatMessage[]} currentUserId={me?._id ? String(me._id) : undefined} chatRoomId={String(params.id)} />
        )}
      </div>
      <div className="border-t">
        <ChatInput onSend={handleSend} disabled={!me || messagesLoading} />
      </div>
    </div>
  )
}


