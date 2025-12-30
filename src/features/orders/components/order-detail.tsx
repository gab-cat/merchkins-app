'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from 'convex-helpers/react/cache/hooks';
import { motion } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import { OrderPaymentLink } from './order-payment-link';
import { OrderLogsSection } from './order-logs-section';
import { CancelOrderModal } from './cancel-order-modal';
import { RefundRequestModal } from './refund-request-modal';
import { ConfirmOrderReceivedModal } from './confirm-order-received-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BatchBadge } from '@/src/features/admin/components/batches/batch-badge';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  Receipt,
  ShoppingBag,
  Calendar,
  Hash,
  Ticket,
  Tag,
  Percent,
  Gift,
  X,
  RotateCcw,
  Store,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';
import { buildR2PublicUrl } from '@/lib/utils';

interface OrderItemUI {
  productInfo: {
    imageUrl?: string[];
    title: string;
    variantName?: string | null;
  };
  size?: {
    id: string;
    label: string;
  };
  quantity: number;
  price?: number;
  customerNote?: string;
}

function formatCurrency(amount: number | undefined) {
  if (amount === undefined) return '';
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  } catch {
    return `₱${amount.toFixed(2)}`;
  }
}

function StatusBadge({ value, large = false }: { value: string; large?: boolean }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { icon: Clock, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', label: 'Pending' };
      case 'PROCESSING':
        return { icon: Package, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', label: 'Processing' };
      case 'READY':
        return { icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', label: 'Ready for Pickup' };
      case 'DELIVERED':
        return { icon: Truck, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', label: 'Delivered' };
      case 'CANCELLED':
        return { icon: XCircle, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'Cancelled' };
      default:
        return { icon: Package, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: status };
    }
  };

  const config = getStatusConfig(value);
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
    <Badge className={`text-xs px-2.5 py-1 font-medium rounded-full border shadow-none ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

function PaymentStatusBadge({ value }: { value?: string }) {
  const isPaid = value === 'PAID';
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
        isPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
      }`}
    >
      {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {isPaid ? 'Paid' : 'Unpaid'}
    </span>
  );
}

function RefundRequestBadge({ status }: { status: 'PENDING' | 'APPROVED' | 'REJECTED' }) {
  const getStatusConfig = (status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    switch (status) {
      case 'PENDING':
        return {
          icon: Clock,
          bg: 'bg-amber-50',
          text: 'text-amber-600',
          border: 'border-amber-200',
          label: 'Refund Request Pending',
        };
      case 'APPROVED':
        return {
          icon: CheckCircle2,
          bg: 'bg-emerald-50',
          text: 'text-emerald-600',
          border: 'border-emerald-200',
          label: 'Refund Approved',
        };
      case 'REJECTED':
        return {
          icon: XCircle,
          bg: 'bg-red-50',
          text: 'text-red-600',
          border: 'border-red-200',
          label: 'Refund Request Declined',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={`text-xs px-3 py-1.5 font-medium rounded-full border shadow-none ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="h-3.5 w-3.5 mr-1.5" />
      {config.label}
    </Badge>
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

export function OrderDetail({ orderId }: { orderId: string }) {
  const order = useQuery(api.orders.queries.index.getOrderById, {
    orderId: orderId as Id<'orders'>,
    includeItems: true,
  });

  const refundRequest = useQuery(api.refundRequests.queries.index.getRefundRequestByOrder, {
    orderId: orderId as Id<'orders'>,
  });

  const loading = order === undefined;
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [confirmReceivedModalOpen, setConfirmReceivedModalOpen] = useState(false);

  // Check if order can be cancelled
  const canCancel = order && order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
  const isPaid = order?.paymentStatus === 'PAID';
  const isReady = order?.status === 'READY';

  // Check if order is within 24 hours of order date
  const withinRefundWindow = order ? new Date(order.orderDate).getTime() > Date.now() - 24 * 60 * 60 * 1000 : false;

  // Check if refund request is possible (paid order within 24 hours)
  const canRequestRefund = isPaid && canCancel && !refundRequest && withinRefundWindow;

  const items = useMemo<OrderItemUI[]>(() => {
    if (!order) return [];
    if (order.embeddedItems) return order.embeddedItems as unknown as OrderItemUI[];
    // @ts-expect-error items is present when includeItems is true and not embedded
    return (order.items ?? []) as unknown as OrderItemUI[];
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-[#1d43d8]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#1d43d8] animate-spin"></div>
          </div>
          <p className="text-slate-500 text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Package className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold mb-2 font-heading">Order not found</h2>
          <p className="text-slate-500 text-sm mb-4">This order doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Link href="/orders">
            <Button variant="outline" className="rounded-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const orderNumber = order.orderNumber ? `#${order.orderNumber}` : 'Order';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Back link */}
          <motion.div variants={itemVariants}>
            <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1d43d8] mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-[#1d43d8]/10">
                    <Receipt className="h-5 w-5 text-[#1d43d8]" />
                  </div>
                  <h1 className="text-2xl font-bold font-heading tracking-tight text-slate-900">{orderNumber}</h1>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(order.orderDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                  {order.batchInfo && order.batchInfo.length > 0 && (
                    <>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {order.batchInfo.map((batch) => (
                          <BatchBadge key={batch.id} name={batch.name} size="sm" />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge value={order.status} large />
                <div className="flex items-center gap-2">
                  <PaymentStatusBadge value={order.paymentStatus} />
                  {order.orderSource === 'MESSENGER' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                      <MessageCircle className="h-3 w-3" />
                      Order from Messenger
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Store Card - Sleek Display */}
          {order.organizationInfo && (
            <motion.div variants={itemVariants} className="mb-6">
              <Link href={`/o/${order.organizationInfo.slug}`} className="block group">
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-50 via-white to-slate-50 border border-slate-100 p-4 transition-all duration-300 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100/50">
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-r from-[#1d43d8]/2 to-transparent pointer-events-none" />

                  <div className="relative flex items-center gap-4">
                    {/* Store Logo */}
                    <div className="relative">
                      {order.organizationInfo.logoUrl || order.organizationInfo.logo ? (
                        <div className="h-14 w-14 rounded-xl overflow-hidden ring-2 ring-white shadow-md">
                          <Image
                            src={buildR2PublicUrl(order.organizationInfo.logoUrl || order.organizationInfo.logo || null) || ''}
                            alt={order.organizationInfo.name}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 rounded-xl bg-linear-to-br from-[#1d43d8] to-[#1d43d8]/80 flex items-center justify-center shadow-md shadow-[#1d43d8]/20">
                          <Store className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Store Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Sold by</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 truncate mt-0.5 group-hover:text-[#1d43d8] transition-colors">
                        {order.organizationInfo.name}
                      </h3>
                    </div>

                    {/* Visit arrow */}
                    <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-[#1d43d8] transition-colors">
                      <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Visit</span>
                      <ExternalLink className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Payment Action */}
          {order.status === 'PENDING' && order.paymentStatus !== 'PAID' && (
            <motion.div variants={itemVariants} className="mb-6">
              <OrderPaymentLink
                orderId={order._id}
                orderStatus={order.status}
                paymentStatus={order.paymentStatus}
                xenditInvoiceUrl={order.xenditInvoiceUrl}
                xenditInvoiceCreatedAt={order.xenditInvoiceCreatedAt}
                xenditInvoiceExpiryDate={order.xenditInvoiceExpiryDate}
                totalAmount={order.totalAmount}
                customerEmail={order.customerInfo.email}
                orderNumber={order.orderNumber}
              />
            </motion.div>
          )}

          {/* Refund Request Section */}
          {isPaid && (
            <motion.div variants={itemVariants} className="mb-6">
              {refundRequest ? (
                <div className="rounded-xl border border-slate-100 p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-50">
                        <RotateCcw className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Refund Request</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {refundRequest.status === 'PENDING' && 'Your request is being reviewed'}
                          {refundRequest.status === 'APPROVED' && 'Your refund has been approved'}
                          {refundRequest.status === 'REJECTED' && 'Your refund request was declined'}
                        </p>
                      </div>
                    </div>
                    <RefundRequestBadge status={refundRequest.status} />
                  </div>
                  {refundRequest.adminMessage && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Admin Note:</span> {refundRequest.adminMessage}
                      </p>
                    </div>
                  )}
                </div>
              ) : canRequestRefund ? (
                <div className="rounded-xl border border-amber-200 bg-linear-to-r from-amber-50/50 to-orange-50/50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-amber-100 shrink-0">
                        <RotateCcw className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">Need a Refund?</h3>
                        <p className="text-xs text-slate-600 mb-3">
                          Request a refund within 24 hours of payment. Approved refunds will be issued as platform vouchers.
                        </p>
                        <Button
                          onClick={() => setRefundModalOpen(true)}
                          className="bg-amber-600 hover:bg-amber-700 text-white rounded-full h-9 px-4 text-sm font-semibold shadow-sm"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Request Refund
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* Order Items */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Items ({items.length})</h2>
            </div>
            <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
              {items.map((it, idx) => {
                const unitPrice = it.price ?? 0;
                const subtotal = unitPrice * it.quantity;
                return (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-white hover:bg-slate-50/50 transition-colors">
                    <ProductImage imageKey={it.productInfo.imageUrl?.[0]} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{it.productInfo.title}</p>
                      {/* Variant and Size info */}
                      {(it.productInfo.variantName || it.size) && (
                        <div className="flex items-center gap-2 mt-0.5">
                          {it.productInfo.variantName && <span className="text-xs text-slate-500">{it.productInfo.variantName}</span>}
                          {it.size && (
                            <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{it.size.label}</span>
                          )}
                        </div>
                      )}
                      {/* Pricing breakdown */}
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                        <span>{formatCurrency(unitPrice)}</span>
                        <span className="text-slate-300">×</span>
                        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 bg-slate-100 text-slate-600 font-medium rounded">
                          {it.quantity}
                        </span>
                      </div>
                      {/* Customer note */}
                      {it.customerNote && (
                        <p className="text-xs text-slate-500 mt-1.5 italic bg-slate-50 px-2 py-1 rounded border-l-2 border-slate-300">
                          {it.customerNote}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-slate-900 text-sm">{formatCurrency(subtotal)}</p>
                      {it.quantity > 1 && <p className="text-[10px] text-slate-400 mt-0.5">subtotal</p>}
                    </div>
                  </div>
                );
              })}
              {items.length === 0 && <div className="p-8 text-center text-slate-400 text-sm">No items in this order</div>}
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal ({order.itemCount} items)</span>
                  <span>{formatCurrency((order.totalAmount || 0) + (order.voucherDiscount || order.discountAmount || 0))}</span>
                </div>
                {/* Voucher discount display */}
                {order.voucherCode && (order.voucherDiscount || 0) > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span className="flex items-center gap-2">
                      <Ticket className="h-3.5 w-3.5" />
                      <span>
                        Voucher
                        <span className="font-mono ml-1 text-xs bg-emerald-100 px-1.5 py-0.5 rounded">{order.voucherCode}</span>
                      </span>
                    </span>
                    <span>-{formatCurrency(order.voucherDiscount)}</span>
                  </div>
                )}
                {/* Legacy discount (non-voucher) */}
                {!order.voucherCode && (order.discountAmount || 0) > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-lg font-bold text-[#1d43d8]">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Voucher details card (if voucher was applied) */}
          {order.voucherSnapshot && (
            <motion.div variants={itemVariants} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Ticket className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Applied Voucher</h2>
              </div>
              <div className="rounded-xl border border-emerald-100 p-4 bg-linear-to-r from-emerald-50/50 to-brand-neon/5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 shrink-0">
                    {(order.voucherSnapshot as { discountType?: string })?.discountType === 'PERCENTAGE' ? (
                      <Percent className="h-4 w-4 text-emerald-600" />
                    ) : (order.voucherSnapshot as { discountType?: string })?.discountType === 'FREE_ITEM' ? (
                      <Gift className="h-4 w-4 text-emerald-600" />
                    ) : (order.voucherSnapshot as { discountType?: string })?.discountType === 'FREE_SHIPPING' ? (
                      <Truck className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Tag className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-emerald-700 font-mono">
                        {(order.voucherSnapshot as { code?: string })?.code || order.voucherCode}
                      </span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-sm text-emerald-600 mt-0.5">{(order.voucherSnapshot as { name?: string })?.name || 'Voucher Applied'}</p>
                    {(order.voucherSnapshot as { description?: string })?.description && (
                      <p className="text-xs text-slate-500 mt-1">{(order.voucherSnapshot as { description?: string })?.description}</p>
                    )}
                    <p className="text-sm font-semibold text-emerald-700 mt-2">You saved {formatCurrency(order.voucherDiscount || 0)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Customer Info */}
          {order.customerInfo && (
            <motion.div variants={itemVariants} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Delivery Information</h2>
              </div>
              <div className="rounded-xl border border-slate-100 p-4 bg-white">
                <p className="font-medium text-slate-900 text-sm">
                  {[order.customerInfo.firstName, order.customerInfo.lastName].filter(Boolean).join(' ') || 'Customer'}
                </p>
                <p className="text-slate-500 text-sm mt-1">{order.customerInfo.email}</p>
                {order.customerInfo.phone && <p className="text-slate-500 text-sm">{order.customerInfo.phone}</p>}
              </div>
            </motion.div>
          )}

          {/* Order Activity Log - Public Only */}
          <motion.div variants={itemVariants} className="mb-6">
            <OrderLogsSection orderId={order._id} publicOnly={true} className="rounded-xl border border-slate-100 bg-white shadow-none" />
          </motion.div>

          {/* Order ID */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between text-xs text-slate-400 py-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <Hash className="h-3 w-3" />
                Order ID
              </span>
              <span className="font-mono">{order._id}</span>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants} className="mt-4 space-y-3">
            {/* Confirm Order Received Button - shown when order is READY */}
            {isReady && (
              <Button
                className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={() => setConfirmReceivedModalOpen(true)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Order Received
              </Button>
            )}

            {/* Cancel Order Button */}
            {canCancel && !isPaid && (
              <Button
                variant="outline"
                className="w-full rounded-full border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => setCancelModalOpen(true)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
            )}
          </motion.div>

          {/* Modals */}
          {order && (
            <>
              <CancelOrderModal
                orderId={order._id}
                orderNumber={order.orderNumber}
                isPaid={isPaid}
                open={cancelModalOpen}
                onOpenChange={setCancelModalOpen}
                onSuccess={() => {
                  // Convex queries automatically refetch when data changes
                }}
              />
              <RefundRequestModal
                orderId={order._id}
                orderNumber={order.orderNumber}
                open={refundModalOpen}
                onOpenChange={setRefundModalOpen}
                onSuccess={() => {
                  // Convex queries automatically refetch when data changes
                }}
              />
              <ConfirmOrderReceivedModal
                orderId={order._id}
                orderNumber={order.orderNumber}
                open={confirmReceivedModalOpen}
                onOpenChange={setConfirmReceivedModalOpen}
                onSuccess={() => {
                  // Convex queries automatically refetch when data changes
                }}
              />
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function ProductImage({ imageKey }: { imageKey?: string }) {
  const url = buildR2PublicUrl(imageKey || null);
  if (!url) {
    return (
      <div className="h-14 w-14 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
        <Package className="h-6 w-6 text-slate-300" />
      </div>
    );
  }
  return <Image src={url} alt="Product" width={56} height={56} className="h-14 w-14 rounded-lg object-cover shrink-0 border border-slate-100" />;
}
