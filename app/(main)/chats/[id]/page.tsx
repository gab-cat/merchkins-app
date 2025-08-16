import React from 'react'
import type { Id } from '@/convex/_generated/dataModel'
import { ChatRoom } from '@/src/features/chats/components/chat-room'

export default function Page ({ params }: { params: Promise<{ id: string }> }) {
  // App router: params is a promise per project convention
  async function Inner () {
    const { id } = await params
    return <ChatRoom roomId={id as Id<'chatRooms'>} />
  }
  // Render async wrapper
  return <Inner />
}


