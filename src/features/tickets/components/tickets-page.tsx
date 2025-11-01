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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMutation } from 'convex/react'
import { showToast, promiseToast } from '@/lib/toast'
import { TicketIcon, ChevronRight, User, Activity, Search, Plus, Filter } from 'lucide-react'

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

function StatusBadge ({ value }: { value: TicketStatus }) {
  const getStatusConfig = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN':
        return { variant: 'secondary' as const, icon: '🆕', color: 'bg-blue-100 text-blue-800' }
      case 'IN_PROGRESS':
        return { variant: 'default' as const, icon: '⚡', color: 'bg-orange-100 text-orange-800' }
      case 'RESOLVED':
        return { variant: 'outline' as const, icon: '✅', color: 'bg-green-100 text-green-800' }
      case 'CLOSED':
        return { variant: 'destructive' as const, icon: '❌', color: 'bg-red-100 text-red-800' }
      default:
        return { variant: 'outline' as const, icon: '❓', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const config = getStatusConfig(value)
  return (
    <Badge variant={config.variant} className={`text-xs px-2 py-1 font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {value}
    </Badge>
  )
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
    selectPage: (res: unknown) => {
      const result = res as { page?: readonly TicketListItem[]; isDone?: boolean; continueCursor?: string | null }
      return {
        page: (result.page || []) as ReadonlyArray<TicketListItem>,
        isDone: !!result.isDone,
        continueCursor: result.continueCursor ?? null,
      }
    },
  })

  interface TicketListItem {
    _id: Id<'tickets'>
    title?: string
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    updatedAt?: number
  }

  const [search, setSearch] = useState('')
  const [activeId, setActiveId] = useState<Id<'tickets'> | null>(null)

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
      await promiseToast(
        assignTicket({ ticketId: activeTicket._id as Id<'tickets'>, assigneeId: assigneeId as Id<'users'> }),
        {
          loading: 'Assigning ticket...',
          success: 'Ticket assigned successfully!',
          error: 'Failed to assign ticket'
        }
      )
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TicketIcon className="h-8 w-8" />
            {organization?.name ? `${organization.name} Tickets` : 'My Tickets'}
          </h1>
          <p className="text-muted-foreground">
            {organization?.name ? 'Tickets filed with this organization' : 'Your support tickets'}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="pl-9 h-9"
            />
          </div>
          <Link href={orgSlug ? `/o/${orgSlug}/tickets/new` : `/tickets/new`}>
            <Button size="sm" className="hover:scale-105 transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              New ticket
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Support tickets
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              {new Array(4).fill(null).map((_, i) => (
                <div key={`skeleton-${i}`} className="rounded-lg border p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-secondary" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 rounded bg-secondary" />
                      <div className="h-3 w-32 rounded bg-secondary" />
                    </div>
                    <div className="h-6 w-20 rounded bg-secondary" />
                  </div>
                </div>
              ))}
            </div>
          ) : (filtered || []).length > 0 ? (
            <div className="space-y-3">
              {(filtered || []).map((t: TicketListItem) => (
                <div
                  key={t._id}
                  className="group relative flex items-center justify-between gap-4 rounded-lg border p-4 transition-all duration-200 hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm cursor-pointer"
                  onClick={() => setActiveId(t._id as Id<'tickets'>)}
                  data-testid={`ticket-row-${t._id}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <TicketIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {t.title}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <StatusBadge value={t.status} />
                        <span className="inline-flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                          Priority: {t.priority}
                        </span>
                        {t.updatedAt ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                            {new Date(t.updatedAt).toLocaleDateString()}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="size-4 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1 text-muted-foreground" />
                </div>
              ))}

              {filtered.length === 0 && search.trim() && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No tickets match &quot;{search}&quot;</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <TicketIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
              <p className="text-muted-foreground mb-6">Create a support ticket to get help</p>
              <Link href={orgSlug ? `/o/${orgSlug}/tickets/new` : `/tickets/new`}>
                <Button className="hover:scale-105 transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first ticket
                </Button>
              </Link>
            </div>
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
            <div className="space-y-6">
              <div className="rounded-xl border bg-gradient-to-r from-primary/10 to-transparent p-4 shadow-sm">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="flex items-start justify-between gap-3 text-lg">
                    <span className="truncate">
                      {activeTicket.title}
                    </span>
                    <StatusBadge value={activeTicket.status as TicketStatus} />
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{activeTicket.creatorInfo?.email || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${activeTicket.priority === 'HIGH' ? 'bg-red-100 text-red-700' : activeTicket.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        Priority: {activeTicket.priority}
                      </span>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-lg border bg-muted/30 p-4 text-sm lg:col-span-2">
                  <div className="mb-3 font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Progress
                  </div>
                  <TicketProgress status={activeTicket.status as TicketStatus} />
                </div>
                <div className="rounded-lg border bg-card p-4 text-sm">
                  <div className="font-semibold mb-3">Details</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <StatusBadge value={activeTicket.status as TicketStatus} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Priority</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${activeTicket.priority === 'HIGH' ? 'bg-red-100 text-red-700' : activeTicket.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {activeTicket.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Creator</span>
                      <span className="font-medium">{activeTicket.creatorInfo?.email || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Assignee</span>
                      <span className="font-medium">{activeTicket.assigneeInfo?.email || 'Unassigned'}</span>
                    </div>
                    {activeTicket.organizationId ? (
                      <div className="pt-2 border-t">
                        <div className="mb-2 text-xs font-semibold text-muted-foreground">Assign to</div>
                        <Select
                          value={String((activeTicket as { assignedToId?: Id<'users'> } | null)?.assignedToId || '')}
                          onValueChange={handleAssign}
                          disabled={eligibleAssignees.length === 0}
                        >
                          <SelectTrigger className="w-full h-8 text-sm">
                            <SelectValue placeholder="Select member" />
                          </SelectTrigger>
                          <SelectContent>
                            {eligibleAssignees.map((m) => (
                              <SelectItem key={String(m.userId)} value={String(m.userId)} className="text-sm">
                                {(m.userInfo.firstName || m.userInfo.lastName)
                                  ? `${m.userInfo.firstName || ''} ${m.userInfo.lastName || ''}`.trim()
                                  : m.userInfo.email}
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
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-4 w-4" /> Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {(updates?.updates || []).map((u: TicketUpdate) => (
                      <div key={String(u._id)} className="relative pl-4 pb-3 border-l-2 border-l-primary/20 last:border-l-0">
                        <div className="absolute left-[-6px] top-2 h-2 w-2 rounded-full bg-primary" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                          <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                            {u.updateType.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-sm leading-relaxed">{u.content}</div>
                      </div>
                    ))}
                    {updates && updates.updates.length === 0 && (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        No updates yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end pt-4 border-t">
                <Button size="sm" onClick={() => setActiveId(null)} className="h-9">
                  Close
                </Button>
              </div>
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


