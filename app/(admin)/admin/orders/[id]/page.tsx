'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id, Doc } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';

// Admin components
import { PageHeader } from '@/src/components/admin/page-header';
import { StatusBadge, OrderStatusBadge, PaymentStatusBadge } from '@/src/components/admin/status-badge';

// UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReceivePaymentDialog } from '@/src/features/orders/components/receive-payment-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Icons
import {
  ShoppingBag,
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  User,
  Mail,
  Calendar,
  CreditCard,
  Receipt,
  AlertTriangle,
  RefreshCw,
  Banknote,
  Tag,
  Hash,
  CircleDollarSign,
} from 'lucide-react';

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

const PAYMENT_STATUS_CONFIG: Record<
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

// Line item image component
function LineItemImage({ imageKey }: { imageKey?: string }) {
  const url = useQuery(api.files.queries.index.getFileUrl, imageKey ? { key: imageKey } : 'skip');
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
      className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow"
    >
      <LineItemImage imageKey={item.productInfo?.imageUrl?.[0]} />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{item.productInfo?.title || 'Unknown Product'}</h4>
        {item.productInfo?.variantName && <p className="text-xs text-muted-foreground">{item.productInfo.variantName}</p>}
        <p className="text-sm text-muted-foreground mt-1">
          Qty: <span className="font-medium text-foreground">{item.quantity}</span>
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold">{formatCurrency(item.price)}</p>
        <p className="text-xs text-muted-foreground">{formatCurrency((item.price || 0) / (item.quantity || 1))} each</p>
      </div>
    </motion.div>
  );
}

// Summary row component
function SummaryRow({ label, value, highlight, negative }: { label: string; value: string; highlight?: boolean; negative?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between py-2', highlight && 'text-lg font-semibold')}>
      <span className={cn(!highlight && 'text-muted-foreground')}>{label}</span>
      <span className={cn(negative && 'text-emerald-600')}>
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
  const router = useRouter();
  
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

  // Mutations
  const updateOrder = useMutation(api.orders.mutations.index.updateOrder);
  const cancelOrder = useMutation(api.orders.mutations.index.cancelOrder);

  // State
  const [updating, setUpdating] = useState(false);

  const loading = order === undefined;
  const items = useMemo(() => {
    if (!order) return [] as OrderItem[];
    if (order.embeddedItems) return order.embeddedItems as OrderItem[];
    // @ts-expect-error items is present when includeItems is true and not embedded
    return (order.items ?? []) as OrderItem[];
  }, [order]);

  // Handlers
  async function handleStatusChange(next: OrderStatus) {
    if (!order || updating) return;
    setUpdating(true);
    try {
      await updateOrder({ orderId: order._id, status: next });
      showToast({ type: 'success', title: `Order status updated to ${next.toLowerCase()}` });
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to update status' });
    } finally {
      setUpdating(false);
    }
  }

  async function handlePaymentChange(next: PaymentStatus) {
    if (!order || updating) return;
    setUpdating(true);
    try {
      await updateOrder({ orderId: order._id, paymentStatus: next });
      showToast({ type: 'success', title: `Payment status updated to ${next.toLowerCase()}` });
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to update payment status' });
    } finally {
      setUpdating(false);
    }
  }

  async function handleCancel() {
    if (!order || updating) return;
    setUpdating(true);
    try {
      await cancelOrder({ orderId: order._id, reason: 'OTHERS', message: 'Cancelled by admin' });
      showToast({ type: 'success', title: 'Order cancelled' });
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to cancel order' });
    } finally {
      setUpdating(false);
    }
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

  const statusConfig = ORDER_STATUS_CONFIG[order.status as OrderStatus];
  const StatusIcon = statusConfig?.icon || Clock;

  const customerInitials = `${order.customerInfo?.firstName?.[0] || ''}${order.customerInfo?.lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={order.orderNumber ? `Order #${order.orderNumber}` : 'Order Details'}
        description={`Placed on ${new Date(order.orderDate).toLocaleDateString()}`}
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
                        onClick={() => handleStatusChange(status)}
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <XCircle className="h-4 w-4 mr-1.5" />
                          Cancel Order
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone. The order will be marked as cancelled.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Order</AlertDialogCancel>
                          <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Cancel Order
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Status Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Payment Status
                </CardTitle>
                <CardDescription>Update the payment status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(PAYMENT_STATUS_CONFIG) as [PaymentStatus, (typeof PAYMENT_STATUS_CONFIG)[PaymentStatus]][]).map(
                    ([status, config]) => {
                      const isActive = order.paymentStatus === status;
                      return (
                        <Button
                          key={status}
                          variant={isActive ? 'default' : 'outline'}
                          size="sm"
                          disabled={updating}
                          onClick={() => handlePaymentChange(status)}
                          className={cn('transition-all', isActive && 'pointer-events-none')}
                        >
                          <Banknote className={cn('h-4 w-4 mr-1.5', !isActive && config.color)} />
                          {config.label}
                        </Button>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CircleDollarSign className="h-4 w-4" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <SummaryRow label="Items" value={String(order.itemCount || items.length)} />
                <SummaryRow label="Subtotal" value={formatCurrency((order.totalAmount || 0) + (order.discountAmount || 0))} />
                {(order.discountAmount || 0) > 0 && <SummaryRow label="Discount" value={formatCurrency(order.discountAmount || 0)} negative />}
                <Separator className="my-3" />
                <SummaryRow label="Total" value={formatCurrency(order.totalAmount || 0)} highlight />

                <div className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Payment</span>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                  <ReceivePaymentDialog
                    orderId={order._id as Id<'orders'>}
                    customerId={order.customerId as Id<'users'>}
                    organizationId={order.organizationId as Id<'organizations'>}
                    defaultAmount={Math.max(0, order.totalAmount || 0)}
                    onCreated={() => {
                      showToast({ type: 'success', title: 'Payment recorded' });
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">{customerInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.customerInfo?.email}</p>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Order Date</span>
                  </div>
                  <p className="font-medium pl-6">{new Date(order.orderDate).toLocaleString()}</p>
                </div>

                {order.customerNotes && (
                  <>
                    <Separator className="my-3" />
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Tag className="h-4 w-4" />
                        <span>Notes</span>
                      </div>
                      <p className="text-muted-foreground pl-6 text-xs">{order.customerNotes}</p>
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
        </div>
      </div>
    </div>
  );
}
