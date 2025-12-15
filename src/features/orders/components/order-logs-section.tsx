'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id, Doc } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

// Icons
import { Clock, Package, CreditCard, MessageSquare, AlertCircle, Bot, User, ArrowRight, FileText, XCircle, CheckCircle } from 'lucide-react';

type OrderLog = Doc<'orderLogs'>;

// Log type configuration
const LOG_TYPE_CONFIG: Record<
  OrderLog['logType'],
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  ORDER_CREATED: {
    icon: Package,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950/30',
    label: 'Order Created',
  },
  STATUS_CHANGE: {
    icon: ArrowRight,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950/30',
    label: 'Status Change',
  },
  PAYMENT_UPDATE: {
    icon: CreditCard,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-950/30',
    label: 'Payment Update',
  },
  ITEM_MODIFICATION: {
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-950/30',
    label: 'Item Modified',
  },
  NOTE_ADDED: {
    icon: MessageSquare,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100 dark:bg-slate-950/30',
    label: 'Note Added',
  },
  SYSTEM_UPDATE: {
    icon: Bot,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100 dark:bg-cyan-950/30',
    label: 'System Update',
  },
  ORDER_CANCELLED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-950/30',
    label: 'Order Cancelled',
  },
};

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// Log entry component
function LogEntry({ log, index }: { log: OrderLog; index: number }) {
  const config = LOG_TYPE_CONFIG[log.logType];
  const Icon = config?.icon || AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="relative pl-6 pb-4 last:pb-0 group"
    >
      {/* Timeline line - thinner and subtle */}
      <div className="absolute left-[7px] top-5 bottom-0 w-px bg-slate-200 group-last:hidden" />

      {/* Timeline dot - smaller and cleaner */}
      <div
        className={cn(
          'absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full flex items-center justify-center ring-2 ring-white',
          config?.bgColor || 'bg-slate-100'
        )}
      >
        <Icon className={cn('h-2.5 w-2.5', config?.color || 'text-slate-400')} />
      </div>

      {/* Content - compact single line where possible */}
      <div className="min-w-0">
        {/* Main row: reason + time */}
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm text-slate-700 leading-snug">
            {log.reason}
            {/* Inline value changes */}
            {(log.previousValue || log.newValue) && (
              <span className="text-slate-400 ml-1">
                {log.previousValue && <span className="line-through text-red-400">{log.previousValue}</span>}
                {log.previousValue && log.newValue && <span className="mx-1">→</span>}
                {log.newValue && <span className="text-emerald-600 font-medium">{log.newValue}</span>}
              </span>
            )}
          </p>
          <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">{formatRelativeTime(log.createdAt)}</span>
        </div>

        {/* System message - subtle */}
        {log.message && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{log.message}</p>}

        {/* User message/note - compact quote style */}
        {log.userMessage && (
          <div className="mt-1.5 pl-3 border-l-2 border-slate-200">
            <p className="text-xs text-slate-500 italic">&ldquo;{log.userMessage}&rdquo;</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Loading skeleton
function LogsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-2.5 pl-6">
          <Skeleton className="h-[15px] w-[15px] rounded-full shrink-0 absolute left-4" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state
function EmptyLogs() {
  return (
    <div className="text-center py-6 text-slate-400">
      <Clock className="h-5 w-5 mx-auto mb-1.5 opacity-40" />
      <p className="text-xs">No activity yet</p>
    </div>
  );
}

interface OrderLogsSectionProps {
  orderId: Id<'orders'>;
  limit?: number;
  publicOnly?: boolean;
  className?: string;
}

export function OrderLogsSection({ orderId, limit, publicOnly = false, className }: OrderLogsSectionProps) {
  const logs = useQuery(api.orders.queries.index.getOrderLogs, {
    orderId,
    limit,
    publicOnly,
  });

  const isLoading = logs === undefined;

  return (
    <div className={cn('p-4', className)}>
      {/* Minimal header */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Activity</h3>
        {logs && logs.length > 0 && <span className="text-[10px] text-slate-400 font-normal">({logs.length})</span>}
      </div>

      {/* Content */}
      {isLoading ? (
        <LogsSkeleton />
      ) : !logs || logs.length === 0 ? (
        <EmptyLogs />
      ) : (
        <div className="max-h-[280px] overflow-y-auto pr-2 -mr-2">
          <AnimatePresence>
            {logs.map((log, index) => (
              <LogEntry key={log._id} log={log} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default OrderLogsSection;
