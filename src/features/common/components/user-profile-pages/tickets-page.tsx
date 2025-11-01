"use client"

import React from 'react'
import { useAuth } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Ticket, Clock } from 'lucide-react'
import { Doc, Id } from '@/convex/_generated/dataModel'
import Link from 'next/link'
import { SettingsHeader, SettingsList, SettingsRow } from './settings'

type Ticket = Doc<'tickets'>

function StatusBadge({ value }: { value: string }) {
  const color =
    value === 'OPEN'
      ? 'secondary'
      : value === 'CLOSED'
      ? 'destructive'
      : 'default'
  return <Badge variant={color as 'secondary' | 'destructive' | 'default'}>{value}</Badge>
}

export function TicketsPage() {
  const { userId: clerkId } = useAuth()
  const currentUser = useQuery(
    api.users.queries.index.getCurrentUser,
    clerkId ? { clerkId } : ('skip' as unknown as { clerkId: string }),
  )

  const personal = useQuery(
    api.tickets.queries.index.getTickets,
    currentUser?._id
      ? { createdById: currentUser._id }
      : ('skip' as unknown as { createdById: Id<'users'> }),
  )

  const personalTickets = personal?.tickets || []
  const loading = currentUser === undefined || personal === undefined

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-16 w-full bg-muted animate-pulse rounded" />
        <div className="h-16 w-full bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!personalTickets || personalTickets.length === 0) {
    return (
      <div className="text-center py-8">
        <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
        <p className="text-muted-foreground mb-4">Create a support ticket when you need help</p>
        <Button asChild>
          <Link href="/tickets/new">Create Ticket</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SettingsHeader title="Tickets" />
      <SettingsList>
        <SettingsRow
          label={<span>My tickets</span>}
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/tickets">View all</Link>
            </Button>
          }
          alignTop
        >
          <div className="space-y-2">
            {personalTickets.slice(0, 5).map((ticket: Ticket) => (
              <div key={ticket._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {ticket.title || `Ticket ${ticket._id.slice(-6)}`}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(ticket._creationTime).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={ticket.status} />
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/tickets/${ticket._id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SettingsRow>
      </SettingsList>
    </div>
  )
}

