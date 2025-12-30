'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useOffsetPagination } from '@/src/hooks/use-pagination';
import { useDebouncedSearch } from '@/src/hooks/use-debounced-search';
import { DateRangeFilter, DateRange } from '@/src/components/ui/date-range-filter';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';

// Admin components
import { PageHeader } from '@/src/components/admin/page-header';
import { StatusBadge } from '@/src/components/admin/status-badge';
import { EmptyState } from '@/src/components/admin/empty-state';

// UI components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
  Ticket,
  Plus,
  Search,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  User,
  MessageSquare,
  RefreshCw,
  Inbox,
  Zap,
  Eye,
  Trash2,
  ArrowRight,
  Check,
  Briefcase,
} from 'lucide-react';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
type TicketWithInfo = Doc<'tickets'>;

type TicketQueryArgs = {
  status?: TicketStatus;
  priority?: TicketPriority;
  dateFrom?: number;
  dateTo?: number;
  search?: string;
  limit?: number;
  offset?: number;
};

type TicketQueryResult = {
  tickets: TicketWithInfo[];
  hasMore: boolean;
};

// Status configuration
const STATUS_CONFIG: Record<TicketStatus, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  OPEN: { icon: AlertCircle, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950/30', label: 'Open' },
  IN_PROGRESS: { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950/30', label: 'In Progress' },
  RESOLVED: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-950/30', label: 'Resolved' },
  CLOSED: { icon: XCircle, color: 'text-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-950/30', label: 'Closed' },
};

// Priority configuration
const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; dotColor: string; bgColor: string }> = {
  LOW: { label: 'Low', color: 'text-slate-600', dotColor: 'bg-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-900/30' },
  MEDIUM: { label: 'Medium', color: 'text-amber-600', dotColor: 'bg-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  HIGH: { label: 'High', color: 'text-red-600', dotColor: 'bg-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Priority badge component
function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full', config.bgColor, config.color)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />
      {config.label}
    </span>
  );
}

