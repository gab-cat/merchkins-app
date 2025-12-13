'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { BlurFade } from '@/src/components/ui/animations/effects';
import {
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ChevronRight,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Inbox,
  Loader2,
  Building2,
  User,
  Flag,
} from 'lucide-react';
import type { Id, Doc } from '@/convex/_generated/dataModel';

type TicketType = Doc<'tickets'>;
type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

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

function StatusBadge({ value }: { value: TicketStatus }) {
  const config = STATUS_CONFIG[value];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 font-medium rounded-full border shadow-none ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function PriorityIndicator({ value }: { value: TicketPriority }) {
  const config = PRIORITY_CONFIG[value];
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 font-medium rounded-full ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function formatRelativeDate(ts: number) {
  const now = Date.now();
  const diff = now - ts;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: new Date(ts).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Ticket Progress Steps
function TicketProgress({ status }: { status: TicketStatus }) {
  const steps: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const currentIndex = steps.indexOf(status);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <React.Fragment key={step}>
            <div
              className={`h-2 w-2 rounded-full transition-all ${
                isCompleted ? (isCurrent ? 'bg-[#1d43d8] ring-2 ring-[#1d43d8]/20' : 'bg-[#1d43d8]') : 'bg-slate-200'
              }`}
              title={STATUS_CONFIG[step].label}
            />
            {index < steps.length - 1 && <div className={`h-0.5 w-4 ${index < currentIndex ? 'bg-[#1d43d8]' : 'bg-slate-200'}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function ConsolidatedTicketsPage() {
  const { userId: clerkId } = useAuth();
  const currentUser = useQuery(api.users.queries.index.getCurrentUser, clerkId ? { clerkId } : 'skip');

  const orgs = useQuery(api.organizations.queries.index.getOrganizationsByUser, currentUser?._id ? { userId: currentUser._id } : 'skip');

  const personal = useQuery(api.tickets.queries.index.getTickets, currentUser?._id ? { createdById: currentUser._id } : 'skip');

  const [selectedStatus, setSelectedStatus] = useState<'ALL' | TicketStatus>('ALL');

  // Combine personal tickets and filter
  const allTickets = useMemo(() => {
    const personalList = (personal?.tickets || []).filter((t: TicketType) => !t.organizationId);
    if (selectedStatus === 'ALL') return personalList;
    return personalList.filter((t: TicketType) => t.status === selectedStatus);
  }, [personal, selectedStatus]);

  // Group tickets by date
  const groupedTickets = useMemo(() => {
    const map = new Map<string, TicketType[]>();
    for (const ticket of allTickets) {
      const key = formatRelativeDate(ticket.createdAt);
      const arr = map.get(key) ?? [];
      arr.push(ticket);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [allTickets]);

  const loading = currentUser === undefined || orgs === undefined || personal === undefined;

  const statusFilters: Array<{ key: 'ALL' | TicketStatus; label: string; icon: React.ElementType }> = [
    { key: 'ALL', label: 'All', icon: Inbox },
    { key: 'OPEN', label: 'Open', icon: AlertCircle },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: Clock },
    { key: 'RESOLVED', label: 'Resolved', icon: CheckCircle2 },
  ];

  if (currentUser === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <BlurFade delay={0.1}>
          <div className="text-center max-w-sm mx-auto px-4">
            <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold mb-2 font-heading">Sign in required</h2>
            <p className="text-slate-500 text-sm">Please sign in to view your tickets.</p>
          </div>
        </BlurFade>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <BlurFade delay={0.1}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#1d43d8]/10">
                <Ticket className="h-5 w-5 text-[#1d43d8]" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-heading tracking-tight text-slate-900">Support Tickets</h1>
                <p className="text-slate-500 text-sm">Track and manage your support requests</p>
              </div>
            </div>
            {allTickets.length > 0 && (
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {allTickets.length} ticket{allTickets.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </BlurFade>

        {/* Status filters - horizontal scroll on mobile */}
        <BlurFade delay={0.15}>
          <div className="mb-6 -mx-4 px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {statusFilters.map((f) => {
                const Icon = f.icon;
                const isSelected = selectedStatus === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setSelectedStatus(f.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200 ${
                      isSelected ? 'bg-[#1d43d8] text-white shadow-md shadow-[#1d43d8]/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </BlurFade>

        {/* Create New Ticket Button */}
        <BlurFade delay={0.2}>
          <Link href="/tickets/new" className="block mb-6">
            <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 hover:border-[#1d43d8]/30 hover:bg-[#1d43d8]/5 transition-all cursor-pointer group">
              <div className="flex items-center justify-center gap-2 text-slate-500 group-hover:text-[#1d43d8]">
                <Plus className="h-5 w-5" />
                <span className="font-medium">Create New Ticket</span>
              </div>
            </div>
          </Link>
        </BlurFade>

        {/* Personal Tickets Section */}
        <div className="mb-8">
          <BlurFade delay={0.25}>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Personal Tickets</h2>
            </div>
          </BlurFade>

          {/* Loading state */}
          {loading && (
            <div className="space-y-3">
              {new Array(3).fill(null).map((_, i) => (
                <div key={`skeleton-${i}`} className="rounded-xl border border-slate-100 p-4 animate-pulse">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-48 rounded bg-slate-100" />
                      <div className="h-3 w-32 rounded bg-slate-100" />
                    </div>
                    <div className="h-6 w-20 rounded-full bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && allTickets.length === 0 && (
            <BlurFade delay={0.3}>
              <div className="py-12 text-center">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
                  <div className="h-20 w-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#1d43d8]/10 to-[#adfc04]/10 flex items-center justify-center">
                    <Ticket className="h-10 w-10 text-[#1d43d8]/50" />
                  </div>
                  <h2 className="text-lg font-bold mb-2 font-heading text-slate-900">No tickets yet</h2>
                  <p className="text-slate-500 text-sm mb-6">Create a support ticket to get help</p>
                  <Link href="/tickets/new">
                    <Button className="bg-[#1d43d8] hover:bg-[#1d43d8]/90 rounded-full px-6 h-10 font-semibold shadow-lg shadow-[#1d43d8]/25">
                      Create Ticket
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </BlurFade>
          )}

          {/* Tickets grouped by date */}
          <AnimatePresence mode="wait">
            {groupedTickets.map(([label, list], groupIndex) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.05 }}
                className="mb-6"
              >
                {/* Date label */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* Ticket cards */}
                <div className="space-y-2">
                  {list.map((ticket, ticketIndex) => (
                    <motion.div
                      key={ticket._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * ticketIndex }}
                    >
                      <Link
                        href={`/tickets/${ticket._id}`}
                        className="block rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-slate-900 text-sm truncate">{ticket.title}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                <span>{formatTime(ticket.createdAt)}</span>
                                <span className="text-slate-300">•</span>
                                <span className="font-mono text-slate-400">#{ticket._id.slice(-6).toUpperCase()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TicketProgress status={ticket.status as TicketStatus} />
                                {ticket.updateCount > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <MessageSquare className="h-3 w-3" />
                                    {ticket.updateCount}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <StatusBadge value={ticket.status as TicketStatus} />
                              <PriorityIndicator value={ticket.priority as TicketPriority} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Organization Tickets Section */}
        {orgs && orgs.length > 0 && (
          <div>
            <BlurFade delay={0.35}>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Organization Tickets</h2>
              </div>
            </BlurFade>

            <div className="space-y-4">
              {orgs
                .filter((org) => org._id)
                .map((org, orgIndex) => (
                  <OrgTicketsCard key={String(org._id)} org={org as Doc<'organizations'>} delay={0.4 + orgIndex * 0.05} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Organization tickets card component
function OrgTicketsCard({ org, delay }: { org: Doc<'organizations'>; delay: number }) {
  const tickets = useQuery(api.tickets.queries.index.getTickets, org?._id ? { organizationId: org._id, limit: 5 } : 'skip');

  const loading = tickets === undefined;
  const ticketsList = tickets?.tickets || [];
  const openCount = ticketsList.filter((t: TicketType) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  return (
    <BlurFade delay={delay}>
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
        {/* Org Header */}
        <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#1d43d8]/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-[#1d43d8]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">{org.name}</h3>
              <p className="text-xs text-slate-400">/{org.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {openCount > 0 && <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{openCount} active</span>}
            <Link href={`/o/${org.slug}/tickets`} prefetch>
              <Button variant="ghost" size="sm" className="text-xs h-7">
                View All
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Tickets List */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-4 space-y-3">
              {new Array(2).fill(null).map((_, i) => (
                <div key={`skeleton-${i}`} className="flex items-center justify-between">
                  <div className="h-4 w-48 rounded bg-slate-100 animate-pulse" />
                  <div className="h-5 w-16 rounded-full bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          ) : ticketsList.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-slate-400">No tickets for this organization</p>
              <Link href={`/o/${org.slug}/tickets/new`}>
                <Button variant="link" size="sm" className="text-[#1d43d8] mt-1">
                  <Plus className="h-3 w-3 mr-1" />
                  Create Ticket
                </Button>
              </Link>
            </div>
          ) : (
            ticketsList.slice(0, 3).map((ticket: TicketType) => (
              <Link
                key={ticket._id}
                href={`/o/${org.slug}/tickets/${ticket._id}`}
                className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-700 truncate group-hover:text-[#1d43d8] transition-colors">{ticket.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatRelativeDate(ticket.createdAt)} • #{ticket._id.slice(-6).toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge value={ticket.status as TicketStatus} />
                  <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </BlurFade>
  );
}
