"use client"

import React, { useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function AdminChatsPage () {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orgSlug = searchParams.get('org')
  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : 'skip'
  )
  const rooms = useQuery(
    api.chats.queries.index.getChatRooms,
    orgSlug
      ? (organization === undefined ? 'skip' : { organizationId: organization?._id })
      : {},
  ) as Array<{ _id: string }> | undefined

  const latest = useMemo(() => {
    const list = rooms || []
    return list[0]?._id as string | undefined
  }, [rooms])

  useEffect(() => {
    if (latest) {
      router.replace(`/admin/chats/${latest}${orgSlug ? `?org=${orgSlug}` : ''}`)
    }
  }, [latest, router, orgSlug])

  return <div className="py-12">Loading chat…</div>
}


