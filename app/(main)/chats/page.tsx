"use client"

import React, { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'

type ChatRoom = Doc<"chatRooms">

export default function Page () {
  const router = useRouter()
  const rooms = useQuery(api.chats.queries.index.getChatRooms, {}) as ChatRoom[] | undefined
  const latest = useMemo(() => {
    const list = rooms || []
    return list[0]?._id as string | undefined
  }, [rooms])
  useEffect(() => {
    if (latest) router.replace(`/chats/${latest}`)
  }, [latest, router])
  return <div className="py-12">Loading chat…</div>
}


