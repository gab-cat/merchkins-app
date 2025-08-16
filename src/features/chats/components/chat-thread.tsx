"use client"

import React, { useEffect, useMemo, useRef } from 'react'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { MessageBubble } from './message-bubble'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

interface ChatThreadProps {
  messages: Array<Doc<'chatMessages'>>
  currentUserId?: string
  chatRoomId?: string
}

export function ChatThread ({ messages, currentUserId, chatRoomId }: ChatThreadProps) {
  const ref = useRef<HTMLDivElement>(null)
  const list = useMemo(() => messages || [], [messages])
  const markRead = useMutation(api.chats.mutations.index.markRoomRead)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [list])

  useEffect(() => {
    if (chatRoomId) {
      markRead({ chatRoomId: chatRoomId as Id<'chatRooms'> })
    }
  }, [chatRoomId, markRead, list])

  return (
    <div ref={ref} className="flex h-full flex-col gap-2 overflow-y-auto p-4">
      {list.map((m) => (
        <MessageBubble key={String(m._id)} message={m} isMe={String(m.senderId) === String(currentUserId)} />
      ))}
      {list.length === 0 && (
        <div className="p-4 text-center text-sm text-muted-foreground">No messages yet.</div>
      )}
    </div>
  )
}

export default ChatThread


