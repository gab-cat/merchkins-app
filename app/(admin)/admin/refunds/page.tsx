'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Clock, CheckCircle2, XCircle, Receipt, Inbox } from 'lucide-react';
import { PageHeader } from '@/src/components/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangeFilter, DateRange } from '@/src/components/ui/date-range-filter';
import { useDebouncedSearch } from '@/src/hooks/use-debounced-search';
import { useCursorPagination } from '@/src/hooks/use-pagination';
import { cn } from '@/lib/utils';
import { RefundRequestDetailDialog } from '@/src/features/admin/components/refunds/refund-request-detail-dialog';

type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

function formatCurrency(amount: number | undefined) {
  if (amount === undefined) return '—';
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  } catch {
    return `₱${amount.toFixed(2)}`;
  }
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: RefundStatus }) {
  const config = {
    PENDING: { label: 'Pending', icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
    APPROVED: { label: 'Approved', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
    REJECTED: { label: 'Rejected', icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500' },
  }[status];

  const Icon = config.icon;

  return (
    <Badge className={cn('text-xs font-medium border px-2.5 py-1 flex items-center gap-1.5 w-fit', config.className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)} />
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

type RefundRequest = {
  _id: string;
  orderInfo: { orderNumber?: string };
  customerInfo: { email: string; firstName?: string; lastName?: string; imageUrl?: string };
  refundAmount: number;
  status: RefundStatus;
  reason?: string;
  createdAt: number;
};

// Refund reason labels for display
const REFUND_REASON_LABELS: Record<string, string> = {
  WRONG_SIZE: 'Wrong Size',
  WRONG_ITEM: 'Wrong Item',
  WRONG_PAYMENT: 'Wrong Payment',
  DEFECTIVE_ITEM: 'Defective Item',
  NOT_AS_DESCRIBED: 'Not as Described',
  CHANGED_MIND: 'Changed Mind',
  DUPLICATE_ORDER: 'Duplicate Order',
  DELIVERY_ISSUE: 'Delivery Issue',
  OTHER: 'Other',
};

type RefundQueryArgs = {
  organizationId?: string;
  status?: RefundStatus;
  dateFrom?: number;
  dateTo?: number;
  search?: string;
  limit?: number;
  cursor?: string | null;
};

export default function AdminRefundsPage() {
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org');
  const [status, setStatus] = useState<RefundStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const debouncedSearch = useDebouncedSearch(search, 300);

  // Get organization by slug from URL parameter
  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');

  const baseArgs = useMemo(
    (): RefundQueryArgs => ({
      organizationId: organization?._id,
      status: status === 'ALL' ? undefined : status,
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo,
      search: debouncedSearch || undefined,
    }),
    [organization?._id, status, dateRange, debouncedSearch]
  );

  const {
    items: refundRequests,
    isLoading: loading,
    hasMore,
    loadMore,
  } = useCursorPagination<RefundRequest, RefundQueryArgs>({
    query: api.refundRequests.queries.index.getRefundRequests,
    baseArgs: organization?._id ? baseArgs : 'skip',
    limit: 25,
    selectPage: (res: unknown) => {
      const typedRes = res as { page: RefundRequest[]; isDone: boolean; continueCursor: string | null };
      return {
        page: typedRes.page || [],
        isDone: typedRes.isDone ?? false,
        continueCursor: typedRes.continueCursor ?? null,
      };
    },
  });

  const stats = useMemo(() => {
    return {
      total: refundRequests.length,
      pending: refundRequests.filter((r) => r.status === 'PENDING').length,
      approved: refundRequests.filter((r) => r.status === 'APPROVED').length,
      rejected: refundRequests.filter((r) => r.status === 'REJECTED').length,
    };
  }, [refundRequests]);

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader
        title="Refund Requests"
        description="Review and manage customer refund requests"
        icon={<Receipt className="h-5 w-5" />}
        breadcrumbs={[{ label: 'Admin', href: '/admin/overview' }, { label: 'Refunds' }]}
      />

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          {
            label: 'Total Requests',
            value: stats.total,
            icon: Receipt,
            color: 'text-slate-600',
            bgColor: 'bg-slate-50',
            borderColor: 'border-slate-200',
          },
          {
            label: 'Pending Review',
            value: stats.pending,
            icon: Clock,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
          },
          {
            label: 'Approved',
            value: stats.approved,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
          },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn('rounded-xl border p-4 transition-all duration-200 hover:shadow-md cursor-default', stat.bgColor, stat.borderColor)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <p className={cn('text-3xl font-bold font-admin-heading tracking-tight', stat.color)}>{loading ? '—' : stat.value}</p>
                </div>
                <div className={cn('p-2.5 rounded-full', stat.bgColor)}>
                  <Icon className={cn('h-5 w-5', stat.color)} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative max-w-xs flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-white"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as RefundStatus | 'ALL')}>
            <SelectTrigger className="w-[140px] h-9 bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order #</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reason</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Requested</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-muted animate-pulse rounded-full" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-24 bg-muted animate-pulse rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : refundRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-muted/50">
                      <Inbox className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">No refund requests found</p>
                      <p className="text-sm text-muted-foreground/70 mt-0.5">
                        {search || status !== 'ALL' || dateRange.dateFrom || dateRange.dateTo
                          ? 'Try adjusting your filters'
                          : 'Refund requests will appear here'}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              refundRequests.map((request, index) => (
                <motion.tr
                  key={request._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="cursor-pointer hover:bg-muted/50 border-b transition-colors group"
                  onClick={() => setSelectedRequestId(request._id)}
                >
                  <TableCell className="font-mono font-medium text-sm">{request.orderInfo.orderNumber ?? `#${request._id.slice(-8)}`}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border">
                        <AvatarImage src={request.customerInfo.imageUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {request.customerInfo.firstName?.[0] || request.customerInfo.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {[request.customerInfo.firstName, request.customerInfo.lastName].filter(Boolean).join(' ') || 'Customer'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{request.customerInfo.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {request.reason ? REFUND_REASON_LABELS[request.reason] || request.reason : 'Other'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-sm tabular-nums">{formatCurrency(request.refundAmount)}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(request.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequestId(request._id);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Load More */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore}>
            Load More Requests
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      {selectedRequestId && (
        <RefundRequestDetailDialog
          refundRequestId={selectedRequestId}
          open={!!selectedRequestId}
          onOpenChange={(open) => !open && setSelectedRequestId(null)}
        />
      )}
    </div>
  );
}
