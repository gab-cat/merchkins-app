"use client"

import React, { useMemo, useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Id } from '@/convex/_generated/dataModel'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { showToast } from '@/lib/toast'

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

function StatusBadge ({ value }: { value: TicketStatus }) {
  const color = value === 'OPEN' ? 'secondary' : value === 'CLOSED' ? 'destructive' : 'default'
  return <Badge variant={color as 'secondary' | 'destructive' | 'default'}>{value}</Badge>
}

export default function AdminTicketDetailPage () {
  const params = useParams() as { id: string }
  const ticket = useQuery(api.tickets.queries.index.getTicketById, { ticketId: params.id as Id<'tickets'> })
  const updates = useQuery(api.tickets.queries.index.getTicketUpdates, { ticketId: params.id as Id<'tickets'>, limit: 50, offset: 0 })
  const addUpdate = useMutation(api.tickets.mutations.index.addTicketUpdate)
  const markRead = useMutation(api.tickets.mutations.index.markTicketRead)
  const assignTicket = useMutation(api.tickets.mutations.index.assignTicket)

  const [busy, setBusy] = useState(false)

  const loading = ticket === undefined || updates === undefined
  const list = useMemo(() => updates?.updates ?? [], [updates])

  // Mark as read when opened and updates arrive
  useEffect(() => {
    if (ticket && updates) {
      markRead({ ticketId: ticket._id as Id<'tickets'> })
    }
  }, [ticket, updates, markRead])

  async function setStatus (next: TicketStatus) {
    if (!ticket) return
    setBusy(true)
    try {
      await addUpdate({
        ticketId: ticket._id as Id<'tickets'>,
        content: `Status changed to ${next}`,
        updateType: 'STATUS_CHANGE',
        status: next,
        previousValue: ticket.status,
        newValue: next,
        isInternal: false,
      })
    } finally {
      setBusy(false)
    }
  }

  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const [commentText, setCommentText] = useState('')

  async function submitComment () {
    if (!commentText.trim() || !ticket) return
    setBusy(true)
    try {
      await addUpdate({ ticketId: ticket._id, content: commentText.trim(), updateType: 'COMMENT', isInternal: false })
      setCommentText('')
      setIsCommentOpen(false)
    } finally {
      setBusy(false)
    }
  }

  const members = useQuery(
    api.organizations.queries.index.getOrganizationMembers,
    ticket?.organizationId
      ? { organizationId: ticket.organizationId, isActive: true, limit: 100 }
      : ('skip' as unknown as { organizationId: Id<'organizations'> })
  )
  interface OrganizationMemberLite {
    userId: Id<'users'>
    role: 'ADMIN' | 'STAFF' | 'MEMBER'
    userInfo: { firstName?: string; lastName?: string; email: string }
  }
  const eligibleAssignees = useMemo<ReadonlyArray<OrganizationMemberLite>>(() => {
    const page = (members as { page?: ReadonlyArray<OrganizationMemberLite> } | undefined)?.page || []
    return page.filter((m) => m.role === 'STAFF' || m.role === 'MEMBER')
  }, [members])

  async function handleAssign (assigneeId: string) {
    if (!ticket) return
    try {
      await assignTicket({ ticketId: ticket._id as Id<'tickets'>, assigneeId: assigneeId as Id<'users'> })
      showToast({ type: 'success', title: 'Ticket assigned' })
    } catch (err: unknown) {
      const error = err as Error
      showToast({ type: 'error', title: error?.message || 'Failed to assign ticket' })
    }
  }

  if (loading) return <div className="py-12">Loading...</div>
  if (ticket === null) return <div className="py-12">Ticket not found.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ticket #{ticket._id}</h1>
          <div className="mt-1 text-sm text-muted-foreground">{ticket.title}</div>
        </div>
        <StatusBadge value={ticket.status} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Status</span>
        {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((s) => (
          <Button key={s} size="sm" variant={ticket.status === s ? 'secondary' : 'outline'} disabled={busy} onClick={() => setStatus(s)}>
            {s}
          </Button>
        ))}
        <Separator orientation="vertical" className="h-6" />
        <Dialog open={isCommentOpen} onOpenChange={setIsCommentOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="default" disabled={busy}>Add comment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add comment</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Textarea
                placeholder="Write your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                autoResize
                minRows={4}
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setIsCommentOpen(false)} disabled={busy}>Cancel</Button>
                <Button onClick={submitComment} disabled={busy || !commentText.trim()}>Submit</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">{ticket.description}</CardContent>
          </Card>

          <Card className="h-[60vh]">
            <CardHeader>
              <CardTitle>Updates</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(60vh-5rem)] space-y-3 overflow-y-auto">
              {list.map((u) => (
                <div key={String(u._id)} className="rounded-md border p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(u.createdAt).toLocaleString()}</span>
                    <span>{u.updateType}</span>
                  </div>
                  <div className="mt-1 text-sm">{u.content}</div>
                </div>
              ))}
              {list.length === 0 && (
                <div className="text-sm text-muted-foreground">No updates yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span>Status</span><span>{ticket.status}</span></div>
              <div className="flex items-center justify-between"><span>Priority</span><span>{ticket.priority}</span></div>
              <div className="flex items-center justify-between"><span>Creator</span><span>{ticket.creatorInfo?.email}</span></div>
              <div className="flex items-center justify-between"><span>Assignee</span><span>{ticket.assigneeInfo?.email || 'Unassigned'}</span></div>
              <div className="flex items-center justify-between"><span>Updated</span><span>{new Date(ticket.updatedAt).toLocaleString()}</span></div>
              {ticket.organizationId ? (
                <div className="pt-2">
                  <div className="mb-1 text-xs text-muted-foreground">Assign to</div>
                  <Select
                    value={String(ticket.assignedToId || '')}
                    onValueChange={handleAssign}
                    disabled={eligibleAssignees.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleAssignees.map((m: OrganizationMemberLite) => (
                        <SelectItem key={String(m.userId)} value={String(m.userId)}>
                          {(m.userInfo.firstName || m.userInfo.lastName)
                            ? `${m.userInfo.firstName || ''} ${m.userInfo.lastName || ''}`.trim()
                            : m.userInfo.email}
                          <span className="text-muted-foreground"> — {m.userInfo.email}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


