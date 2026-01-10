'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { useDebouncedSearch } from '@/src/hooks/use-debounced-search';

// UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCursorPagination } from '@/src/hooks/use-pagination';
import { LoadMore } from '@/src/components/ui/pagination';
import { BlurFade } from '@/src/components/ui/animations/effects';

// Icons
import {
  Ticket,
  ChevronRight,
  Search,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Building2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

interface TicketListItem {
  _id: Id<'tickets'>;
  title?: string;
  status: TicketStatus;
  priority: TicketPriority;
  updatedAt?: number;
  createdAt?: number;
  updateCount?: number;
}

const STATUS_CONFIG: Record<
  TicketStatus,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  OPEN: {
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-950/30',
    label: 'Open',
  },
  IN_PROGRESS: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950/30',
    label: 'In Progress',
  },
  RESOLVED: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950/30',
    label: 'Resolved',
  },
  CLOSED: {
    icon: XCircle,
    color: 'text-slate-500',
    bgColor: 'bg-slate-100 dark:bg-slate-950/30',
    label: 'Closed',
  },
};

const PRIORITY_CONFIG: Record<
  TicketPriority,
  {
    color: string;
    dotColor: string;
    label: string;
  }
> = {
  LOW: { color: 'text-slate-600', dotColor: 'bg-slate-400', label: 'Low' },
  MEDIUM: { color: 'text-amber-600', dotColor: 'bg-amber-400', label: 'Medium' },
  HIGH: { color: 'text-red-600', dotColor: 'bg-red-500', label: 'High' },
};

// Ticket status badge
function StatusBadge({ status }: { status: TicketStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config?.icon || AlertCircle;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium', config?.bgColor, config?.color)}>
      <Icon className="h-3 w-3" />
      {config?.label}
    </span>
  );
}

// Priority badge
function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs', config?.color)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config?.dotColor)} />
      {config?.label}
    </span>
  );
}

// Ticket card
function TicketCard({ ticket, index, orgSlug }: { ticket: TicketListItem; index: number; orgSlug?: string }) {
  const statusConfig = STATUS_CONFIG[ticket.status];
  const detailUrl = orgSlug ? `/o/${orgSlug}/tickets/${ticket._id}` : `/tickets/${ticket._id}`;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <BlurFade delay={0.05 * Math.min(index, 10)}>
      <Link href={detailUrl}>
        <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.998 }} className="group">
          <Card className="overflow-hidden py-2 border transition-all duration-200 hover:shadow-sm hover:border-primary/40 hover:bg-accent/30">
            <CardContent className="p-3 ">
              <div className="flex items-center gap-3">
                {/* Status indicator bar */}
                <div className={cn('w-1 h-12 rounded-full shrink-0', statusConfig?.bgColor)} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors pr-2">
                      {ticket.title || 'Untitled Ticket'}
                    </h3>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all mt-0.5" />
                  </div>

                  {/* Meta info row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    {ticket.updateCount !== undefined && ticket.updateCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        <span>{ticket.updateCount}</span>
                      </span>
                    )}
                    {ticket.updatedAt && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(ticket.updatedAt)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    </BlurFade>
  );
}

// Loading skeleton
function TicketsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-1 h-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-3 w-20 ml-auto" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Empty state
function EmptyState({ orgSlug, search }: { orgSlug?: string; search: string }) {
  const newUrl = orgSlug ? `/o/${orgSlug}/tickets/new` : '/tickets/new';

  if (search.trim()) {
    return (
      <div className="text-center py-12">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground text-sm">No tickets match &quot;{search}&quot;</p>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <div className="relative mx-auto mb-6">
        <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto">
          <Ticket className="h-10 w-10 text-primary" />
        </div>
        <Sparkles className="h-5 w-5 text-amber-500 absolute -top-1 -right-1" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No tickets yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Create a support ticket to get help from our team</p>
      <Button asChild>
        <Link href={newUrl}>
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Ticket
        </Link>
      </Button>
    </div>
  );
}

export function TicketsPage() {
  const pathname = usePathname();

  // Extract org slug from pathname
  const orgSlug = useMemo(() => {
    if (!pathname) return undefined;
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'o' && segments[1]) return segments[1];
    return undefined;
  }, [pathname]);

  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedSearch(search, 300);

  const {
    items: ticketsPage,
    isLoading,
    hasMore,
    loadMore,
  } = useCursorPagination<TicketListItem, { organizationId: Id<'organizations'>; search?: string }>({
    query: api.tickets.queries.index.getTicketsPage,
    baseArgs: organization?._id ? { organizationId: organization._id, search: debouncedSearch.trim() } : 'skip',
    limit: 25,
    selectPage: (res: unknown) => {
      const result = res as { page?: readonly TicketListItem[]; isDone?: boolean; continueCursor?: string | null };
      return {
        page: (result.page || []) as ReadonlyArray<TicketListItem>,
        isDone: !!result.isDone,
        continueCursor: result.continueCursor ?? null,
      };
    },
  });

  const filtered = (ticketsPage as TicketListItem[]) || [];

  const newTicketUrl = orgSlug ? `/o/${orgSlug}/tickets/new` : '/tickets/new';

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{organization?.name ? `${organization.name} Tickets` : 'My Tickets'}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                {organization?.name ? (
                  <>
                    <Building2 className="h-3.5 w-3.5" />
                    Tickets filed with this organization
                  </>
                ) : (
                  'Your support tickets'
                )}
              </p>
            </div>
          </div>

          {/* Search & New Ticket */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets..." className="pl-9" />
            </div>
            <Button asChild>
              <Link href={newTicketUrl}>
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Link>
            </Button>
          </div>
        </div>

        {/* Tickets List */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <TicketsSkeleton />
          ) : filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((ticket, index) => (
                <TicketCard key={String(ticket._id)} ticket={ticket} index={index} orgSlug={orgSlug} />
              ))}
            </div>
          ) : (
            <EmptyState orgSlug={orgSlug} search={debouncedSearch} />
          )}
        </AnimatePresence>

        {/* Load More */}
        <LoadMore onClick={loadMore} disabled={isLoading} isVisible={hasMore} />
      </motion.div>
    </div>
  );
}
