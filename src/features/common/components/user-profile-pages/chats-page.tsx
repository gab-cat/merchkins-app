"use client"

import React from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Clock } from 'lucide-react'
import { Doc } from '@/convex/_generated/dataModel'
import Link from 'next/link'

type ChatRoom = Doc<"chatRooms">

export function ChatsPage() {
  const rooms = useQuery(api.chats.queries.index.getChatRooms, {}) as ChatRoom[] | undefined

  if (rooms === undefined) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-16 w-full bg-muted animate-pulse rounded" />
        <div className="h-16 w-full bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No chats yet</h3>
        <p className="text-muted-foreground mb-4">Start a conversation with support</p>
        <Button asChild>
          <Link href="/chats">Start Chat</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Chats</h3>
        <Button variant="outline" size="sm" asChild>
          <Link href="/chats">View All</Link>
        </Button>
      </div>
      
      <div className="space-y-2">
        {rooms.slice(0, 5).map((room) => (
          <Card key={room._id} className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {room.name || `Chat ${room._id.slice(-6)}`}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(room._creationTime).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/chats/${room._id}`}>Open</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
