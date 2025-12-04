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

  const creatorName = log.isSystemLog
    ? 'SYSTEM'
    : log.creatorInfo
      ? `${log.creatorInfo.firstName ?? ''} ${log.creatorInfo.lastName ?? ''}`.trim() || log.creatorInfo.email
      : 'Unknown';

  const creatorInitials = log.isSystemLog
    ? 'SYS'
    : log.creatorInfo
      ? `${log.creatorInfo.firstName?.[0] ?? ''}${log.creatorInfo.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
      : 'U';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative pl-8 pb-6 last:pb-0"
    >
      {/* Timeline line */}
      <div className="absolute left-[13px] top-8 bottom-0 w-px bg-border last:hidden" />

      {/* Timeline dot */}
      <div className={cn('absolute left-0 top-1 h-7 w-7 rounded-full flex items-center justify-center', config?.bgColor || 'bg-muted')}>
        <Icon className={cn('h-3.5 w-3.5', config?.color || 'text-muted-foreground')} />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-normal">
              {config?.label || log.logType}
            </Badge>
            {log.isSystemLog && (
              <Badge variant="secondary" className="text-xs font-normal gap-1">
                <Bot className="h-3 w-3" />
                SYSTEM
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(log.createdAt)}</span>
        </div>

        {/* Reason/description */}
        <p className="text-sm font-medium">{log.reason}</p>

        {/* System message */}
        {log.message && <p className="text-sm text-muted-foreground">{log.message}</p>}

        {/* User message/note */}
        {log.userMessage && (
          <div className="mt-2 p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm italic">&ldquo;{log.userMessage}&rdquo;</p>
              </div>
            </div>
          </div>
        )}

        {/* Value changes */}
        {(log.previousValue || log.newValue) && (
          <div className="flex items-center gap-2 text-xs">
            {log.previousValue && (
              <Badge variant="outline" className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900">
                {log.previousValue}
              </Badge>
            )}
            {log.previousValue && log.newValue && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            {log.newValue && (
              <Badge
                variant="outline"
                className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
              >
                {log.newValue}
              </Badge>
            )}
          </div>
        )}

        {/* Creator info */}
        {!log.isSystemLog && log.creatorInfo && (
          <div className="flex items-center gap-2 pt-1">
            <Avatar className="h-5 w-5">
              {log.creatorInfo.imageUrl && <AvatarImage src={log.creatorInfo.imageUrl} />}
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{creatorInitials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{creatorName}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Loading skeleton
function LogsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state
function EmptyLogs() {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">No activity yet</p>
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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Activity Log
          {logs && logs.length > 0 && <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-normal">{logs.length}</span>}
        </CardTitle>
        <CardDescription>Order history and notes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LogsSkeleton />
        ) : !logs || logs.length === 0 ? (
          <EmptyLogs />
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-0">
              <AnimatePresence>
                {logs.map((log, index) => (
                  <LogEntry key={log._id} log={log} index={index} />
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default OrderLogsSection;
