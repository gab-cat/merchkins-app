"use client"

import React, { useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Doc } from '@/convex/_generated/dataModel'

type ChatRoom = Doc<"chatRooms">

export default function Page () {
  const pathname = usePathname()
  const router = useRouter()
  const orgSlug = useMemo(() => {
    if (!pathname) return undefined
    const segments = pathname.split('/').filter(Boolean)
    if (segments[0] === 'o' && segments[1]) return segments[1]
    return undefined
  }, [pathname])

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  )
  const rooms = useQuery(
    api.chats.queries.index.getChatRooms,
    organization?._id ? { organizationId: organization._id } : {}
  ) as ChatRoom[] | undefined

  const latest = useMemo(() => {
    const list = rooms || []
    return list[0]?._id as string | undefined
  }, [rooms])

  useEffect(() => {
    if (organization && latest) {
      router.replace(`/o/${orgSlug}/chats/${latest}`)
    }
  }, [organization, latest, orgSlug, router])

  return <div className="py-12">Loading chat…</div>
}



