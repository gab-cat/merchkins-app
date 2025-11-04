'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useOffsetPagination } from '@/src/hooks/use-pagination';
import { Doc } from '@/convex/_generated/dataModel';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

type Ticket = Doc<'tickets'>;

type TicketQueryArgs = {
  status?: TicketStatus;
  priority?: TicketPriority;
  limit?: number;
  offset?: number;
};

type TicketQueryResult = {
  tickets: Ticket[];
  hasMore: boolean;
};

function StatusBadge({ value }: { value: TicketStatus }) {
  const color = value === 'OPEN' ? 'secondary' : value === 'CLOSED' ? 'destructive' : 'default';
  return <Badge variant={color as 'secondary' | 'destructive' | 'default'}>{value}</Badge>;
}

export default function AdminTicketsPage() {
  const [status, setStatus] = useState<TicketStatus | 'ALL'>('ALL');
  const [priority, setPriority] = useState<TicketPriority | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const baseArgs = useMemo(
    (): TicketQueryArgs => ({
      status: status === 'ALL' ? undefined : status,
      priority: priority === 'ALL' ? undefined : priority,
    }),
    [status, priority]
  );

  const {
    items: tickets,
    isLoading: loading,
    hasMore,
    loadMore,
  } = useOffsetPagination<Ticket, TicketQueryArgs>({
    query: api.tickets.queries.index.getTickets,
    baseArgs,
    limit: 25,
    selectItems: (res: unknown) => (res as TicketQueryResult).tickets || [],
    selectHasMore: (res: unknown) => !!(res as TicketQueryResult).hasMore,
  });
  const createTicket = useMutation(api.tickets.mutations.index.createTicket);

  const filtered = useMemo(() => {
    const byPriority = priority === 'ALL' ? tickets : tickets.filter((t) => t.priority === priority);
    if (!search) return byPriority;
    const q = search.toLowerCase();
    return byPriority.filter((t) => [t.title, t.description || '', t.creatorInfo?.email || ''].join(' ').toLowerCase().includes(q));
  }, [tickets, priority, search]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tickets</h1>
          <p className="text-sm text-muted-foreground">Support and triage</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as TicketStatus | 'ALL')}
          >
            <option value="ALL">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority | 'ALL')}
          >
            <option value="ALL">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <button
            className="h-9 rounded-md border px-3 text-sm"
            onClick={async () => {
              const title = prompt('Ticket title') || '';
              if (!title.trim()) return;
              const description = prompt('Description') || '';
              await createTicket({ title, description, priority: 'MEDIUM' });
            }}
          >
            New ticket
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-md border divide-y">
            {new Array(6).fill(null).map((_, i) => (
              <div key={`s-${i}`} className="px-3 py-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border divide-y">
            {filtered.map((t) => (
              <Link key={t._id} href={`/admin/tickets/${t._id}`} className="block">
                <div className="flex items-center justify-between px-3 py-2 hover:bg-secondary/50">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{t.title}</div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Priority: {t.priority}</span>
                      <span>Updates: {t.updateCount}</span>
                    </div>
                  </div>
                  <StatusBadge value={t.status as TicketStatus} />
                </div>
              </Link>
            ))}
          </div>
        )}
        {hasMore && !loading && (
          <div className="mt-3 flex justify-center">
            <Button size="sm" variant="ghost" onClick={loadMore}>
              Load more
            </Button>
          </div>
        )}
      </div>
      {!loading && filtered.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No tickets found.</div>}
    </div>
  );
}
