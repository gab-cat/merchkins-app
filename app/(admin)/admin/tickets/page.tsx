'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useOffsetPagination } from '@/src/hooks/use-pagination';
import { Doc } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';

// Admin components
import { PageHeader } from '@/src/components/admin/page-header';
import { MetricCard, MetricGrid } from '@/src/components/admin/metric-card';
import { StatusBadge } from '@/src/components/admin/status-badge';
import { EmptyState } from '@/src/components/admin/empty-state';

// UI components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  ChevronRight,
  MoreHorizontal,
  User,
  Calendar,
  MessageSquare,
  Filter,
  RefreshCw,
  Flag,
  Inbox,
  Zap,
  Eye,
  Trash2,
} from 'lucide-react';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
type TicketWithInfo = Doc<'tickets'>;

type TicketQueryArgs = {
  status?: TicketStatus;
  priority?: TicketPriority;
  limit?: number;
  offset?: number;
};

type TicketQueryResult = {
  tickets: TicketWithInfo[];
  hasMore: boolean;
};

// Status configuration
const STATUS_CONFIG: Record<TicketStatus, { icon: React.ElementType; color: string; bgColor: string }> = {
  OPEN: { icon: AlertCircle, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950/30' },
  IN_PROGRESS: { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950/30' },
  RESOLVED: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-950/30' },
  CLOSED: { icon: XCircle, color: 'text-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-950/30' },
};

// Priority configuration
const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; dotColor: string }> = {
  LOW: { label: 'Low', color: 'text-slate-600', dotColor: 'bg-slate-400' },
  MEDIUM: { label: 'Medium', color: 'text-amber-600', dotColor: 'bg-amber-400' },
  HIGH: { label: 'High', color: 'text-red-600', dotColor: 'bg-red-500' },
};

// Ticket card component
function TicketCard({ ticket, index }: { ticket: TicketWithInfo; index: number }) {
  const statusConfig = STATUS_CONFIG[ticket.status as TicketStatus];
  const priorityConfig = PRIORITY_CONFIG[ticket.priority as TicketPriority];
  const StatusIcon = statusConfig?.icon || AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/admin/tickets/${ticket._id}`}>
        <div className="group relative bg-card border rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
          {/* Priority indicator bar */}
          <div className={cn(
            'absolute top-0 left-0 w-1 h-full rounded-l-xl',
            priorityConfig?.dotColor || 'bg-slate-400'
          )} />

          <div className="pl-3 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', statusConfig?.bgColor)}>
                  <StatusIcon className={cn('h-4 w-4', statusConfig?.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {ticket.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    #{ticket._id.slice(-6).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Description preview */}
              {ticket.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {ticket.description}
                </p>
              )}

              {/* Meta information */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {ticket.creatorInfo?.email || 'Unknown'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
                {ticket.updateCount > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {ticket.updateCount} updates
                  </span>
                )}
              </div>
            </div>

            {/* Right side: Status & Actions */}
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={ticket.status} />
              
              <div className="flex items-center gap-1.5">
                {/* Priority badge */}
                <span className={cn(
                  'text-xs font-medium flex items-center gap-1',
                  priorityConfig?.color
                )}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', priorityConfig?.dotColor)} />
                  {priorityConfig?.label}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/tickets/${ticket._id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Hover arrow */}
          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  );
}

// Create ticket dialog
function CreateTicketDialog({ 
  open, 
  onOpenChange, 
  onCreate 
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
          <DialogDescription>
            Create a support ticket to track and resolve issues.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              required
            />
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

// Loading skeleton
function TicketsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-card border rounded-xl p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminTicketsPage() {
  const [status, setStatus] = useState<TicketStatus | 'ALL'>('ALL');
  const [priority, setPriority] = useState<TicketPriority | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
  } = useOffsetPagination<TicketWithInfo, TicketQueryArgs>({
    query: api.tickets.queries.index.getTickets,
    baseArgs,
    limit: 25,
    selectItems: (res: unknown) => (res as TicketQueryResult).tickets || [],
    selectHasMore: (res: unknown) => !!(res as TicketQueryResult).hasMore,
  });

  const createTicket = useMutation(api.tickets.mutations.index.createTicket);

  // Filter tickets client-side by search and priority
  const filteredTickets = useMemo(() => {
    let result = tickets;
    
    // Priority filter (already done server-side, but keep for safety)
    if (priority !== 'ALL') {
      result = result.filter((t) => t.priority === priority);
    }
    
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        [t.title, t.description || '', t.creatorInfo?.email || '']
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }
    
    return result;
  }, [tickets, priority, search]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;
    const highPriority = tickets.filter((t) => t.priority === 'HIGH').length;
    return { open, inProgress, resolved, highPriority };
  }, [tickets]);

  const handleCreateTicket = async (title: string, description: string, ticketPriority: TicketPriority) => {
    await createTicket({ title, description, priority: ticketPriority });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Support Tickets"
        description="Manage and resolve customer support requests"
        icon={<Ticket className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Tickets' },
        ]}
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        }
      />

      {/* Metrics Grid */}
      <MetricGrid columns={4}>
        <MetricCard
          title="Open Tickets"
          value={metrics.open}
          icon={AlertCircle}
          variant="default"
        />
        <MetricCard
          title="In Progress"
          value={metrics.inProgress}
          icon={Clock}
          variant="default"
        />
        <MetricCard
          title="Resolved"
          value={metrics.resolved}
          icon={CheckCircle}
          variant="default"
        />
        <MetricCard
          title="High Priority"
          value={metrics.highPriority}
          icon={Zap}
          variant={metrics.highPriority > 0 ? 'gradient' : 'default'}
        />
      </MetricGrid>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus | 'ALL')}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority | 'ALL')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priority</SelectItem>
              <SelectItem value="HIGH">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  High
                </span>
              </SelectItem>
              <SelectItem value="MEDIUM">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Medium
                </span>
              </SelectItem>
              <SelectItem value="LOW">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Low
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <TicketsSkeleton />
      ) : filteredTickets.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-12 w-12 text-muted-foreground" />}
          title="No tickets found"
          description={search ? `No tickets match "${search}"` : 'Create a ticket to start tracking support requests'}
          action={{
            label: 'Create Ticket',
            onClick: () => setIsCreateOpen(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTickets.map((ticket, index) => (
              <TicketCard key={ticket._id} ticket={ticket} index={index} />
            ))}
          </AnimatePresence>

          {/* Load more */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center pt-4"
            >
              <Button variant="outline" onClick={loadMore}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load More
              </Button>
            </motion.div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <CreateTicketDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreateTicket}
      />
    </div>
  );
}
