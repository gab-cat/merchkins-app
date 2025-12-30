'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/convex/_generated/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingBag, Plus, Search, User, Package, ExternalLink, MoreHorizontal, RefreshCw, Tag } from 'lucide-react';
import { PageHeader, OrderStatusBadge, PaymentStatusBadge, OrdersEmptyState } from '@/src/components/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { DateRangeFilter, DateRange } from '@/src/components/ui/date-range-filter';
import { useDebouncedSearch } from '@/src/hooks/use-debounced-search';
import { useCursorPagination } from '@/src/hooks/use-pagination';
import { cn } from '@/lib/utils';
import { BatchBadge } from '@/src/features/admin/components/batches/batch-badge';
import { BatchAssignModal } from '@/src/features/admin/components/batches/batch-assign-modal';
import { useSearchParams } from 'next/navigation';
import type { Id } from '@/convex/_generated/dataModel';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED';
type PaymentStatus = 'PENDING' | 'DOWNPAYMENT' | 'PAID' | 'REFUNDED';

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
  });
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

type Order = {
  _id: string;
  orderNumber?: string;
  status: string;
  paymentStatus?: string;
  orderDate: number;
  itemCount: number;
  totalAmount?: number;
  customerInfo?: { email?: string; firstName?: string; lastName?: string };
  batchInfo?: Array<{ id: Id<'orderBatches'>; name: string }>;
  batchIds?: Id<'orderBatches'>[];
};

type OrderQueryArgs = {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: number;
  dateTo?: number;
  search?: string;
  includeDeleted?: boolean;
  limit?: number;
  cursor?: string | null;
};

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get('org') || null;

  const organization = useQuery(api.organizations.queries.index.getOrganizationBySlug, orgSlug ? { slug: orgSlug } : 'skip');

  const batches = useQuery(
    api.orderBatches.index.getBatches,
    organization?._id ? { organizationId: organization._id, includeDeleted: false } : 'skip'
  );

  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | 'ALL'>('ALL');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [refreshing, setRefreshing] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<Id<'orders'> | null>(null);

  const debouncedSearch = useDebouncedSearch(search, 300);

  const baseArgs = useMemo(
    (): OrderQueryArgs => ({
      status: status === 'ALL' ? undefined : status,
      paymentStatus: paymentStatus === 'ALL' ? undefined : paymentStatus,
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo,
      search: debouncedSearch || undefined,
      includeDeleted: true,
    }),
    [status, paymentStatus, dateRange, debouncedSearch]
  );

  const {
    items: allOrders,
    isLoading: loading,
    hasMore,
    loadMore,
  } = useCursorPagination<Order, OrderQueryArgs>({
    query: api.orders.queries.index.getOrdersPage,
    baseArgs,
    limit: 25,
    selectPage: (res: unknown) => {
      const typedRes = res as { page: Order[]; isDone: boolean; continueCursor: string | null };
      return {
        page: typedRes.page || [],
        isDone: typedRes.isDone ?? false,
        continueCursor: typedRes.continueCursor ?? null,
      };
    },
  });

  // Filter orders by batch if batch filter is set
  const orders = useMemo(() => {
    if (batchFilter === 'ALL' || !batches) {
      return allOrders;
    }
    return allOrders.filter((order) => order.batchIds?.includes(batchFilter as Id<'orderBatches'>));
  }, [allOrders, batchFilter, batches]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'PENDING').length,
      processing: orders.filter((o) => o.status === 'PROCESSING').length,
      delivered: orders.filter((o) => o.status === 'DELIVERED').length,
    };
  }, [orders]);

  return (
    <div className="space-y-6 font-admin-body">
      <PageHeader
        title="Orders"
        description="Manage and process customer orders"
        icon={<ShoppingBag className="h-5 w-5" />}
        breadcrumbs={[{ label: 'Admin', href: '/admin/overview' }, { label: 'Orders' }]}
        actions={
          <Link href="/admin/orders/new">
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Create Order
            </Button>
          </Link>
        }
      />

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: 'Total Orders', value: stats.total, color: 'text-foreground' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
          { label: 'Processing', value: stats.processing, color: 'text-blue-600' },
          { label: 'Delivered', value: stats.delivered, color: 'text-emerald-600' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg border bg-card p-3"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={cn('text-2xl font-bold font-admin-heading', stat.color)}>{loading ? '—' : stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative max-w-xs flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by order # or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus | 'ALL')}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="READY">Ready</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus | 'ALL')}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Payments</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="DOWNPAYMENT">Downpayment</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>
          {batches && batches.length > 0 && (
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Batches</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch._id} value={batch._id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={cn('h-4 w-4 mr-1', refreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Order #</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Payment</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Batch</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Items</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Customer</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-right">Total</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-20 rounded bg-muted animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-20 rounded bg-muted animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-16 rounded bg-muted animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-8 rounded bg-muted animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-4 w-16 rounded bg-muted animate-pulse ml-auto" />
                    </TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-40">
                    <OrdersEmptyState />
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order, index) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="group hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <Link href={`/admin/orders/${order._id}`} className="text-primary hover:underline flex items-center gap-1">
                        #{order.orderNumber || 'N/A'}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status as OrderStatus} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={(order.paymentStatus || 'PENDING') as PaymentStatus} />
                    </TableCell>
                    <TableCell>
                      {order.batchInfo && order.batchInfo.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {order.batchInfo.map((batch) => {
                            // Check if batch is archived by looking it up
                            const batchData = batches?.find((b) => b._id === batch.id);
                            return <BatchBadge key={batch.id} name={batch.name} isArchived={batchData?.isDeleted || false} size="sm" />;
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{formatDate(order.orderDate)}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(order.orderDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Package className="h-3.5 w-3.5" />
                        {order.itemCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm truncate max-w-[150px]">
                          {order.customerInfo?.firstName || order.customerInfo?.lastName
                            ? `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim()
                            : order.customerInfo?.email || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order._id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                          <DropdownMenuItem>Send Notification</DropdownMenuItem>
                          {organization && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedOrderForAssign(order._id as Id<'orders'>);
                                  setAssignModalOpen(true);
                                }}
                              >
                                <Tag className="h-4 w-4 mr-2" />
                                Assign to Batch
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Print Invoice</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Cancel Order</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Load More */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore}>
            Load More Orders
          </Button>
        </div>
      )}

      {/* Batch Assign Modal */}
      {organization && selectedOrderForAssign && (
        <BatchAssignModal
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          organizationId={organization._id}
          orderIds={[selectedOrderForAssign]}
          onSuccess={() => {
            setSelectedOrderForAssign(null);
          }}
        />
      )}
    </div>
  );
}
