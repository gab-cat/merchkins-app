"use client"

import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Id } from '@/convex/_generated/dataModel'
import { ChatLayout } from '@/src/features/chats/components/chat-layout'
import { ChatsSidebarList } from '@/src/features/chats/components/chats-sidebar-list'
import { ChatThread } from '@/src/features/chats/components/chat-thread'
import { ChatInput } from '@/src/features/chats/components/chat-input'
import { useAuth } from '@clerk/nextjs'

export default function AdminChatDetailPage () {
  const params = useParams() as { id: string }
  const room = useQuery(api.chats.queries.index.getChatRoomById, { chatRoomId: params.id as Id<'chatRooms'> })
  const messages = useQuery(api.chats.queries.index.getMessages, { chatRoomId: params.id as Id<'chatRooms'>, limit: 100 })
  const sendMessage = useMutation(api.chats.mutations.index.sendMessage)
  const rooms = useQuery(api.chats.queries.index.getChatRooms, {})
  const { userId: clerkId } = useAuth()
  const me = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip')

  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  const loading = room === undefined || messages === undefined
  const list = messages ?? []

  async function handleSend (content: string) {
    setBusy(true)
    try {
      await sendMessage({ chatRoomId: params.id as Id<'chatRooms'>, content })
      setText('')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="py-12">Loading...</div>
  if (room === null) return <div className="py-12">Chat not found.</div>

  return (
    <div className="space-y-4">
      <ChatLayout
        title={room.name || 'Chat room'}
        subtitle={(room.embeddedParticipants || []).map((p: any) => p.email).join(', ')}
        sidebar={<ChatsSidebarList rooms={rooms || []} baseHref="/admin/chats" />}
      >
        <div className="flex h-full flex-col">
          <div className="min-h-0 flex-1">
            <ChatThread messages={list as any} currentUserId={me?._id ? String(me._id) : undefined} chatRoomId={String(params.id)} />
          </div>
          <div className="border-t">
            <ChatInput onSend={handleSend} disabled={!me} />
          </div>
        </div>
      </ChatLayout>
    </div>
  )
}