// Compact Ticket Card for "Assigned to Me"
function CompactTicketCard({ ticket }: { ticket: TicketWithInfo }) {
  const statusConfig = STATUS_CONFIG[ticket.status as TicketStatus];
  const StatusIcon = statusConfig.icon;

  return (
    <Link href={`/admin/tickets/${ticket._id}`} className="block min-w-[280px] w-[280px]">
      <div className="h-full rounded-xl border bg-card p-3 hover:shadow-md transition-all hover:border-primary/20 group">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', statusConfig.bgColor)}>
            <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
          </div>
          <PriorityBadge priority={ticket.priority as TicketPriority} />
        </div>

        <h4 className="font-semibold text-sm truncate mb-1 group-hover:text-primary transition-colors">{ticket.title}</h4>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span className="font-mono">#{ticket._id.slice(-6).toUpperCase()}</span>
          <span>•</span>
          <span>{formatDate(ticket.createdAt)}</span>
        </div>

        <div className="flex items-center justify-between text-xs mt-auto">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-2.5 w-2.5 text-primary" />
            </div>
            <span className="truncate max-w-[100px]">{ticket.creatorInfo?.firstName || 'User'}</span>
          </div>
          {ticket.updateCount && ticket.updateCount > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              {ticket.updateCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Create ticket dialog
function CreateTicketDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (title: string, description: string, priority: TicketPriority) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate(title, description, priority);
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Ticket className="h-4 w-4 text-primary" />
            </div>
            Create New Ticket
          </DialogTitle>
          <DialogDescription>Create a support ticket to track and resolve issues.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief description of the issue" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about the issue..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span className={cn('h-2 w-2 rounded-full', config.dotColor)} />
                      {config.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminTicketsPage() {
  const [status, setStatus] = useState<TicketStatus | 'ALL'>('ALL');
  const [priority, setPriority] = useState<TicketPriority | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [assignedTicketsRetryTrigger, setAssignedTicketsRetryTrigger] = useState(0);

  const debouncedSearch = useDebouncedSearch(search, 300);

  // My Assigned Tickets Query, fetch only open/progress tickets assigned to current user using new backend flag
  const myAssignedTickets = useQuery(
    api.tickets.queries.index.getTickets,
    // We pass assignedToMe: true to let backend filter by current user
    // retryKey is included to force refetch when handleRetryAssignedTickets is called
    { assignedToMe: true, limit: 20, retryKey: assignedTicketsRetryTrigger }
  );

  // Loading and error states for myAssignedTickets
  const myAssignedTicketsLoading = myAssignedTickets === undefined;
  const myAssignedTicketsError = myAssignedTickets !== undefined && (!myAssignedTickets || !('tickets' in myAssignedTickets));

  const baseArgs = useMemo(
    (): TicketQueryArgs => ({
      status: status === 'ALL' ? undefined : status,
      priority: priority === 'ALL' ? undefined : priority,
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo,
      search: debouncedSearch || undefined,
    }),
    [status, priority, dateRange, debouncedSearch]
  );

  const {
    items: tickets,
    isLoading: loading,
    hasMore,
    loadMore,
  } = useOffsetPagination<TicketWithInfo, TicketQueryArgs>({
    query: api.tickets.queries.index.getTickets,
    baseArgs,
    limit: 50,
    selectItems: (res: unknown) => (res as TicketQueryResult).tickets || [],
    selectHasMore: (res: unknown) => !!(res as TicketQueryResult).hasMore,
  });

  const createTicket = useMutation(api.tickets.mutations.index.createTicket);
  const addTicketUpdate = useMutation(api.tickets.mutations.index.addTicketUpdate);

  // Calculate metrics
  const metrics = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;
    const highPriority = tickets.filter((t) => t.priority === 'HIGH' && t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;
    return { open, inProgress, resolved, highPriority };
  }, [tickets]);

  const handleCreateTicket = async (title: string, description: string, ticketPriority: TicketPriority) => {
    await createTicket({ title, description, priority: ticketPriority });
    showToast({ type: 'success', title: 'Ticket created successfully' });
  };

  const handleQuickStatusChange = async (ticket: TicketWithInfo, newStatus: TicketStatus) => {
    try {
      await addTicketUpdate({
        ticketId: ticket._id as Id<'tickets'>,
        content: `Status changed from ${ticket.status} to ${newStatus}`,
        updateType: 'STATUS_CHANGE',
        status: newStatus,
        previousValue: ticket.status,
        newValue: newStatus,
        isInternal: false,
      });
      showToast({ type: 'success', title: `Ticket status updated to ${STATUS_CONFIG[newStatus].label}` });
    } catch {
      showToast({ type: 'error', title: 'Failed to update status' });
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleRetryAssignedTickets = () => {
    // Increment retryKey to change query arguments and force Convex to refetch
    setAssignedTicketsRetryTrigger((prev) => prev + 1);
  };

  // Filter client-side to be safe and only show actionable items, though query limits to what we need optionally
  // Only process when data is available and not loading/error
  const myTickets = useMemo(() => {
    if (myAssignedTicketsLoading || myAssignedTicketsError || !myAssignedTickets) {
      return [];
    }
    return (myAssignedTickets.tickets || []).filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
  }, [myAssignedTickets, myAssignedTicketsLoading, myAssignedTicketsError]);

  return (
    <div className="space-y-6 font-admin-body pb-10">
      {/* Page Header */}
      <PageHeader
        title="Support Tickets"
        description="Manage and resolve customer support requests"
        icon={<Ticket className="h-5 w-5" />}
        breadcrumbs={[{ label: 'Admin', href: '/admin/overview' }, { label: 'Tickets' }]}
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        }
      />

      {/* Assigned to Me Section */}
      <AnimatePresence>
        {(myAssignedTicketsLoading || myAssignedTicketsError || myTickets.length > 0) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold font-admin-heading">Assigned to Me</h3>
              {!myAssignedTicketsLoading && !myAssignedTicketsError && (
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{myTickets.length}</span>
              )}
            </div>

            {myAssignedTicketsLoading ? (
              <ScrollArea className="w-full whitespace-nowrap pb-4">
                <div className="flex gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="min-w-[280px] w-[280px]">
                      <div className="h-full rounded-xl border bg-card p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-3 w-32 mb-3" />
                        <div className="flex items-center justify-between mt-auto">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            ) : myAssignedTicketsError ? (
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Failed to load assigned tickets</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Please try again or refresh the page</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRetryAssignedTickets} disabled={myAssignedTicketsLoading}>
                    <RefreshCw className={cn('h-4 w-4 mr-2', myAssignedTicketsLoading && 'animate-spin')} />
                    Retry
                  </Button>
                </div>
              </div>
            ) : myTickets.length > 0 ? (
              <ScrollArea className="w-full whitespace-nowrap pb-4">
                <div className="flex gap-4">
                  {myTickets.map((ticket) => (
                    <CompactTicketCard key={ticket._id} ticket={ticket} />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: 'Open', value: metrics.open, color: 'text-amber-600', icon: AlertCircle },
          { label: 'In Progress', value: metrics.inProgress, color: 'text-blue-600', icon: Clock },
          { label: 'Resolved', value: metrics.resolved, color: 'text-emerald-600', icon: CheckCircle },
          { label: 'High Priority', value: metrics.highPriority, color: 'text-red-600', icon: Zap },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg border bg-card p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
            <p className={cn('text-2xl font-bold font-admin-heading', stat.color)}>{loading ? '—' : stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold font-admin-heading flex items-center gap-2">
          <Inbox className="h-4 w-4" />
          All Tickets
        </h3>
        {!loading && (
          <p className="text-xs text-muted-foreground">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-muted/30 p-1 rounded-lg">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 px-1">
          <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus | 'ALL')}>
            <SelectTrigger className="w-[130px] h-8 text-xs bg-background border-none shadow-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority | 'ALL')}>
            <SelectTrigger className="w-[120px] h-8 text-xs bg-background border-none shadow-sm">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priority</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
          <div className="h-8">
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 ml-1" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b-primary/5">
              <TableHead className="text-xs font-semibold uppercase tracking-wide w-[350px]">Ticket</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide w-[120px]">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide w-[100px]">Priority</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide w-[150px]">Created</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Creator</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-center w-[80px]">Activity</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                        <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-24 rounded bg-muted animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-16 rounded bg-muted animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="h-4 w-8 rounded bg-muted animate-pulse mx-auto" />
                    </TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40">
                    <EmptyState
                      icon={<Inbox className="h-12 w-12 text-muted-foreground" />}
                      title="No tickets found"
                      description={
                        search || dateRange.dateFrom || dateRange.dateTo
                          ? `No tickets match your filters`
                          : 'Create a ticket to start tracking support requests'
                      }
                      action={{
                        label: 'Create Ticket',
                        onClick: () => setIsCreateOpen(true),
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket, index) => {
                  const statusConfig = STATUS_CONFIG[ticket.status as TicketStatus];
                  const StatusIcon = statusConfig?.icon || AlertCircle;

                  return (
                    <motion.tr
                      key={ticket._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <Link href={`/admin/tickets/${ticket._id}`} className="block group-hover:text-primary transition-colors">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105',
                                statusConfig?.bgColor
                              )}
                            >
                              <StatusIcon className={cn('h-4.5 w-4.5', statusConfig?.color)} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-sm truncate max-w-[280px] flex items-center gap-1.5">{ticket.title}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground font-mono">#{ticket._id.slice(-6).toUpperCase()}</span>
                                {ticket.category && (
                                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded">
                                    {ticket.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={ticket.priority as TicketPriority} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{formatDate(ticket.createdAt)}</span>
                          <span className="text-xs text-muted-foreground">{formatTime(ticket.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-sm truncate max-w-[150px]">{ticket.creatorInfo?.email || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                          <MessageSquare className="h-3 w-3" />
                          {ticket.updateCount || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/tickets/${ticket._id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Change Status
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {(Object.entries(STATUS_CONFIG) as [TicketStatus, (typeof STATUS_CONFIG)[TicketStatus]][]).map(
                                  ([statusKey, config]) => {
                                    const Icon = config.icon;
                                    const isActive = ticket.status === statusKey;
                                    return (
                                      <DropdownMenuItem
                                        key={statusKey}
                                        disabled={isActive}
                                        onClick={() => handleQuickStatusChange(ticket, statusKey)}
                                      >
                                        {isActive ? (
                                          <Check className="h-4 w-4 mr-2 text-primary" />
                                        ) : (
                                          <Icon className={cn('h-4 w-4 mr-2', config.color)} />
                                        )}
                                        {config.label}
                                      </DropdownMenuItem>
                                    );
                                  }
                                )}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Load More
          </Button>
        </motion.div>
      )}

      {/* Create Dialog */}
      <CreateTicketDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreate={handleCreateTicket} />
    </div>
  );
}
