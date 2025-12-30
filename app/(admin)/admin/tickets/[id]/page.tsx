'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showToast } from '@/lib/toast';

// Admin components
import { StatusBadge } from '@/src/components/admin/status-badge';

// UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Icons
import {
  Ticket,
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Send,
  Flag,
  UserPlus,
  History,
  RefreshCw,
  Tag,
  Info,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
type TicketUpdateType = 'STATUS_CHANGE' | 'COMMENT' | 'ASSIGNMENT' | 'PRIORITY_CHANGE' | 'ESCALATION';

// Ticket Update Interface
export interface TicketUpdate {
  _id: Id<'ticketUpdates'>;
  ticketId: Id<'tickets'>;
  update: TicketStatus;
  createdById: Id<'users'>;
  creatorInfo: {
    firstName?: string;
    lastName?: string;
    email: string;
    imageUrl?: string;
  };
  ticketInfo: {
    title: string;
    priority: string;
    category?: string;
  };
  content: string;
  updateType: TicketUpdateType;
  previousValue?: string;
  newValue?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  isInternal: boolean;
  createdAt: number;
  updatedAt: number;
}

// Configuration constants
const STATUS_CONFIG: Record<TicketStatus, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  OPEN: { icon: AlertCircle, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950/30', label: 'Open' },
  IN_PROGRESS: { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950/30', label: 'In Progress' },
  RESOLVED: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-950/30', label: 'Resolved' },
  CLOSED: { icon: XCircle, color: 'text-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-950/30', label: 'Closed' },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; dotColor: string; bgColor: string }> = {
  LOW: { label: 'Low', color: 'text-slate-600', dotColor: 'bg-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-900/30' },
  MEDIUM: { label: 'Medium', color: 'text-amber-600', dotColor: 'bg-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  HIGH: { label: 'High', color: 'text-red-600', dotColor: 'bg-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

const UPDATE_TYPE_ICONS: Record<string, React.ElementType> = {
  COMMENT: MessageSquare,
  STATUS_CHANGE: RefreshCw,
  ASSIGNMENT: UserPlus,
  PRIORITY_CHANGE: Flag,
};

// Activity Feed Item
function UpdateItem({ update, index }: { update: TicketUpdate; index: number }) {
  const Icon = UPDATE_TYPE_ICONS[update.updateType] || Info;
  const isComment = update.updateType === 'COMMENT';

  const creatorName =
    update.creatorInfo.firstName || update.creatorInfo.lastName
      ? `${update.creatorInfo.firstName || ''} ${update.creatorInfo.lastName || ''}`.trim()
      : update.creatorInfo.email || 'System';

  const initials = (creatorName || 'S').slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn('group flex gap-3', !isComment && 'pl-11')}
    >
      {isComment ? (
        <Avatar className="h-8 w-8 mt-1 border border-border">
          <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">{initials}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="relative">
          <div className="absolute left-[3px] top-4 w-px h-full bg-border/50 -translate-x-1/2" />
          <div className="h-2 w-2 rounded-full bg-border mt-2 ring-4 ring-background" />
        </div>
      )}

      <div className={cn('flex-1 space-y-1', isComment ? 'bg-muted/30 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl' : 'py-1')}>
        <div className="flex items-center gap-2">
          {!isComment && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className={cn('text-xs font-medium', !isComment && 'text-muted-foreground')}>{creatorName}</span>
          <span className="text-[10px] text-muted-foreground/60">{new Date(update.createdAt).toLocaleString()}</span>
        </div>

        {isComment ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{update.content}</p>
        ) : (
          <div className="text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
            <span>{update.content.replace(creatorName, 'changed')}</span>
            {update.newValue && update.updateType === 'STATUS_CHANGE' && <StatusBadge status={update.newValue} size="sm" />}
            {update.newValue && update.updateType === 'PRIORITY_CHANGE' && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                {PRIORITY_CONFIG[update.newValue as TicketPriority]?.label}
              </Badge>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Sidebar Info Row
function InfoRow({ icon: Icon, label, value, className }: { icon: React.ElementType; label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between text-sm', className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="font-medium text-foreground">{value}</div>
    </div>
  );
}

export default function AdminTicketDetailPage() {
  const params = useParams() as { id: string };
  const ticketId = params.id as Id<'tickets'>;

  // Queries
  const ticket = useQuery(api.tickets.queries.index.getTicketById, { ticketId });
  const updates = useQuery(api.tickets.queries.index.getTicketUpdates, { ticketId, limit: 100, offset: 0 });

  // Use organizationId from ticket if available, otherwise skip
  const membersQueryArgs = ticket?.organizationId ? { organizationId: ticket.organizationId, isActive: true, limit: 100 } : 'skip';
  const members = useQuery(api.organizations.queries.index.getOrganizationMembers, membersQueryArgs);

  // Mutations
  const addUpdate = useMutation(api.tickets.mutations.index.addTicketUpdate);
  const markRead = useMutation(api.tickets.mutations.index.markTicketRead);
  const assignTicket = useMutation(api.tickets.mutations.index.assignTicket);

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  // Mark as read
  useEffect(() => {
    if (ticket) markRead({ ticketId: ticket._id as Id<'tickets'> });
  }, [ticket, markRead]);

  const updatesList = useMemo(() => updates?.updates ?? [], [updates]);

  interface OrganizationMember {
    userId: Id<'users'>;
    role: 'ADMIN' | 'STAFF' | 'MEMBER';
    userInfo: { firstName?: string; lastName?: string; email: string };
  }

  const eligibleAssignees = useMemo<OrganizationMember[]>(() => {
    const orgMembers = (members as { page?: OrganizationMember[] } | undefined)?.page || [];

    // Only include org members with STAFF or ADMIN roles
    return orgMembers.filter((m) => m.role === 'STAFF' || m.role === 'ADMIN');
  }, [members]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
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
    } finally {
      setIsBusy(false);
    }
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!ticket || isBusy) return;
    setIsBusy(true);
    try {
      await addUpdate({
        ticketId: ticket._id as Id<'tickets'>,
        updateType: 'PRIORITY_CHANGE',
        content: `Priority changed from ${ticket.priority} to ${newPriority}`,
        previousValue: ticket.priority,
        newValue: newPriority,
        isInternal: false,
      });
      showToast({ type: 'success', title: 'Priority updated' });
    } catch (_err) {
      console.error('Priority update error:', _err);
      showToast({ type: 'error', title: 'Failed to update priority' });
    } finally {
      setIsBusy(false);
    }
  };

  const handleAssign = async (assigneeId: string) => {
    if (!ticket) return;
    try {
      await assignTicket({
        ticketId: ticket._id as Id<'tickets'>,
        assigneeId: assigneeId as Id<'users'>,
      });
      showToast({ type: 'success', title: 'Ticket assigned' });
    } catch (_err) {
      console.error('Ticket assignment error:', _err);
      showToast({ type: 'error', title: 'Failed to assign ticket' });
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !ticket) return;
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ticket || updates === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const _statusConfig = STATUS_CONFIG[ticket.status as TicketStatus];
  const _priorityConfig = PRIORITY_CONFIG[ticket.priority as TicketPriority];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0 h-9 w-9 rounded-full">
            <Link href="/admin/tickets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold font-admin-heading flex items-center gap-2">
              {ticket.title}
              <Badge variant="outline" className="font-mono text-xs font-normal text-muted-foreground">
                #{ticket._id.slice(-6).toUpperCase()}
              </Badge>
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              Created on {new Date(ticket.createdAt).toLocaleDateString()}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Updated {new Date(ticket.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ticket.status !== 'CLOSED' && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handleStatusChange('CLOSED')}
              disabled={isBusy}
            >
              Close Ticket
            </Button>
          )}
          <Button
            size="sm"
            className={cn(
              'h-8 bg-green-600 hover:bg-green-700 text-white',
              ticket.status === 'RESOLVED' && 'bg-muted text-muted-foreground hover:bg-muted'
            )}
            onClick={() => handleStatusChange('RESOLVED')}
            disabled={isBusy || ticket.status === 'RESOLVED'}
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Resolve
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Description */}
          <Card className="shadow-sm border-border/60 pt-0">
            <CardHeader className="pb-3 border-b bg-muted/40 px-5 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Ticket Details
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{ticket.description || 'No description provided.'}</p>
            </CardContent>
          </Card>

          {/* Activity Stream */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4" />
                Activity Stream
              </h3>
            </div>

            <Card className="overflow-hidden shadow-sm border-border/60 pt-0">
              <div className="p-3 bg-muted/30 border-b">
                <div className="relative">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-[80px] bg-background resize-none border-0 focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm"
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim() || isSubmitting} className="h-7 px-3 text-xs">
                      {isSubmitting ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <Send className="h-3 w-3 mr-1" />}
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
              <CardContent className="p-5 pt-0 max-h-[600px] overflow-y-auto">
                <div className="space-y-6">
                  {updatesList.length > 0 ? (
                    updatesList.map((update, idx) => <UpdateItem key={update._id} update={update} index={idx} />)
                  ) : (
                    <div className="text-center py-10 text-muted-foreground text-sm">No activity yet. Be the first to reply.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="shadow-sm border-border/60 pt-0">
            <CardHeader className="pb-3 border-b bg-muted/40 px-4 py-3">
              <CardTitle className="text-sm font-medium">Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Status</label>
                  <Select value={ticket.status} onValueChange={(v) => handleStatusChange(v as TicketStatus)} disabled={isBusy}>
                    <SelectTrigger className="h-9 w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <conf.icon className={cn('h-3.5 w-3.5', conf.color)} />
                            {conf.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Priority</label>
                  <Select value={ticket.priority} onValueChange={(v) => handlePriorityChange(v as TicketPriority)} disabled={isBusy}>
                    <SelectTrigger className="h-9 w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([key, conf]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span className={cn('h-2 w-2 rounded-full', conf.dotColor)} />
                            {conf.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60 pt-0">
            <CardHeader className="pb-3 border-b bg-muted/40 px-4 py-3">
              <CardTitle className="text-sm font-medium">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Assignee</label>
                <Select value={String(ticket.assignedToId || '')} onValueChange={handleAssign} disabled={isBusy}>
                  <SelectTrigger className="h-9 w-full bg-background">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className={cn('truncate', !ticket.assigneeInfo && 'text-muted-foreground')}>
                        {ticket.assigneeInfo?.email || 'Unassigned'}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleAssignees.map((m) => (
                      <SelectItem key={String(m.userId)} value={String(m.userId)}>
                        <div className="flex flex-col text-left">
                          <span className="font-medium text-xs">
                            {m.userInfo.firstName ? `${m.userInfo.firstName} ${m.userInfo.lastName || ''}` : m.userInfo.email.split('@')[0]}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{m.role.toLowerCase()}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60 pt-0">
            <CardHeader className="pb-3 border-b bg-muted/40 px-4 py-3">
              <CardTitle className="text-sm font-medium">Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              {/* Reporter */}
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {(ticket.creatorInfo?.email || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium">Reporter</p>
                  <p className="text-sm truncate max-w-[150px]">{ticket.creatorInfo?.email || 'Unknown'}</p>
                </div>
              </div>

              <Separator />

              <InfoRow icon={Ticket} label="Ticket ID" value={<span className="font-mono text-xs">#{ticket._id.slice(-6).toUpperCase()}</span>} />
              <InfoRow
                icon={Tag}
                label="Type"
                value={
                  <Badge variant="outline" className="text-[10px] h-5 font-normal px-2 capitalize">
                    {ticket.category || 'Support'}
                  </Badge>
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
