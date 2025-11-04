'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderPaymentLink } from './order-payment-link';
import type { Id } from '@/convex/_generated/dataModel';

function formatCurrency(amount: number | undefined) {
  if (amount === undefined) return '';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' }).format(amount);
  } catch {
    return `₱${amount.toFixed(2)}`;
  }
}

function StatusBadge({ value }: { value: string }) {
  const variant: 'default' | 'secondary' | 'destructive' = value === 'CANCELLED' ? 'destructive' : value === 'PENDING' ? 'secondary' : 'default';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'PROCESSING':
        return '⚙️';
      case 'READY':
        return '✅';
      case 'DELIVERED':
        return '📦';
      case 'CANCELLED':
        return '❌';
      default:
        return '📋';
    }
  };

  return (
    <Badge variant={variant} className="text-xs px-2 py-1 font-medium">
      <span className="mr-1">{getStatusIcon(value)}</span>
      {value}
    </Badge>
  );
}

type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED';

type Order = {
  _id: string;
  orderNumber?: string;
  status: OrderStatus;
  orderDate: number;
  itemCount: number;
  totalAmount?: number;
  paymentStatus?: string;
  xenditInvoiceUrl?: string | null;
  xenditInvoiceCreatedAt?: number | null;
  xenditInvoiceExpiryDate?: number | null;
};

function formatDateLabel(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function OrdersList() {
  const { userId } = useAuth();
  const currentUser = useQuery(api.users.queries.index.getCurrentUser, userId ? { clerkId: userId } : 'skip');

  const customerId = currentUser?._id;

  const [selectedStatus, setSelectedStatus] = useState<'ALL' | OrderStatus>('ALL');
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [accOrders, setAccOrders] = useState<Order[]>([]);

  const ordersResult = useQuery(
    api.orders.queries.index.getOrders,
    customerId
      ? {
          customerId: customerId as Id<'users'>,
          status: selectedStatus === 'ALL' ? undefined : selectedStatus,
          limit,
          offset,
        }
      : 'skip'
  );

  const loading = currentUser === undefined || ordersResult === undefined;

  // Reset pagination and accumulated list when user or filter changes
  useEffect(() => {
    setOffset(0);
    setAccOrders([]);
  }, [customerId, selectedStatus]);

  // Accumulate results across pages, dedupe by _id
  useEffect(() => {
    if (!ordersResult) return;
    const incoming = (ordersResult.orders ?? []) as Order[];
    if (offset === 0) {
      setAccOrders(incoming);
      return;
    }
    setAccOrders((prev) => {
      const seen = new Set(prev.map((o) => o._id));
      const merged = [...prev];
      for (const o of incoming) {
        if (!seen.has(o._id)) merged.push(o);
      }
      return merged;
    });
  }, [ordersResult, offset]);

  const title = useMemo(
    () => (
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold">Your orders</h1>
        <p className="text-muted-foreground">View your recent orders and their status.</p>
      </div>
    ),
    []
  );

  const statusFilters: Array<{ key: 'ALL' | OrderStatus; label: string }> = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'READY', label: 'Ready' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  const grouped = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const o of accOrders) {
      const key = formatDateLabel(o.orderDate);
      const arr = map.get(key) ?? [];
      arr.push(o);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [accOrders]);

  if (currentUser === null) {
    return (
      <div>
        {title}
        <div className="text-sm text-muted-foreground">No user profile found.</div>
      </div>
    );
  }

  return (
    <div>
      {title}
      {/* Status filters */}
      <div className="mb-6 flex flex-wrap gap-2" data-testid="orders-filters">
        {statusFilters.map((f) => (
          <Button
            key={f.key}
            variant={selectedStatus === f.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus(f.key)}
            data-testid={`orders-filter-${f.key}`}
            className="h-8 text-xs hover:scale-105 transition-all duration-200"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* List view grouped by date */}
      <div className="rounded-lg border bg-card" data-testid="orders-list">
        {loading && accOrders.length === 0 && (
          <div className="p-6 space-y-3">
            {new Array(3).fill(null).map((_, i) => (
              <div key={`skeleton-${i}`} className="rounded-lg border p-3 animate-pulse">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="h-4 w-24 rounded bg-secondary" />
                    <div className="h-3 w-32 rounded bg-secondary" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-16 rounded bg-secondary" />
                    <div className="h-5 w-16 rounded bg-secondary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && accOrders.length === 0 && (
          <div className="p-12 text-center">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-muted-foreground">You have no orders yet.</p>
            <p className="text-muted-foreground text-sm mt-1">Start shopping to see your orders here.</p>
          </div>
        )}

        {grouped.map(([label, list]) => (
          <div key={label}>
            <div className="bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b">{label}</div>
            {list.map((o) => (
              <Link href={`/orders/${o._id}`} key={o._id} className="block hover:bg-accent/50 transition-all duration-200 hover:border-primary/20">
                <div className="px-4 py-3 border-b last:border-b-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm">{o.orderNumber ? `Order #${o.orderNumber}` : 'Order'}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(o.orderDate)} • {o.itemCount} items
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold">{formatCurrency(o.totalAmount)}</div>
                      <StatusBadge value={o.status} />
                    </div>
                  </div>
                  <OrderPaymentLink
                    orderId={o._id as Id<'orders'>}
                    orderStatus={o.status}
                    paymentStatus={o.paymentStatus}
                    xenditInvoiceUrl={o.xenditInvoiceUrl}
                    xenditInvoiceCreatedAt={o.xenditInvoiceCreatedAt}
                    xenditInvoiceExpiryDate={o.xenditInvoiceExpiryDate}
                  />
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {ordersResult && ordersResult.hasMore && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => setOffset((prev) => prev + limit)}
            data-testid="orders-load-more"
            disabled={loading}
            className="hover:scale-105 transition-all duration-200"
          >
            Load more orders
          </Button>
        </div>
      )}
    </div>
  );
}
