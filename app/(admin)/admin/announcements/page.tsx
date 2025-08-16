"use client"

import React, { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Doc, Id } from '@/convex/_generated/dataModel'

type Announcement = Doc<"announcements">

export default function AdminAnnouncementsPage () {
  const [search, setSearch] = useState('')
  const [onlyActive, setOnlyActive] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')

  const result = useQuery(api.announcements.queries.index.getAnnouncements, {
    includeInactive: !onlyActive,
    category: categoryFilter.trim() || undefined,
    limit: 100,
    offset: 0,
  })
  const update = useMutation(api.announcements.mutations.index.updateAnnouncement)

  const loading = result === undefined
  const announcements = useMemo(() => result?.page ?? [], [result?.page])

  const filtered = useMemo(() => {
    if (!search) return announcements
    const q = search.toLowerCase()
    return announcements.filter((a: Announcement) =>
      [a.title || '', a.content || ''].join(' ').toLowerCase().includes(q)
    )
  }, [announcements, search])

  async function toggleActive (id: Id<"announcements">, isActive: boolean) {
    await update({ announcementId: id, isActive: !isActive })
  }

  async function togglePinned (id: Id<"announcements">, isPinned: boolean) {
    await update({ announcementId: id, isPinned: !isPinned })
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Announcements</h1>
          <p className="text-sm text-muted-foreground">Create and manage broadcast messages</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <Input placeholder="Filter by category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-48" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
            Only active
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          new Array(4).fill(null).map((_, i) => (
            <Card key={`skeleton-${i}`}>
              <CardHeader>
                <CardTitle className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-1/2 animate-pulse rounded bg-secondary" />
              </CardContent>
            </Card>
          ))
        ) : filtered.map((a: Announcement) => (
          <Card key={a._id}>
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-accent/60 px-2 py-0.5 text-xs text-accent-foreground">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary/70" />
                  <span className="truncate max-w-[120px]">{a.category || 'general'}</span>
                </span>
                <span className="truncate" title={a.title}>{a.title}</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant={a.isPinned ? 'secondary' : 'outline'} onClick={() => togglePinned(a._id, !!a.isPinned)}>
                  {a.isPinned ? 'Unpin' : 'Pin'}
                </Button>
                <Button size="sm" variant={a.isActive ? 'secondary' : 'outline'} onClick={() => toggleActive(a._id, !!a.isActive)}>
                  {a.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground line-clamp-2">{a.content}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!loading && filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">No announcements found.</div>
      )}
    </div>
  )
}


