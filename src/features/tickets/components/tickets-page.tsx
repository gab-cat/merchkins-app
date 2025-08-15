"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCursorPagination } from '@/src/hooks/use-pagination'
import { LoadMore } from '@/src/components/ui/pagination'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMutation } from 'convex/react'
import { showToast } from '@/lib/toast'
import { TicketIcon, ChevronRight, User, Activity } from 'lucide-react'

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

function StatusBadge ({ value }: { value: TicketStatus }) {
  const color =
    value === 'OPEN'
      ? 'secondary'
      : value === 'CLOSED'
      ? 'destructive'
      : 'default'
  return <Badge variant={color as 'secondary' | 'destructive' | 'default'}>{value}</Badge>
}

export function TicketsPage () {
  const pathname = usePathname()
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

  const { items: ticketsPage, isLoading: ticketsLoading, hasMore, loadMore } = useCursorPagination<TicketListItem, { organizationId: Id<'organizations'> }>({
    query: api.tickets.queries.index.getTicketsPage,
    baseArgs: organization?._id ? { organizationId: organization._id } : 'skip',
    limit: 25,
    selectPage: (res: { page?: readonly TicketListItem[]; isDone?: boolean; continueCursor?: string | null }) => ({
      page: res.page || [],
      isDone: !!res.isDone,
      continueCursor: res.continueCursor ?? null,
    }),
  })

  const [search, setSearch] = useState('')
  const [activeId, setActiveId] = useState<Id<'tickets'> | null>(null)
  interface TicketListItem {
    _id: Id<'tickets'>
    title?: string
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    updatedAt?: number
  }

  const filtered: ReadonlyArray<TicketListItem> = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base: ReadonlyArray<TicketListItem> = (ticketsPage as ReadonlyArray<TicketListItem>) || []
    if (!q) return base
    return base.filter((t) => (t.title || '').toLowerCase().includes(q))
  }, [ticketsPage, search])

  const loading = ticketsLoading

  const activeTicket = useQuery(
    api.tickets.queries.index.getTicketById,
    activeId
      ? { ticketId: activeId }
      : ('skip' as unknown as { ticketId: Id<'tickets'> })
  )

  const updates = useQuery(
    api.tickets.queries.index.getTicketUpdates,
    activeId
      ? { ticketId: activeId, limit: 50, offset: 0 }
      : ('skip' as unknown as {
          ticketId: Id<'tickets'>
          limit: number
          offset: number
        })
  )

  const assignTicket = useMutation(api.tickets.mutations.index.assignTicket)
  const orgMembers = useQuery(
    api.organizations.queries.index.getOrganizationMembers,
    activeTicket?.organizationId
      ? { organizationId: activeTicket.organizationId, isActive: true, limit: 100 }
      : ('skip' as unknown as { organizationId: Id<'organizations'> })
  )
  interface OrganizationMemberLite {
    userId: Id<'users'>
    role: 'ADMIN' | 'STAFF' | 'MEMBER'
    userInfo: { firstName?: string; lastName?: string; email: string }
  }
  const eligibleAssignees = useMemo<ReadonlyArray<OrganizationMemberLite>>(() => {
    const page = (orgMembers as { page?: ReadonlyArray<OrganizationMemberLite> } | undefined)?.page || []
    return page.filter((m) => m.role === 'STAFF' || m.role === 'MEMBER')
  }, [orgMembers])
  async function handleAssign (assigneeId: string) {
    if (!activeTicket) return
    try {
      await assignTicket({ ticketId: activeTicket._id as Id<'tickets'>, assigneeId: assigneeId as Id<'users'> })
      showToast({ type: 'success', title: 'Ticket assigned' })
    } catch (err: unknown) {
      const message = typeof err === 'object' && err && 'message' in err ? String((err as { message?: string }).message) : 'Failed to assign ticket'
      showToast({ type: 'error', title: message })
    }
  }

  interface TicketUpdate {
    _id: Id<'ticketUpdates'>
    createdAt: number
    updateType: 'STATUS_CHANGE' | 'COMMENT' | 'ASSIGNMENT' | 'PRIORITY_CHANGE' | 'ESCALATION'
    content: string
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{organization?.name ? `${organization.name} Tickets` : 'My Tickets'}</h1>
          <p className="text-sm text-muted-foreground">{organization?.name ? 'Tickets filed with this organization' : 'Your support tickets'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets" className="h-8 w-56" />
          <Link href={orgSlug ? `/o/${orgSlug}/tickets/new` : `/tickets/new`}>
            <Button size="sm">New ticket</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {new Array(4).fill(null).map((_, i) => (
                <div key={`skeleton-${i}`} className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
                    <div className="mt-2 h-3 w-1/4 animate-pulse rounded bg-secondary" />
                  </div>
                  <div className="h-8 w-20 animate-pulse rounded bg-secondary" />
                </div>
              ))}
            </div>
          ) : (filtered || []).length > 0 ? (
            <div className="space-y-2">
              {(filtered || []).map((t: TicketListItem) => (
                <div
                  key={t._id}
                  className="group relative flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-accent/30"
                  onClick={() => setActiveId(t._id as Id<'tickets'>)}
                  data-testid={`ticket-row-${t._id}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <TicketIcon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium tracking-tight">
                        {t.title}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={t.status === 'OPEN' ? 'secondary' : t.status === 'CLOSED' ? 'destructive' : 'default'}>
                          {t.status}
                        </Badge>
                        <span className="inline-flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                          Priority: {t.priority}
                        </span>
                        {t.updatedAt ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                            Updated {new Date(t.updatedAt).toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">No tickets yet.</div>
          )}
        </CardContent>
      </Card>

      <LoadMore onClick={loadMore} disabled={loading} isVisible={hasMore} />

      <Dialog
        open={!!activeId}
        onOpenChange={(v) => {
          if (!v) setActiveId(null)
        }}
      >
        <DialogContent
          className="sm:max-w-3xl"
          data-testid="ticket-detail-dialog"
        >
          {activeId && (activeTicket === undefined || updates === undefined) ? (
            <div className="space-y-4">
              <div className="h-6 w-1/2 animate-pulse rounded bg-secondary" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
              <div className="h-24 w-full animate-pulse rounded bg-secondary" />
            </div>
          ) : activeId && activeTicket === null ? (
            <div className="py-8 text-sm text-muted-foreground">
              Ticket not found.
            </div>
          ) : activeId && activeTicket ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-gradient-to-r from-primary/10 to-transparent p-4">
                <DialogHeader>
                  <DialogTitle className="flex items-start justify-between gap-3">
                    <span className="truncate text-balance">
                      {activeTicket.title}
                    </span>
                    <StatusBadge value={activeTicket.status as TicketStatus} />
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2">
                    <User className="size-4" />
                    <span>
                      {activeTicket.creatorInfo?.email || 'Unknown'}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span className="inline-flex items-center gap-2">
                      <span className="rounded-full border px-2 py-0.5 text-xs">
                        Priority: {activeTicket.priority}
                      </span>
                    </span>
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-md border bg-muted/30 p-4 text-sm sm:col-span-2">
                  <div className="mb-2 font-semibold">Progress</div>
                  <TicketProgress status={activeTicket.status as TicketStatus} />
                </div>
                <div className="rounded-md border bg-card p-4 text-sm">
                  <div className="font-semibold">Details</div>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><span>Status</span><span>{activeTicket.status}</span></div>
                    <div className="flex items-center justify-between"><span>Priority</span><span>{activeTicket.priority}</span></div>
                    <div className="flex items-center justify-between"><span>Creator</span><span>{activeTicket.creatorInfo?.email || 'Unknown'}</span></div>
                    <div className="flex items-center justify-between"><span>Assignee</span><span>{activeTicket.assigneeInfo?.email || 'Unassigned'}</span></div>
                    {activeTicket.organizationId ? (
                      <div className="pt-2">
                        <div className="mb-1 text-xs text-muted-foreground">Assign to</div>
                        <Select
                          value={String((activeTicket as { assignedToId?: Id<'users'> } | null)?.assignedToId || '')}
                          onValueChange={handleAssign}
                          disabled={eligibleAssignees.length === 0}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select member" />
                          </SelectTrigger>
                          <SelectContent>
                            {eligibleAssignees.map((m) => (
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
                  </div>
                </div>
              </div>

              {activeTicket.description ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {activeTicket.description}
                  </CardContent>
                </Card>
              ) : null}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="size-4" /> Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(updates?.updates || []).map((u: TicketUpdate) => (
                      <div key={String(u._id)} className="relative pl-4">
                        <div className="absolute left-0 top-2 h-full w-px bg-border" />
                        <div className="absolute left-[-6px] top-2 size-2 rounded-full bg-primary" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(u.createdAt).toLocaleString()}</span>
                          <span>{u.updateType}</span>
                        </div>
                        <div className="mt-1 text-sm">{u.content}</div>
                      </div>
                    ))}
                    {updates && updates.updates.length === 0 && (
                      <div className="text-sm text-muted-foreground">No updates yet.</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <DialogFooter>
                <div className="flex w-full items-center justify-end">
                  <Button size="sm" onClick={() => setActiveId(null)}>
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TicketProgress ({
  status,
}: {
  status: TicketStatus
}) {
  const steps: TicketStatus[] = [
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
  ]
  const current = steps.indexOf(status)

  return (
    <div className="flex items-center">
      {steps.map((s, i) => {
        const done = i <= current
        return (
          <div key={s} className="flex items-center">
            <div
              className={
                'size-5 rounded-full border ' +
                (done
                  ? 'bg-primary border-primary'
                  : 'bg-muted border-muted-foreground/30')
              }
              title={s}
            />
            {i < steps.length - 1 && (
              <div
                className={
                  'mx-2 h-0.5 w-10 sm:w-16 ' +
                  (i < current
                    ? 'bg-primary'
                    : 'bg-muted-foreground/20')
                }
              />
            )}
          </div>
        )
      })}
    </div>
  )
}


