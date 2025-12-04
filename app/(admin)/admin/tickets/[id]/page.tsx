'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';

// Admin components
import { PageHeader } from '@/src/components/admin/page-header';
import { StatusBadge } from '@/src/components/admin/status-badge';

// UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// Icons
import {
  Ticket,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  MessageSquare,
  Send,
  Flag,
  UserPlus,
  History,
  RefreshCw,
  Edit,
  MoreVertical,
  Mail,
  Tag,
  AlertTriangle,
  Info,
  Check,
} from 'lucide-react';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

// Status configuration
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

// Priority configuration
const PRIORITY_CONFIG: Record<
  TicketPriority,
  {
    label: string;
    color: string;
    dotColor: string;
    bgColor: string;
  }
> = {
  LOW: {
    label: 'Low',
    color: 'text-slate-600',
    dotColor: 'bg-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-950/30',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'text-amber-600',
    dotColor: 'bg-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950/30',
  },
  HIGH: {
    label: 'High',
    color: 'text-red-600',
    dotColor: 'bg-red-500',
    bgColor: 'bg-red-100 dark:bg-red-950/30',
  },
};

// Update type icons
const UPDATE_TYPE_ICONS: Record<string, React.ElementType> = {
  COMMENT: MessageSquare,
  STATUS_CHANGE: RefreshCw,
  ASSIGNMENT: UserPlus,
  PRIORITY_CHANGE: Flag,
};

