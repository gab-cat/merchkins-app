'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { motion } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { showToast } from '@/lib/toast';
import { buildR2PublicUrl } from '@/lib/utils';
import {
  ArrowLeft,
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Send,
  Calendar,
  User,
  Flag,
  RefreshCw,
  Hash,
  Building2,
} from 'lucide-react';
import type { Id, Doc } from '@/convex/_generated/dataModel';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
type TicketUpdate = Doc<'ticketUpdates'>;

// Status configuration
const STATUS_CONFIG: Record<TicketStatus, { icon: React.ElementType; bg: string; text: string; border: string; label: string }> = {
  OPEN: { icon: AlertCircle, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', label: 'Open' },
  IN_PROGRESS: { icon: Clock, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', label: 'In Progress' },
  RESOLVED: { icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', label: 'Resolved' },
  CLOSED: { icon: XCircle, bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Closed' },
};

// Priority configuration
const PRIORITY_CONFIG: Record<TicketPriority, { label: string; bg: string; text: string; dot: string }> = {
  LOW: { label: 'Low', bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
  HIGH: { label: 'High', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
};

function StatusBadge({ value, large = false }: { value: TicketStatus; large?: boolean }) {
  const config = STATUS_CONFIG[value];

  // Guard against invalid status values
  if (!config) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 font-medium rounded-full border bg-slate-50 text-slate-500 border-slate-200">
        {value || 'Unknown'}
      </span>
    );
  }

  const Icon = config.icon;

  if (large) {
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="h-4 w-4" />
        <span className="font-semibold text-sm">{config.label}</span>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 font-medium rounded-full border shadow-none ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function PriorityBadge({ value }: { value: TicketPriority }) {
  const config = PRIORITY_CONFIG[value];

  // Guard against invalid priority values
  if (!config) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-50 text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        {value || 'Unknown'}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

// Progress steps component
function TicketProgressStepper({ status }: { status: TicketStatus }) {
  const steps: { key: TicketStatus; label: string }[] = [
    { key: 'OPEN', label: 'Submitted' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'CLOSED', label: 'Closed' },
  ];
  const currentIndex = steps.findIndex((s) => s.key === status);

  // Color mapping for progress steps
  const stepColors: Record<TicketStatus, { bg: string; ring: string; connector: string }> = {
    OPEN: { bg: 'bg-amber-500', ring: 'ring-amber-500/20', connector: 'bg-amber-400' },
    IN_PROGRESS: { bg: 'bg-blue-500', ring: 'ring-blue-500/20', connector: 'bg-blue-400' },
    RESOLVED: { bg: 'bg-emerald-500', ring: 'ring-emerald-500/20', connector: 'bg-emerald-400' },
    CLOSED: { bg: 'bg-slate-500', ring: 'ring-slate-500/20', connector: 'bg-slate-400' },
  };

  return (
    <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/50">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Progress</h3>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const config = STATUS_CONFIG[step.key];
          const colors = stepColors[step.key];
          const Icon = config.icon;

          // Determine colors based on completion status
          const stepBgColor = isCompleted ? colors.bg : 'bg-slate-200';
          const stepRingClass = isCurrent ? `ring-4 ${colors.ring}` : '';
          const connectorColor = index < currentIndex ? colors.connector : 'bg-slate-200';
          const labelColor = isCurrent ? config.text : 'text-slate-500';

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${stepBgColor} ${stepRingClass}`}
                >
                  <Icon className={`h-5 w-5 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <span className={`mt-2 text-xs font-medium ${labelColor}`}>{step.label}</span>
              </div>
              {index < steps.length - 1 && <div className={`flex-1 h-1 mx-2 rounded ${connectorColor}`} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Update item component
function UpdateItem({
  update,
  index,
}: {
  update: TicketUpdate & { creatorInfo?: { firstName?: string; lastName?: string; email: string; imageUrl?: string } | null };
  index: number;
}) {
  const isComment = update.updateType === 'COMMENT';
  const creatorName =
    update.creatorInfo?.firstName || update.creatorInfo?.lastName
      ? `${update.creatorInfo?.firstName || ''} ${update.creatorInfo?.lastName || ''}`.trim()
      : update.creatorInfo?.email || 'Support Team';

  const initials = creatorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const imageUrl = buildR2PublicUrl(update.creatorInfo?.imageUrl || null);

  const formatDate = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex gap-3 ${isComment ? 'items-start' : 'items-center'}`}
    >
      <Avatar className="h-8 w-8 shrink-0">
        {imageUrl && <AvatarImage src={imageUrl} alt={creatorName} />}
        <AvatarFallback className="text-xs bg-[#1d43d8]/10 text-[#1d43d8]">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        {isComment ? (
          <div className="rounded-xl border border-slate-100 bg-white p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm text-slate-900">{creatorName}</span>
              <span className="text-xs text-slate-400">{formatDate(update.createdAt)}</span>
            </div>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{update.content}</p>
          </div>
        ) : (
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">{update.content}</span>
              {update.newValue && <StatusBadge value={update.newValue as TicketStatus} />}
            </div>
            <span className="text-xs text-slate-400">{formatDate(update.createdAt)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

export function TicketDetail({ ticketId, backUrl = '/tickets' }: { ticketId: string; backUrl?: string }) {
  const ticket = useQuery(api.tickets.queries.index.getTicketById, { ticketId: ticketId as Id<'tickets'> });
  const updates = useQuery(api.tickets.queries.index.getTicketUpdates, {
    ticketId: ticketId as Id<'tickets'>,
    limit: 100,
    offset: 0,
  });

  const addUpdate = useMutation(api.tickets.mutations.index.addTicketUpdate);

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loading = ticket === undefined || updates === undefined;
  const updatesList = useMemo(() => updates?.updates || [], [updates]);

  const handleAddComment = async () => {
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
    } catch {
      showToast({ type: 'error', title: 'Failed to add comment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-[#1d43d8]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#1d43d8] animate-spin" />
          </div>
          <p className="text-slate-500 text-sm">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (ticket === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Ticket className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold mb-2 font-heading">Ticket not found</h2>
          <p className="text-slate-500 text-sm mb-4">This ticket doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Link href={backUrl}>
            <Button variant="outline" className="rounded-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tickets
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const ticketNumber = `#${ticket._id.slice(-6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Back link */}
          <motion.div variants={itemVariants}>
            <Link href={backUrl} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1d43d8] mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Tickets
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-[#1d43d8]/10">
                    <Ticket className="h-5 w-5 text-[#1d43d8]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold font-heading tracking-tight text-slate-900">{ticket.title}</h1>
                    <span className="text-sm text-slate-400 font-mono">{ticketNumber}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500 mt-2">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {ticket.organizationId && (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      Organization Ticket
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge value={ticket.status as TicketStatus} large />
                <PriorityBadge value={ticket.priority as TicketPriority} />
              </div>
            </div>
          </motion.div>

          {/* Progress Stepper */}
          <motion.div variants={itemVariants} className="mb-6">
            <TicketProgressStepper status={ticket.status as TicketStatus} />
          </motion.div>

          {/* Description */}
          {ticket.description && (
            <motion.div variants={itemVariants} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Description</h2>
              </div>
              <div className="rounded-xl border border-slate-100 p-4 bg-white">
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </motion.div>
          )}

          {/* Details */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Details</h2>
            </div>
            <div className="rounded-xl border border-slate-100 p-4 bg-white">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status</span>
                  <StatusBadge value={ticket.status as TicketStatus} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Priority</span>
                  <PriorityBadge value={ticket.priority as TicketPriority} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Created by</span>
                  <span className="font-medium text-slate-900">{ticket.creatorInfo?.email || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Assigned to</span>
                  <span className="font-medium text-slate-900">
                    {ticket.assigneeInfo?.email || <span className="text-slate-400 italic">Unassigned</span>}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Activity / Updates */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Activity ({updatesList.length})</h2>
            </div>

            {/* Add comment */}
            <div className="rounded-xl border border-slate-100 p-4 bg-white mb-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs bg-[#1d43d8]/10 text-[#1d43d8]">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Add a comment or update..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[80px] resize-none border-slate-200 focus:border-[#1d43d8] focus:ring-[#1d43d8]/20"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleAddComment}
                      disabled={!commentText.trim() || isSubmitting}
                      className="bg-[#1d43d8] hover:bg-[#1d43d8]/90 rounded-full px-4"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Updates list */}
            <div className="space-y-4">
              {updatesList.length > 0 ? (
                updatesList.map((update, index) => <UpdateItem key={String(update._id)} update={update} index={index} />)
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-400">No activity yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Ticket ID */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between text-xs text-slate-400 py-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <Hash className="h-3 w-3" />
                Ticket ID
              </span>
              <span className="font-mono">{ticket._id}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
