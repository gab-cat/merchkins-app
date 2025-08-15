"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

function StatusBadge ({ value }: { value: TicketStatus }) {
  const color =
    value === 'OPEN'
      ? 'secondary'
      : value === 'CLOSED'
      ? 'destructive'
      : 'default'
  return <Badge variant={color as any}>{value}</Badge>
}

function TicketProgress ({ status }: { status: TicketStatus }) {
  const steps: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
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
                  (i < current ? 'bg-primary' : 'bg-muted-foreground/20')
                }
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ConsolidatedTicketsPage () {
  const { userId: clerkId } = useAuth()
  const currentUser = useQuery(
    api.users.queries.index.getCurrentUser,
    clerkId ? { clerkId } : ('skip' as unknown as { clerkId: string }),
  )

  const orgs = useQuery(
    api.organizations.queries.index.getOrganizationsByUser,
    currentUser?._id
      ? { userId: currentUser._id }
      : ('skip' as unknown as { userId: string }),
  )

  const personal = useQuery(
    api.tickets.queries.index.getTickets,
    currentUser?._id
      ? { createdById: currentUser._id }
      : ('skip' as unknown as { createdById: Id<'users'> }),
  )

  const [activeId, setActiveId] = useState<Id<'tickets'> | null>(null)

  const personalTickets = useMemo(() => {
    const list = personal?.tickets || []
    return list.filter((t: any) => !t.organizationId)
  }, [personal])

  const loading =
    currentUser === undefined || orgs === undefined || personal === undefined

  // Detail dialog queries
  const activeTicket = useQuery(
    api.tickets.queries.index.getTicketById,
    activeId
      ? { ticketId: activeId }
      : ('skip' as unknown as { ticketId: Id<'tickets'> }),
  )

  const updates = useQuery(
    api.tickets.queries.index.getTicketUpdates,
    activeId
      ? { ticketId: activeId, limit: 50, offset: 0 }
      : ('skip' as unknown as {
          ticketId: Id<'tickets'>
          limit: number
          offset: number
        }),
  )

  if (loading) {
    return <div className="container mx-auto px-3 py-6">Loading...</div>
  }

  return (
    <div className="container mx-auto px-3 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">My Tickets</h1>
        <p className="text-sm text-muted-foreground">
          Consolidated view grouped by organization
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal</CardTitle>
          </CardHeader>
          <CardContent>
            {personalTickets.length > 0 ? (
              <div className="divide-y">
                {personalTickets.map((t: any) => (
                  <div
                    key={t._id}
                    className="flex items-center justify-between gap-3 py-3 cursor-pointer hover:bg-muted/30 rounded px-2"
                    onClick={() => setActiveId(t._id)}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{t.title}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <StatusBadge value={t.status as TicketStatus} />
                        <span>•</span>
                        <span>Priority: {t.priority}</span>
                        {t.updatedAt ? (
                          <>
                            <span>•</span>
                            <span>
                              Updated {new Date(t.updatedAt).toLocaleString()}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setActiveId(t._id) }}>Open</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-sm text-muted-foreground">
                No personal tickets.
              </div>
            )}
          </CardContent>
        </Card>

        {(orgs || []).map((org: any) => (
          <OrgTicketsSection key={org._id} org={org} onOpen={setActiveId} />
        ))}
      </div>

      <Dialog
        open={!!activeId}
        onOpenChange={(v) => {
          if (!v) setActiveId(null)
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          {activeId && (activeTicket === undefined || updates === undefined) ? (
            <div className="space-y-4">
              <div className="h-6 w-1/2 animate-pulse rounded bg-secondary" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
              <div className="h-24 w-full animate-pulse rounded bg-secondary" />
            </div>
          ) : activeId && activeTicket === null ? (
            <div className="py-8 text-sm text-muted-foreground">Ticket not found.</div>
          ) : activeId && activeTicket ? (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between gap-3">
                  <span className="truncate">{activeTicket.title}</span>
                  <StatusBadge value={activeTicket.status as TicketStatus} />
                </DialogTitle>
                <DialogDescription>
                  Created by {activeTicket.creatorInfo?.email || 'Unknown'}
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-md border p-4 text-sm">
                <div className="font-semibold">Details</div>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between"><span>Status</span><span>{activeTicket.status}</span></div>
                  <div className="flex items-center justify-between"><span>Priority</span><span>{activeTicket.priority}</span></div>
                  <div className="flex items-center justify-between"><span>Assignee</span><span>{activeTicket.assigneeInfo?.email || 'Unassigned'}</span></div>
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold">Progress</div>
                <TicketProgress status={activeTicket.status as TicketStatus} />
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
                  <CardTitle>Updates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(updates?.updates || []).map((u: any) => (
                    <div key={String(u._id)} className="rounded border p-3">
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
                </CardContent>
              </Card>

              <DialogFooter>
                <div className="flex w-full items-center justify-between">
                  {activeTicket.organizationId ? (
                    <Link href={`/o/${activeTicket.organizationId}/tickets/${activeTicket._id}`}>
                      <Button variant="outline" size="sm">View full details</Button>
                    </Link>
                  ) : (
                    <Link href={`/tickets/${activeTicket._id}`}>
                      <Button variant="outline" size="sm">View full details</Button>
                    </Link>
                  )}
                  <Button size="sm" onClick={() => setActiveId(null)}>Close</Button>
                </div>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function OrgTicketsSection ({ org, onOpen }: { org: any, onOpen: (id: Id<'tickets'>) => void }) {
  const tickets = useQuery(
    api.tickets.queries.index.getTickets,
    org?._id ? { organizationId: org._id } : ('skip' as unknown as { organizationId: Id<'organizations'> }),
  )
  const loading = tickets === undefined
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-medium">{org.name}</CardTitle>
          <span className="text-xs text-muted-foreground">/{org.slug}</span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {new Array(3).fill(null).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
                  <div className="mt-2 h-3 w-1/4 animate-pulse rounded bg-secondary" />
                </div>
                <div className="h-8 w-20 animate-pulse rounded bg-secondary" />
              </div>
            ))}
          </div>
        ) : (tickets?.tickets || []).length > 0 ? (
          <div className="divide-y">
            {(tickets?.tickets || []).map((t: any) => (
              <div
                key={t._id}
                className="flex items-center justify-between gap-3 py-3 cursor-pointer hover:bg-muted/30 rounded px-2"
                onClick={() => onOpen(t._id)}
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{t.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <StatusBadge value={t.status as TicketStatus} />
                    <span>•</span>
                    <span>Priority: {t.priority}</span>
                    {t.updatedAt ? (
                      <>
                        <span>•</span>
                        <span>Updated {new Date(t.updatedAt).toLocaleString()}</span>
                      </>
                    ) : null}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onOpen(t._id) }}>Open</Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-sm text-muted-foreground">No tickets for this organization.</div>
        )}
      </CardContent>
    </Card>
  )
}


