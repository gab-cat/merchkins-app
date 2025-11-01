"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Doc } from '@/convex/_generated/dataModel'
import { MessageSquare, Search, Plus, Users } from 'lucide-react'
import { showToast, promiseToast } from '@/lib/toast'

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
    return rooms.filter((r: Doc<'chatRooms'>) => (r.name || '').toLowerCase().includes(q))
  }, [rooms, search])

  const loading = organization === undefined || rooms === undefined

  async function handleCreateChat() {
    if (!organization) return

    try {
      await promiseToast(
        createChatRoom({
          type: 'group',
          organizationId: organization._id,
          name: `Support — ${organization.name}`,
        }),
        {
          loading: 'Creating chat room...',
          success: 'Chat room created! Redirecting...',
          error: 'Failed to create chat room'
        }
      )

      const roomId = await createChatRoom({
        type: 'group',
        organizationId: organization._id,
        name: `Support — ${organization.name}`,
      })

      router.push(`/chats/${roomId}`)
    } catch {
      showToast({
        type: 'error',
        title: 'Unable to start chat',
        description: 'You may need to join the organization first.'
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="h-8 w-8" />
          Chats
        </h1>
        <p className="text-muted-foreground">Connect with organizations and support teams</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              My chat rooms
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search rooms..."
                  className="pl-9 h-9"
                />
              </div>
              {organization && (
                <Button
                  size="sm"
                  onClick={handleCreateChat}
                  className="hover:scale-105 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start chat
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              {new Array(3).fill(null).map((_, i) => (
                <div key={`skeleton-${i}`} className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-secondary" />
                    <div className="h-3 w-48 rounded bg-secondary" />
                  </div>
                  <div className="h-8 w-16 rounded bg-secondary" />
                </div>
              ))}
            </div>
          ) : !rooms || rooms.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No chat rooms yet</h3>
              <p className="text-muted-foreground mb-6">Start a conversation with an organization</p>
              {organization && (
                <Button onClick={handleCreateChat} className="hover:scale-105 transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Start your first chat
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {(filtered || []).map((r: Doc<'chatRooms'>) => (
                <Link
                  key={r._id}
                  href={`/chats/${r._id}`}
                  className="block group"
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 hover:border-primary/20 transition-all duration-200">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {r.name || 'Direct chat'}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {r.lastMessagePreview || 'No messages yet'}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">
                        {r.lastMessageAt ? new Date(r.lastMessageAt).toLocaleDateString() : ''}
                      </span>
                      <Button size="sm" variant="outline" className="h-7 text-xs hover:scale-105 transition-all duration-200">
                        Open
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}

              {filtered.length === 0 && search.trim() && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No chat rooms match &quot;{search}&quot;</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


