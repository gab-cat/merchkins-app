'use client';

import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id, Doc } from '@/convex/_generated/dataModel';
import { cn, buildR2PublicUrl } from '@/lib/utils';

// Admin components
import { PageHeader } from '@/src/components/admin/page-header';
import { OrderStatusBadge, PaymentStatusBadge } from '@/src/components/admin/status-badge';

// UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OrderLogsSection } from '@/src/features/orders/components/order-logs-section';
import { AddOrderNoteDialog } from '@/src/features/orders/components/add-order-note-dialog';
import { OrderStatusChangeDialog } from '@/src/features/orders/components/order-status-change-dialog';
import { OrderBatchManager } from '@/src/features/admin/components/orders/order-batch-manager';

// Icons
import {
  ShoppingBag,
  ArrowLeft,
  Package,
  Clock,
  Truck,
  XCircle,
  User,
  Phone,
  Calendar,
  Receipt,
  AlertTriangle,
  RefreshCw,
  Tag,
  Hash,
  CircleDollarSign,
  Ticket,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { PaymentMetadataDisplay } from '@/src/features/admin/components/payments/payment-metadata-display';
type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED';
type PaymentStatus = 'PENDING' | 'DOWNPAYMENT' | 'PAID' | 'REFUNDED';
type Order = Doc<'orders'>;
type OrderItem = NonNullable<Order['embeddedItems']>[0];

// Status configuration
const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  PENDING: {
    icon: Clock,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100 dark:bg-slate-950/30',
    label: 'Pending',
  },
  PROCESSING: {
    icon: RefreshCw,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950/30',
    label: 'Processing',
  },
  READY: {
    icon: Package,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-950/30',
    label: 'Ready',
  },
  DELIVERED: {
    icon: Truck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950/30',
    label: 'Delivered',
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-950/30',
    label: 'Cancelled',
  },
};

const _PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  {
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  PENDING: {
    color: 'text-slate-600',
    bgColor: 'bg-slate-100 dark:bg-slate-950/30',
    label: 'Pending',
  },
  DOWNPAYMENT: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-950/30',
    label: 'Downpayment',
  },
  PAID: {
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950/30',
    label: 'Paid',
  },
  REFUNDED: {
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-950/30',
    label: 'Refunded',
  },
};

function formatCurrency(amount: number | undefined) {
  if (amount === undefined) return '₱0.00';
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  } catch {
    return `₱${amount.toFixed(2)}`;
  }
}

