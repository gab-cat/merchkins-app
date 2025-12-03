'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderPaymentLink } from './order-payment-link';
import { BlurFade } from '@/src/components/ui/animations/effects';
import { Package, Clock, CheckCircle2, XCircle, Truck, ArrowRight, ShoppingBag, ChevronRight, Receipt, AlertCircle } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

function formatCurrency(amount: number | undefined) {
  if (amount === undefined) return '';
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  } catch {
    return `₱${amount.toFixed(2)}`;
  }
}

function StatusBadge({ value }: { value: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { icon: Clock, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' };
      case 'PROCESSING':
        return { icon: Package, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
      case 'READY':
        return { icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
      case 'DELIVERED':
        return { icon: Truck, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' };
      case 'CANCELLED':
        return { icon: XCircle, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
      default:
        return { icon: Package, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
    }
  };

  const config = getStatusConfig(value);
  const Icon = config.icon;

  return (
    <Badge className={`text-xs px-2.5 py-1 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} shadow-none`}>
      <Icon className="h-3 w-3 mr-1" />
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

  useEffect(() => {
    setOffset(0);
    setAccOrders([]);
  }, [customerId, selectedStatus]);

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

  const statusFilters: Array<{ key: 'ALL' | OrderStatus; label: string; icon: React.ElementType }> = [
    { key: 'ALL', label: 'All', icon: Receipt },
    { key: 'PENDING', label: 'Pending', icon: Clock },
    { key: 'PROCESSING', label: 'Processing', icon: Package },
    { key: 'READY', label: 'Ready', icon: CheckCircle2 },
    { key: 'DELIVERED', label: 'Delivered', icon: Truck },
  ];

  // Group orders by relative date
  const grouped = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const o of accOrders) {
      const key = formatRelativeDate(o.orderDate);
      const arr = map.get(key) ?? [];
      arr.push(o);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [accOrders]);

  if (currentUser === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <BlurFade delay={0.1}>
          <div className="text-center max-w-sm mx-auto px-4">
            <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold mb-2 font-heading">Sign in required</h2>
            <p className="text-slate-500 text-sm">Please sign in to view your orders.</p>
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
                <ShoppingBag className="h-5 w-5 text-[#1d43d8]" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-heading tracking-tight text-slate-900">Your Orders</h1>
                <p className="text-slate-500 text-sm">Track and manage your purchases</p>
              </div>
            </div>
            {accOrders.length > 0 && (
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {accOrders.length} order{accOrders.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </BlurFade>

        {/* Status filters - horizontal scroll on mobile */}
        <BlurFade delay={0.15}>
          <div className="mb-6 -mx-4 px-4" data-testid="orders-filters">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {statusFilters.map((f) => {
                const Icon = f.icon;
                const isSelected = selectedStatus === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setSelectedStatus(f.key)}
                    data-testid={`orders-filter-${f.key}`}
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

        {/* Orders list */}
        <div data-testid="orders-list">
          {/* Loading state */}
          {loading && accOrders.length === 0 && (
            <div className="space-y-3">
              {new Array(3).fill(null).map((_, i) => (
                <div key={`skeleton-${i}`} className="rounded-xl border border-slate-100 p-4 animate-pulse">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-24 rounded bg-slate-100" />
                      <div className="h-3 w-32 rounded bg-slate-100" />
                    </div>
                    <div className="h-6 w-16 rounded-full bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && accOrders.length === 0 && (
            <BlurFade delay={0.2}>
              <div className="py-16 text-center">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
                  <div className="h-20 w-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#1d43d8]/10 to-[#adfc04]/10 flex items-center justify-center">
                    <Package className="h-10 w-10 text-[#1d43d8]/50" />
                  </div>
                  <h2 className="text-lg font-bold mb-2 font-heading text-slate-900">No orders yet</h2>
                  <p className="text-slate-500 text-sm mb-6">Start shopping to see your orders here</p>
                  <Link href="/">
                    <Button className="bg-[#1d43d8] hover:bg-[#1d43d8]/90 rounded-full px-6 h-10 font-semibold shadow-lg shadow-[#1d43d8]/25">
                      Start Shopping
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </BlurFade>
          )}

          {/* Orders grouped by date */}
          <AnimatePresence mode="wait">
            {grouped.map(([label, list], groupIndex) => (
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
                  <div className="flex-1 h-px bg-slate-100"></div>
                </div>

                {/* Order cards */}
                <div className="space-y-2">
                  {list.map((o, orderIndex) => (
                    <motion.div key={o._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * orderIndex }}>
                      <Link
                        href={`/orders/${o._id}`}
                        className="block rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-slate-900 text-sm">{o.orderNumber ? `#${o.orderNumber}` : 'Order'}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>{formatTime(o.orderDate)}</span>
                                <span className="text-slate-300">•</span>
                                <span>
                                  {o.itemCount} {o.itemCount === 1 ? 'item' : 'items'}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="font-bold text-[#1d43d8] text-sm">{formatCurrency(o.totalAmount)}</span>
                              <StatusBadge value={o.status} />
                            </div>
                          </div>
                        </div>
                        {/* Payment link section - inline */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <OrderPaymentLink
                            orderId={o._id as Id<'orders'>}
                            orderStatus={o.status}
                            paymentStatus={o.paymentStatus}
                            xenditInvoiceUrl={o.xenditInvoiceUrl}
                            xenditInvoiceCreatedAt={o.xenditInvoiceCreatedAt}
                            xenditInvoiceExpiryDate={o.xenditInvoiceExpiryDate}
                            compact
                          />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Load more */}
        {ordersResult && ordersResult.hasMore && (
          <BlurFade delay={0.25}>
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => setOffset((prev) => prev + limit)}
                data-testid="orders-load-more"
                disabled={loading}
                variant="outline"
                className="rounded-full px-6 h-10 font-medium border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                {loading ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="mr-2">
                      <Package className="h-4 w-4" />
                    </motion.div>
                    Loading...
                  </>
                ) : (
                  <>
                    Load More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </BlurFade>
        )}
      </div>
    </div>
  );
}
