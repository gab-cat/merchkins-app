"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function ChatsPage () {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const orgSlug = useMemo(() => {
    const qp = searchParams?.get('org') || undefined
    if (qp && qp.trim().length > 0) return qp
    if (!pathname) return undefined
    const segments = pathname.split('/').filter(Boolean)
    if (segments[0] === 'o' && segments[1]) return segments[1]
    return undefined
  }, [pathname, searchParams])

  const organization = useQuery(
    api.organizations.queries.index.getOrganizationBySlug,
    orgSlug ? { slug: orgSlug } : ('skip' as unknown as { slug: string })
  )

  const rooms = useQuery(
    api.chats.queries.index.getChatRooms,
    organization?._id ? { organizationId: organization._id } : {}
  )
  const createChatRoom = useMutation(api.chats.mutations.index.createChatRoom)

  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    if (!rooms) return []
    const q = search.trim().toLowerCase()
    if (!q) return rooms
    return rooms.filter((r: any) => (r.name || '').toLowerCase().includes(q))
  }, [rooms, search])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Chats</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>My chat rooms</CardTitle>
          <div className="flex items-center gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rooms" className="h-8 w-48" />
            {organization && (
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    const roomId = await createChatRoom({
                      type: 'group',
                      organizationId: organization._id,
                      name: `Support — ${organization.name}`,
                    })
                    router.push(`/chats/${roomId}`)
                  } catch (err) {
                    alert('Unable to start chat. You may need to join the organization first.')
                  }
                }}
              >
                Start chat with {organization?.name}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {(filtered || []).map((r: any) => (
              <div key={r._id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{r.name || 'Direct chat'}</div>
                  <div className="truncate text-xs text-muted-foreground">{r.lastMessagePreview || 'No messages yet'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{r.lastMessageAt ? new Date(r.lastMessageAt).toLocaleString() : ''}</span>
                  <Link href={`/chats/${r._id}`}>
                    <Button size="sm" variant="outline">Open</Button>
                  </Link>
                </div>
              </div>
            ))}
            {(!rooms || rooms.length === 0) && (
              <div className="py-8 text-sm text-muted-foreground">No chat rooms yet.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


