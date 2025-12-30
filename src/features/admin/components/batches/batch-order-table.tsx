'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { OrderStatusBadge, PaymentStatusBadge } from '@/src/components/admin';
import Link from 'next/link';
import { ExternalLink, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Id } from '@/convex/_generated/dataModel';

interface BatchOrderTableProps {
  batchId: Id<'orderBatches'>;
  onSelectionChange?: (selectedIds: string[]) => void;
}

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

export function BatchOrderTable({ batchId, onSelectionChange }: BatchOrderTableProps) {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const prevSelectionRef = React.useRef<string>('');
  const onSelectionChangeRef = React.useRef(onSelectionChange);

  // Keep ref updated with latest callback
  React.useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  React.useEffect(() => {
    if (onSelectionChangeRef.current) {
      const currentSelection = Array.from(selectedOrders).sort().join(',');
      if (currentSelection !== prevSelectionRef.current) {
        prevSelectionRef.current = currentSelection;
        onSelectionChangeRef.current(Array.from(selectedOrders));
      }
    }
  }, [selectedOrders]);

  const ordersResult = useQuery(api.orderBatches.index.getBatchOrders, {
    batchId,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    paymentStatus: paymentFilter === 'ALL' ? undefined : paymentFilter,
    limit: 100,
  });

  const orders = useMemo(() => ordersResult?.orders || [], [ordersResult?.orders]);
  const loading = ordersResult === undefined;

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }
    if (paymentFilter !== 'ALL') {
      filtered = filtered.filter((o) => o.paymentStatus === paymentFilter);
    }
    return filtered;
  }, [orders, statusFilter, paymentFilter]);

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((o) => o._id)));
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'ALL')}>
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

        <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as PaymentStatus | 'ALL')}>
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

        {selectedOrders.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
            </span>
            <Button variant="outline" size="sm" onClick={() => setSelectedOrders(new Set())}>
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-12">
                <Checkbox checked={filteredOrders.length > 0 && selectedOrders.size === filteredOrders.length} onCheckedChange={toggleAllSelection} />
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Order #</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Payment</TableHead>
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
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                    </TableCell>
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
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-40 text-center text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="group hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <Checkbox checked={selectedOrders.has(order._id)} onCheckedChange={() => toggleOrderSelection(order._id)} />
                    </TableCell>
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
                      <div className="flex flex-col">
                        <span className="text-sm">{formatDate(order.orderDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Package className="h-3.5 w-3.5" />
                        {order.itemCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm truncate max-w-[150px]">
                        {order.customerInfo?.firstName || order.customerInfo?.lastName
                          ? `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim()
                          : order.customerInfo?.email || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                    </TableCell>
                    <TableCell />
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
