"use client"

import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SuperAdminAnnouncementsPage () {
  const [target, setTarget] = useState<'ALL' | 'STAFF' | 'CUSTOMERS' | 'MERCHANTS' | 'ADMINS'>('ALL')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [level, setLevel] = useState<'INFO' | 'WARNING' | 'CRITICAL'>('INFO')
  const [isPinned, setIsPinned] = useState(false)
  const [category, setCategory] = useState('')

  const announcements = useQuery(api.announcements.queries.index.getAnnouncements, {
    targetAudience: target,
    includeInactive: false,
    limit: 100,
  }) as unknown as { page?: Array<any> }

  const createAnnouncement = useMutation(api.announcements.mutations.index.createAnnouncement)
  const updateAnnouncement = useMutation(api.announcements.mutations.index.updateAnnouncement)
  const deleteAnnouncement = useMutation(api.announcements.mutations.index.deleteAnnouncement)

  async function handleCreate (e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    await createAnnouncement({
      title: title.trim(),
      content: content.trim(),
      contentType: 'TEXT',
      type: 'SYSTEM',
      level,
      targetAudience: target,
      isPinned: !!isPinned,
      category: category.trim() || undefined,
      publishedAt: Date.now(),
    })
    setTitle('')
    setContent('')
    setIsPinned(false)
    setCategory('')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={target} onChange={(e) => setTarget(e.target.value as any)}>
              <option value="ALL">All</option>
              <option value="STAFF">Staff</option>
              <option value="CUSTOMERS">Customers</option>
              <option value="MERCHANTS">Merchants</option>
              <option value="ADMINS">Admins</option>
            </select>
          </div>
          <div className="rounded border">
            <div className="grid grid-cols-12 border-b bg-muted/40 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <div className="col-span-5">Title</div>
              <div className="col-span-3">Audience</div>
              <div className="col-span-2">Level</div>
              <div className="col-span-2">Pinned</div>
            </div>
            <div>
               {(announcements?.page || []).map((a: any) => (
                <div key={a._id} className="grid grid-cols-12 items-center px-3 py-2 hover:bg-secondary">
                  <div className="col-span-5 text-sm flex items-center gap-2">
                    <span className="inline-flex min-w-0 max-w-[50%] items-center gap-1 rounded-md bg-accent/60 px-2 py-0.5 text-xs text-accent-foreground">
                      <span className="inline-block h-2 w-2 rounded-full bg-primary/70" />
                      <span className="truncate">{a.category || 'general'}</span>
                    </span>
                    <span className="truncate">{a.title}</span>
                  </div>
                  <div className="col-span-3 text-xs text-muted-foreground">{a.targetAudience}</div>
                  <div className="col-span-2 text-xs">{a.level}</div>
                  <div className="col-span-2 flex items-center justify-end gap-2 text-xs">
                    <span>{a.isPinned ? 'Pinned' : ''}</span>
                    <Button size="sm" variant="outline" onClick={() => updateAnnouncement({ announcementId: a._id, isPinned: !a.isPinned } as any)}>{a.isPinned ? 'Unpin' : 'Pin'}</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteAnnouncement({ announcementId: a._id } as any)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create announcement</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="ann-title">Title</label>
              <Input id="ann-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="ann-content">Content</label>
              <textarea id="ann-content" className="h-24 w-full rounded-md border bg-background px-3 py-2 text-sm" value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
                <div>
                  <label className="mb-1 block text-sm font-medium" htmlFor="ann-category">Category</label>
                  <Input id="ann-category" placeholder="e.g. maintenance, promo" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="ann-level">Level</label>
                <select id="ann-level" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={level} onChange={(e) => setLevel(e.target.value as any)}>
                  <option value="INFO">Info</option>
                  <option value="WARNING">Warning</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <label className="mt-7 inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
                Pinned
              </label>
            </div>
            <div>
              <Button type="submit" disabled={!title.trim() || !content.trim()}>Publish</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