// Line item image component - uses direct R2 URL construction
function LineItemImage({ imageKey }: { imageKey?: string }) {
  const url = imageKey ? buildR2PublicUrl(imageKey) : null;
  if (!url) {
    return (
      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="Product" className="h-16 w-16 rounded-lg object-cover border" />
  );
}

// Order item card component
function OrderItemCard({ item, index }: { item: OrderItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
    >
      <LineItemImage imageKey={item.productInfo?.imageUrl?.[0]} />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{item.productInfo?.title || 'Unknown Product'}</h4>
        {item.productInfo?.variantName && <p className="text-xs text-muted-foreground">{item.productInfo.variantName}</p>}
        <p className="text-sm text-muted-foreground mt-0.5">
          Qty: <span className="font-medium text-foreground">{item.quantity}</span>
          <span className="mx-1.5 text-muted-foreground/50">•</span>
          <span>{formatCurrency((item.price || 0) / (item.quantity || 1))} each</span>
        </p>
        {item.customerNote && (
          <p className="mt-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded border-l-2 border-muted-foreground/30 italic">
            Note: {item.customerNote}
          </p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="font-semibold">{formatCurrency(item.price)}</p>
      </div>
    </motion.div>
  );
}

// Summary row component - compact version
function SummaryRow({ label, value, highlight, negative }: { label: string; value: string; highlight?: boolean; negative?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between py-1', highlight && 'text-base font-semibold pt-2')}>
      <span className={cn('text-sm', !highlight && 'text-muted-foreground')}>{label}</span>
      <span className={cn('text-sm', negative && 'text-emerald-600', highlight && 'text-base')}>
        {negative && '-'}
        {value}
      </span>
    </div>
  );
}

// Loading skeleton
function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams();

  // Safely extract orderId from params
  const orderId = typeof params?.id === 'string' ? (params.id as Id<'orders'>) : null;

  // Queries - skip if orderId is invalid
  const order = useQuery(
    api.orders.queries.index.getOrderById,
    orderId
      ? {
          orderId,
          includeItems: true,
        }
      : 'skip'
  );

  // Fetch payments for this order to display Xendit metadata
  const paymentsData = useQuery(
    api.payments.queries.index.getPayments,
    orderId && order?.organizationId
      ? {
          orderId,
          organizationId: order.organizationId,
          limit: 10,
        }
      : 'skip'
  );

  // Mutations

  // State
  const [updating] = useState(false);

  // State for status change dialogs
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    open: boolean;
    type: 'status' | 'payment';
    newValue: OrderStatus | PaymentStatus;
  }>({ open: false, type: 'status', newValue: 'PENDING' });

  // State for cancel dialog with note

  const loading = order === undefined;
  const items = useMemo(() => {
    if (!order) return [] as OrderItem[];
    if (order.embeddedItems) return order.embeddedItems as OrderItem[];
    // @ts-expect-error items is present when includeItems is true and not embedded
    return (order.items ?? []) as OrderItem[];
  }, [order]);

  // Handlers
  function handleStatusButtonClick(next: OrderStatus) {
    if (!order || updating || order.status === next) return;
    setStatusChangeDialog({ open: true, type: 'status', newValue: next });
  }

  function handleCancelClick() {
    if (!order || updating) return;
    // For cancellation, we'll use the status change dialog with CANCELLED
    setStatusChangeDialog({ open: true, type: 'status', newValue: 'CANCELLED' });
  }

  // Handle invalid orderId
  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Invalid Order ID</h2>
        <p className="text-muted-foreground mb-4">The order ID in the URL is invalid.</p>
        <Button asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (order === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-4">The order you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  const customerInitials = `${order.customerInfo?.firstName?.[0] || ''}${order.customerInfo?.lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={order.orderNumber ? `Order #${order.orderNumber}` : 'Order Details'}
        description={`Placed on ${new Date(order.orderDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}`}
        icon={<ShoppingBag className="h-5 w-5" />}
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Orders', href: '/admin/orders' }, { label: order.orderNumber || 'Order' }]}
        actions={
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <Button variant="outline" asChild>
              <Link href="/admin/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Items & Status Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  Order Status
                </CardTitle>
                <CardDescription>Update the fulfillment status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(ORDER_STATUS_CONFIG) as [OrderStatus, (typeof ORDER_STATUS_CONFIG)[OrderStatus]][]).map(([status, config]) => {
                    const Icon = config.icon;
                    const isActive = order.status === status;
                    const isDisabled = updating || status === 'CANCELLED';
                    return (
                      <Button
                        key={status}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        disabled={isDisabled}
                        onClick={() => handleStatusButtonClick(status)}
                        className={cn('transition-all', isActive && 'pointer-events-none')}
                      >
                        <Icon className={cn('h-4 w-4 mr-1.5', !isActive && config.color)} />
                        {config.label}
                      </Button>
                    );
                  })}
                </div>

                {order.status !== 'CANCELLED' && (
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleCancelClick}>
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Cancel Order
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Xendit Payment Metadata */}
          {paymentsData?.payments && paymentsData.payments.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <div className="space-y-3">
                {paymentsData.payments.map((payment) => (
                  <PaymentMetadataDisplay key={payment._id} metadata={payment.metadata as Record<string, unknown>} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Order Items */}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="h-4 w-4" />
                  Order Items
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-normal">{items.length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.length > 0 ? (
                  items.map((item, idx) => <OrderItemCard key={idx} item={item} index={idx} />)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No items in this order</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Summary & Customer */}
        <div className="space-y-6">
          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <CircleDollarSign className="h-4 w-4" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-0">
                <SummaryRow
                  label={`${order.itemCount || items.length} items`}
                  value={formatCurrency((order.totalAmount || 0) + (order.voucherDiscount || order.discountAmount || 0))}
                />
                {/* Voucher discount display */}
                {order.voucherCode && (order.voucherDiscount || 0) > 0 && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-emerald-600 flex items-center gap-1 text-sm">
                      <Ticket className="h-3 w-3" />
                      <code className="text-xs bg-emerald-100 dark:bg-emerald-950/30 px-1 py-0.5 rounded font-mono">{order.voucherCode}</code>
                    </span>
                    <span className="text-sm text-emerald-600">-{formatCurrency(order.voucherDiscount || 0)}</span>
                  </div>
                )}
                {/* Legacy discount (non-voucher) */}
                {!order.voucherCode && (order.discountAmount || 0) > 0 && (
                  <SummaryRow label="Discount" value={formatCurrency(order.discountAmount || 0)} negative />
                )}
                <Separator className="my-2" />
                <SummaryRow label="Total" value={formatCurrency(order.totalAmount || 0)} highlight />

                <div className="flex items-center justify-between pt-2 mt-1 border-t">
                  <span className="text-xs text-muted-foreground">Payment</span>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border">
                    {order.customerInfo?.imageUrl ? <AvatarImage src={order.customerInfo.imageUrl} alt="Customer" /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">{customerInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{order.customerInfo?.email}</p>
                    {order.customerInfo?.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />
                        {order.customerInfo.phone}
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs">Order Date</span>
                  </div>
                  <p className="font-medium text-sm pl-5">
                    {new Date(order.orderDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    <span className="text-muted-foreground font-normal ml-1.5">
                      {new Date(order.orderDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </p>
                </div>

                {order.customerNotes && (
                  <>
                    <Separator className="my-3" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Tag className="h-3.5 w-3.5" />
                        <span className="text-xs">Customer Note</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-5 bg-muted/50 p-2 rounded border-l-2 border-muted-foreground/30 italic">
                        {order.customerNotes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" />
                    Order ID
                  </span>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{order._id.slice(-8)}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span>{new Date(order.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Batch Assignment */}
          {order.organizationId && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <OrderBatchManager orderId={order._id} organizationId={order.organizationId} currentBatches={order.batchInfo} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Activity Log Section - Full Width */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Activity & Notes</h2>
          <AddOrderNoteDialog orderId={order._id} />
        </div>
        <OrderLogsSection orderId={order._id} />
      </motion.div>

      {/* Status Change Dialog */}
      {order && (
        <OrderStatusChangeDialog
          orderId={order._id}
          open={statusChangeDialog.open}
          onOpenChange={(open) => setStatusChangeDialog((prev) => ({ ...prev, open }))}
          changeType={statusChangeDialog.type}
          currentValue={statusChangeDialog.type === 'status' ? (order.status as OrderStatus) : (order.paymentStatus as PaymentStatus)}
          newValue={statusChangeDialog.newValue}
        />
      )}
    </div>
  );
}