// Comment/Update item component
function UpdateItem({
  update,
  index,
}: {
  update: {
    _id: string;
    content: string;
    updateType: string;
    createdAt: number;
    creatorInfo?: { firstName?: string; lastName?: string; email: string } | null;
    previousValue?: string;
    newValue?: string;
  };
  index: number;
}) {
  const Icon = UPDATE_TYPE_ICONS[update.updateType] || Info;
  const isStatusChange = update.updateType === 'STATUS_CHANGE';
  const isPriorityChange = update.updateType === 'PRIORITY_CHANGE';
  const isAssignment = update.updateType === 'ASSIGNMENT';
  const isComment = update.updateType === 'COMMENT';

  const creatorName =
    update.creatorInfo?.firstName || update.creatorInfo?.lastName
      ? `${update.creatorInfo?.firstName || ''} ${update.creatorInfo?.lastName || ''}`.trim()
      : update.creatorInfo?.email || 'System';

  const initials = creatorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn('flex gap-3 p-4 rounded-xl border', isComment ? 'bg-card' : 'bg-muted/30')}
    >
      {/* Avatar */}
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{creatorName}</span>
          <span className="text-xs text-muted-foreground">{new Date(update.createdAt).toLocaleString()}</span>
        </div>

        {/* Content */}
        {isComment ? (
          <p className="text-sm whitespace-pre-wrap">{update.content}</p>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{update.content}</span>
            {isStatusChange && update.newValue && <StatusBadge status={update.newValue} size="sm" />}
            {isPriorityChange && update.newValue && (
              <span
                className={cn(
                  'text-xs font-medium flex items-center gap-1 px-2 py-0.5 rounded-full',
                  PRIORITY_CONFIG[update.newValue as TicketPriority]?.bgColor,
                  PRIORITY_CONFIG[update.newValue as TicketPriority]?.color
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', PRIORITY_CONFIG[update.newValue as TicketPriority]?.dotColor)} />
                {PRIORITY_CONFIG[update.newValue as TicketPriority]?.label}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Loading skeleton
function TicketDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Info row component
function InfoRow({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium">{children || value}</div>
    </div>
  );
}

export default function AdminTicketDetailPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const ticketId = params.id as Id<'tickets'>;

  // Queries
  const ticket = useQuery(api.tickets.queries.index.getTicketById, { ticketId });
  const updates = useQuery(api.tickets.queries.index.getTicketUpdates, {
    ticketId,
    limit: 100,
    offset: 0,
  });
  const members = useQuery(
    api.organizations.queries.index.getOrganizationMembers,
    ticket?.organizationId ? { organizationId: ticket.organizationId, isActive: true, limit: 100 } : 'skip'
  );

  // Mutations
  const addUpdate = useMutation(api.tickets.mutations.index.addTicketUpdate);
  const markRead = useMutation(api.tickets.mutations.index.markTicketRead);
  const assignTicket = useMutation(api.tickets.mutations.index.assignTicket);

  // State
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  // Derived data
  const loading = ticket === undefined || updates === undefined;
  const updatesList = useMemo(() => updates?.updates ?? [], [updates]);

  interface OrganizationMember {
    userId: Id<'users'>;
    role: 'ADMIN' | 'STAFF' | 'MEMBER';
    userInfo: { firstName?: string; lastName?: string; email: string };
  }

  const eligibleAssignees = useMemo<OrganizationMember[]>(() => {
    const page = (members as { page?: OrganizationMember[] } | undefined)?.page || [];
    return page.filter((m) => m.role === 'STAFF' || m.role === 'MEMBER' || m.role === 'ADMIN');
  }, [members]);

  // Mark as read when opened
  useEffect(() => {
    if (ticket && updates) {
      markRead({ ticketId: ticket._id as Id<'tickets'> });
    }
  }, [ticket, updates, markRead]);

  // Handlers
  async function handleStatusChange(newStatus: TicketStatus) {
    if (!ticket || isBusy) return;
    setIsBusy(true);
    try {
      await addUpdate({
        ticketId: ticket._id as Id<'tickets'>,
        content: `Status changed from ${ticket.status} to ${newStatus}`,
        updateType: 'STATUS_CHANGE',
        status: newStatus,
        previousValue: ticket.status,
        newValue: newStatus,
        isInternal: false,
      });
      showToast({ type: 'success', title: 'Status updated' });
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to update status' });
    } finally {
      setIsBusy(false);
    }
  }

  async function handlePriorityChange(newPriority: TicketPriority) {
    if (!ticket || isBusy) return;
    setIsBusy(true);
    try {
      await addUpdate({
        ticketId: ticket._id as Id<'tickets'>,
        content: `Priority changed from ${ticket.priority} to ${newPriority}`,
        updateType: 'PRIORITY_CHANGE',
        previousValue: ticket.priority,
        newValue: newPriority,
        isInternal: false,
      });
      showToast({ type: 'success', title: 'Priority updated' });
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to update priority' });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleAddComment() {
    if (!commentText.trim() || !ticket || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addUpdate({
        ticketId: ticket._id,
        content: commentText.trim(),
        updateType: 'COMMENT',
        isInternal: false,
      });
      setCommentText('');
      showToast({ type: 'success', title: 'Comment added' });
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to add comment' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAssign(assigneeId: string) {
    if (!ticket) return;
    try {
      await assignTicket({
        ticketId: ticket._id as Id<'tickets'>,
        assigneeId: assigneeId as Id<'users'>,
      });
      showToast({ type: 'success', title: 'Ticket assigned' });
    } catch (err) {
      const error = err as Error;
      showToast({ type: 'error', title: error?.message || 'Failed to assign ticket' });
    }
  }

  // Loading state
  if (loading) {
    return <TicketDetailSkeleton />;
  }

  // Not found state
  if (ticket === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
        <p className="text-muted-foreground mb-4">The ticket you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
        <Button asChild>
          <Link href="/admin/tickets">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Link>
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[ticket.status as TicketStatus];
  const priorityConfig = PRIORITY_CONFIG[ticket.priority as TicketPriority];
  const StatusIcon = statusConfig?.icon || AlertCircle;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={ticket.title}
        description={`Ticket #${ticket._id.slice(-6).toUpperCase()}`}
        icon={<StatusIcon className={cn('h-5 w-5', statusConfig?.color)} />}
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Tickets', href: '/admin/tickets' },
          { label: `#${ticket._id.slice(-6).toUpperCase()}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={ticket.status} />
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/tickets">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Description & Updates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-4 w-4" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ticket.description ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No description provided</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Updates/Comments Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="h-4 w-4" />
                  Activity
                  {updatesList.length > 0 && <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-normal">{updatesList.length}</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Comment */}
                <div className="flex gap-3 mb-6">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <Button onClick={handleAddComment} disabled={!commentText.trim() || isSubmitting} className="shrink-0">
                    {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>

                <Separator className="mb-6" />

                {/* Updates List */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {updatesList.length > 0 ? (
                      updatesList.map((update, index) => <UpdateItem key={String(update._id)} update={update} index={index} />)
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No activity yet</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Details & Actions */}
        <div className="space-y-6">
          {/* Status Actions Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Tag className="h-4 w-4" />
                  Status
                </CardTitle>
                <CardDescription>Update ticket status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(STATUS_CONFIG) as [TicketStatus, (typeof STATUS_CONFIG)[TicketStatus]][]).map(([status, config]) => {
                    const Icon = config.icon;
                    const isActive = ticket.status === status;
                    return (
                      <Button
                        key={status}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        disabled={isBusy || isActive}
                        onClick={() => handleStatusChange(status)}
                        className={cn('justify-start transition-all', isActive && 'pointer-events-none')}
                      >
                        {isActive ? <Check className="h-4 w-4 mr-2" /> : <Icon className={cn('h-4 w-4 mr-2', config.color)} />}
                        {config.label}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Priority Actions Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.175 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Flag className="h-4 w-4" />
                  Priority
                </CardTitle>
                <CardDescription>Update ticket priority</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {(Object.entries(PRIORITY_CONFIG) as [TicketPriority, (typeof PRIORITY_CONFIG)[TicketPriority]][]).map(([priority, config]) => {
                    const isActive = ticket.priority === priority;
                    return (
                      <Button
                        key={priority}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        disabled={isBusy || isActive}
                        onClick={() => handlePriorityChange(priority)}
                        className={cn('flex-1 transition-all', isActive && 'pointer-events-none')}
                      >
                        {isActive ? <Check className="h-4 w-4 mr-2" /> : <span className={cn('h-2 w-2 rounded-full mr-2', config.dotColor)} />}
                        {config.label}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer Information Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const customerName =
                    ticket.creatorInfo?.firstName || ticket.creatorInfo?.lastName
                      ? `${ticket.creatorInfo?.firstName || ''} ${ticket.creatorInfo?.lastName || ''}`.trim()
                      : null;
                  const customerInitials = customerName
                    ? customerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : ticket.creatorInfo?.email?.[0]?.toUpperCase() || 'U';

                  return (
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">{customerInitials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{customerName || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground truncate">{ticket.creatorInfo?.email || 'No email'}</p>
                      </div>
                    </div>
                  );
                })()}

                <Separator className="my-3" />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Contact Email</span>
                  </div>
                  <p className="font-medium pl-6 text-xs break-all">{ticket.creatorInfo?.email || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Details Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow icon={Tag} label="Status">
                  <StatusBadge status={ticket.status} size="sm" />
                </InfoRow>

                <InfoRow icon={Flag} label="Priority">
                  <span
                    className={cn(
                      'text-xs font-medium flex items-center gap-1.5 px-2 py-0.5 rounded-full',
                      priorityConfig?.bgColor,
                      priorityConfig?.color
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', priorityConfig?.dotColor)} />
                    {priorityConfig?.label}
                  </span>
                </InfoRow>

                <Separator className="my-3" />

                <InfoRow icon={UserPlus} label="Assigned to">
                  {ticket.assigneeInfo?.email || <span className="text-muted-foreground italic">Unassigned</span>}
                </InfoRow>

                <Separator className="my-3" />

                <InfoRow icon={Calendar} label="Created">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </InfoRow>

                <InfoRow icon={Clock} label="Updated">
                  {new Date(ticket.updatedAt).toLocaleString()}
                </InfoRow>

                <InfoRow icon={MessageSquare} label="Updates">
                  {ticket.updateCount || 0}
                </InfoRow>

                {/* Assignment Select */}
                {ticket.organizationId && eligibleAssignees.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="pt-2">
                      <label className="text-xs text-muted-foreground mb-2 block">Assign to team member</label>
                      <Select value={String(ticket.assignedToId || '')} onValueChange={handleAssign}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          {eligibleAssignees.map((m) => (
                            <SelectItem key={String(m.userId)} value={String(m.userId)}>
                              <span className="flex items-center gap-2">
                                <span>
                                  {m.userInfo.firstName || m.userInfo.lastName
                                    ? `${m.userInfo.firstName || ''} ${m.userInfo.lastName || ''}`.trim()
                                    : m.userInfo.email}
                                </span>
                                <span className="text-xs text-muted-foreground">({m.role.toLowerCase()})</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
