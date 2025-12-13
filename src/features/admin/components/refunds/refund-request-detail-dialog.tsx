'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { showToast } from '@/lib/toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  DollarSign,
  FileText,
  Package,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  Receipt,
  Calendar,
  Mail,
  Phone,
  ShoppingBag,
} from 'lucide-react';
import { cn, buildR2PublicUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Refund reason labels for display
const REFUND_REASON_LABELS: Record<string, string> = {
  WRONG_SIZE: 'Wrong Size',
  WRONG_ITEM: 'Wrong Item Received',
  WRONG_PAYMENT: 'Wrong Payment Method',
  DEFECTIVE_ITEM: 'Defective/Damaged Item',
  NOT_AS_DESCRIBED: 'Item Not as Described',
  CHANGED_MIND: 'Changed My Mind',
  DUPLICATE_ORDER: 'Duplicate Order',
  DELIVERY_ISSUE: 'Delivery Issue',
  OTHER: 'Other',
};

const schema = z.object({
  adminMessage: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message is too long'),
});

type FormValues = z.infer<typeof schema>;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function formatDate(timestamp: number, options?: Intl.DateTimeFormatOptions) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: 'PENDING' | 'APPROVED' | 'REJECTED' }) {
  const config = {
    PENDING: {
      label: 'Pending Review',
      icon: Clock,
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      dotColor: 'bg-amber-500',
    },
    APPROVED: {
      label: 'Approved',
      icon: CheckCircle2,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotColor: 'bg-emerald-500',
    },
    REJECTED: {
      label: 'Rejected',
      icon: XCircle,
      className: 'bg-red-50 text-red-700 border-red-200',
      dotColor: 'bg-red-500',
    },
  }[status];

  const Icon = config.icon;
  return (
    <Badge className={cn('text-xs font-medium border px-3 py-1.5 flex items-center gap-2', config.className)}>
      <span className={cn('h-2 w-2 rounded-full animate-pulse', config.dotColor)} />
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('rounded-xl border bg-card/50 p-4', className)}>{children}</div>;
}

function ProductImage({ imageKey }: { imageKey?: string }) {
  const url = buildR2PublicUrl(imageKey || null);
  if (!url) {
    return (
      <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Package className="h-6 w-6 text-muted-foreground/50" />
      </div>
    );
  }
  return <Image src={url} alt="Product" width={56} height={56} className="h-14 w-14 rounded-lg object-cover flex-shrink-0 border border-slate-100" />;
}

interface RefundRequestDetailDialogProps {
  refundRequestId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RefundRequestDetailDialog({ refundRequestId, open, onOpenChange }: RefundRequestDetailDialogProps) {
  const refundRequest = useQuery(api.refundRequests.queries.index.getRefundRequestById, {
    refundRequestId: refundRequestId as Id<'refundRequests'>,
  });

  // Get the full order with items
  const order = useQuery(
    api.orders.queries.index.getOrderById,
    refundRequest?.orderId
      ? {
          orderId: refundRequest.orderId,
          includeItems: true,
        }
      : 'skip'
  );

  const approveRefund = useMutation(api.refundRequests.mutations.index.approveRefundRequest);
  const rejectRefund = useMutation(api.refundRequests.mutations.index.rejectRefundRequest);

  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      adminMessage: '',
    },
  });

  const handleApprove = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await approveRefund({
        refundRequestId: refundRequestId as Id<'refundRequests'>,
        adminMessage: values.adminMessage,
      });
      showToast({ type: 'success', title: 'Refund approved', description: 'A voucher has been issued to the customer' });
      form.reset();
      setActionType(null);
      onOpenChange(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve refund request';
      showToast({ type: 'error', title: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await rejectRefund({
        refundRequestId: refundRequestId as Id<'refundRequests'>,
        adminMessage: values.adminMessage,
      });
      showToast({ type: 'success', title: 'Refund request rejected' });
      form.reset();
      setActionType(null);
      setShowRejectConfirm(false);
      onOpenChange(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject refund request';
      showToast({ type: 'error', title: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClick = () => {
    if (form.formState.isValid || form.getValues('adminMessage').length >= 10) {
      setShowRejectConfirm(true);
    } else {
      form.trigger('adminMessage');
    }
  };

  if (!refundRequest) {
    return null;
  }

  const canTakeAction = refundRequest.status === 'PENDING';

  // Get order items from either embedded items or separate items table
  type OrderItem = NonNullable<typeof order>['embeddedItems'] extends (infer T)[] | undefined ? T : never;
  const orderItems: OrderItem[] = order?.embeddedItems || (order as { items?: OrderItem[] })?.items || [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-b from-muted/30 to-transparent">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                    Refund Request
                  </DialogTitle>
                  <DialogDescription className="text-sm">Order #{refundRequest.orderInfo.orderNumber || refundRequestId.slice(-8)}</DialogDescription>
                </div>
                <StatusBadge status={refundRequest.status} />
              </div>
            </DialogHeader>

            {/* Refund Amount Highlight */}
            <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-100">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-blue-900">Refund Amount</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(refundRequest.refundAmount)}</span>
            </div>
          </div>

          {/* Tabs Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="px-6 pt-2 border-b">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-2">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-3 py-2">
                  <FileText className="h-4 w-4 mr-1.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="items" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-3 py-2">
                  <Package className="h-4 w-4 mr-1.5" />
                  Items ({orderItems.length})
                </TabsTrigger>
                <TabsTrigger value="payment" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-3 py-2">
                  <CreditCard className="h-4 w-4 mr-1.5" />
                  Payment
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="p-6 space-y-4">
                {/* Overview Tab */}
                <TabsContent value="overview" className="m-0 space-y-4">
                  {/* Customer Info Card */}
                  <SectionCard>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-full bg-slate-100">
                        <User className="h-4 w-4 text-slate-600" />
                      </div>
                      <h3 className="text-sm font-semibold">Customer Information</h3>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={refundRequest.customerInfo.imageUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {refundRequest.customerInfo.firstName?.[0] || refundRequest.customerInfo.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {[refundRequest.customerInfo.firstName, refundRequest.customerInfo.lastName].filter(Boolean).join(' ') || 'Customer'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {refundRequest.customerInfo.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    {refundRequest.customerInfo.phone && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {refundRequest.customerInfo.phone}
                      </div>
                    )}
                  </SectionCard>

                  {/* Order Info Card */}
                  <SectionCard>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-full bg-slate-100">
                        <ShoppingBag className="h-4 w-4 text-slate-600" />
                      </div>
                      <h3 className="text-sm font-semibold">Order Details</h3>
                    </div>
                    <div className="divide-y">
                      <InfoRow label="Order Number" value={refundRequest.orderInfo.orderNumber ?? 'N/A'} />
                      <InfoRow label="Order Date" value={formatDate(refundRequest.orderInfo.orderDate)} icon={Calendar} />
                      <InfoRow
                        label="Order Status"
                        value={
                          <Badge variant="outline" className="font-medium text-xs">
                            {refundRequest.orderInfo.status}
                          </Badge>
                        }
                      />
                      <InfoRow label="Order Total" value={formatCurrency(refundRequest.orderInfo.totalAmount)} />
                    </div>
                  </SectionCard>

                  {/* Customer Message Card */}
                  <SectionCard>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-full bg-amber-100">
                        <MessageSquare className="h-4 w-4 text-amber-600" />
                      </div>
                      <h3 className="text-sm font-semibold">Customer&apos;s Reason for Refund</h3>
                    </div>
                    {/* Reason Category Badge */}
                    <div className="mb-3">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
                        {refundRequest.reason ? REFUND_REASON_LABELS[refundRequest.reason] || refundRequest.reason : 'Other'}
                      </Badge>
                    </div>
                    {/* Optional Additional Details */}
                    {refundRequest.customerMessage && (
                      <div className="rounded-lg bg-amber-50/50 border border-amber-100 p-3">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">Additional Details:</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{refundRequest.customerMessage}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">Submitted on {formatDateTime(refundRequest.createdAt)}</p>
                  </SectionCard>

                  {/* Admin Response (if reviewed) */}
                  {refundRequest.adminMessage && (
                    <SectionCard className="border-blue-100 bg-blue-50/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-full bg-blue-100">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-blue-900">Admin Response</h3>
                      </div>
                      <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{refundRequest.adminMessage}</p>
                      </div>
                      {refundRequest.reviewerInfo && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Reviewed by {refundRequest.reviewerInfo.firstName} {refundRequest.reviewerInfo.lastName}
                          {refundRequest.reviewedAt && ` on ${formatDateTime(refundRequest.reviewedAt)}`}
                        </p>
                      )}
                    </SectionCard>
                  )}

                  {/* Voucher Info */}
                  {refundRequest.voucher && (
                    <SectionCard className="border-emerald-100 bg-emerald-50/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-full bg-emerald-100">
                          <Receipt className="h-4 w-4 text-emerald-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-emerald-900">Issued Voucher</h3>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                        <div>
                          <p className="font-mono text-lg font-bold text-emerald-700">{refundRequest.voucher.code}</p>
                          <p className="text-xs text-emerald-600 mt-0.5">Valid until used</p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{formatCurrency(refundRequest.refundAmount)}</Badge>
                      </div>
                    </SectionCard>
                  )}
                </TabsContent>

                {/* Items Tab */}
                <TabsContent value="items" className="m-0 space-y-3">
                  {orderItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No items found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {orderItems.map((item, index) => (
                        <motion.div
                          key={`${item.productInfo.productId}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                        >
                          {/* Product Image */}
                          <ProductImage imageKey={item.productInfo.imageUrl?.[0]} />

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.productInfo.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {item.productInfo.variantName && (
                                <Badge variant="outline" className="text-xs font-normal">
                                  {item.productInfo.variantName}
                                </Badge>
                              )}
                              {item.productInfo.categoryName && (
                                <span className="text-xs text-muted-foreground">{item.productInfo.categoryName}</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                              <span className="font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Order Summary */}
                      <div className="mt-4 pt-4 border-t space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal ({order?.itemCount || orderItems.length} items)</span>
                          <span className="font-medium">{formatCurrency(order?.totalAmount || 0)}</span>
                        </div>
                        {(order?.discountAmount ?? 0) > 0 && (
                          <div className="flex justify-between text-sm text-emerald-600">
                            <span>Discount</span>
                            <span>-{formatCurrency(order?.discountAmount || 0)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-base font-semibold pt-2 border-t">
                          <span>Total</span>
                          <span>{formatCurrency(order?.totalAmount || 0)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Payment Tab */}
                <TabsContent value="payment" className="m-0 space-y-4">
                  <SectionCard>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-full bg-slate-100">
                        <CreditCard className="h-4 w-4 text-slate-600" />
                      </div>
                      <h3 className="text-sm font-semibold">Payment Information</h3>
                    </div>
                    <div className="divide-y">
                      <InfoRow
                        label="Payment Status"
                        value={
                          <Badge
                            className={cn(
                              'text-xs font-medium',
                              refundRequest.orderInfo.paymentStatus === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : refundRequest.orderInfo.paymentStatus === 'PENDING'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                            )}
                          >
                            {refundRequest.orderInfo.paymentStatus}
                          </Badge>
                        }
                      />
                      <InfoRow label="Order Total" value={formatCurrency(refundRequest.orderInfo.totalAmount)} />
                      <InfoRow
                        label="Refund Requested"
                        value={<span className="text-blue-600 font-semibold">{formatCurrency(refundRequest.refundAmount)}</span>}
                      />
                    </div>
                  </SectionCard>

                  {/* Timeline Card */}
                  <SectionCard>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-full bg-slate-100">
                        <Clock className="h-4 w-4 text-slate-600" />
                      </div>
                      <h3 className="text-sm font-semibold">Timeline</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <div className="w-px h-full bg-border" />
                        </div>
                        <div className="pb-4">
                          <p className="text-sm font-medium">Refund Requested</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(refundRequest.createdAt)}</p>
                        </div>
                      </div>
                      {refundRequest.reviewedAt && (
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={cn('h-2 w-2 rounded-full', refundRequest.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-red-500')} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{refundRequest.status === 'APPROVED' ? 'Approved' : 'Rejected'}</p>
                            <p className="text-xs text-muted-foreground">{formatDateTime(refundRequest.reviewedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </SectionCard>

                  {/* Voucher Applied */}
                  {order?.voucherSnapshot && (
                    <SectionCard>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-full bg-purple-100">
                          <Receipt className="h-4 w-4 text-purple-600" />
                        </div>
                        <h3 className="text-sm font-semibold">Applied Voucher</h3>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-100">
                        <div>
                          <p className="font-mono font-bold text-purple-700">{order.voucherSnapshot.code}</p>
                          <p className="text-xs text-purple-600">{order.voucherSnapshot.name}</p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                          {order.voucherSnapshot.discountType === 'PERCENTAGE'
                            ? `${order.voucherSnapshot.discountValue}% OFF`
                            : formatCurrency(order.voucherSnapshot.discountValue)}
                        </Badge>
                      </div>
                    </SectionCard>
                  )}
                </TabsContent>
              </div>
            </ScrollArea>

            {/* Footer Actions */}
            <AnimatePresence mode="wait">
              {canTakeAction && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="p-4 border-t bg-muted/30"
                >
                  {!actionType ? (
                    <div className="flex gap-3">
                      <Button
                        variant="default"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                        onClick={() => setActionType('approve')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve Refund
                      </Button>
                      <Button variant="destructive" className="flex-1 shadow-sm" onClick={() => setActionType('reject')}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={form.handleSubmit(actionType === 'approve' ? handleApprove : () => handleRejectClick())} className="space-y-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          {actionType === 'approve' ? 'Message to Customer' : 'Rejection Reason'}
                          <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <Textarea
                          {...form.register('adminMessage')}
                          placeholder={
                            actionType === 'approve'
                              ? 'Add a message for the customer (will be sent with their voucher)...'
                              : 'Explain why the refund request is being rejected...'
                          }
                          rows={3}
                          className="resize-none"
                        />
                        {form.formState.errors.adminMessage && (
                          <p className="mt-1 text-xs text-red-600">{form.formState.errors.adminMessage.message}</p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setActionType(null);
                            form.reset();
                          }}
                        >
                          Cancel
                        </Button>
                        {actionType === 'approve' ? (
                          <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="mr-2">
                                  <Clock className="h-4 w-4" />
                                </motion.div>
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve & Issue Voucher
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button type="submit" variant="destructive" className="flex-1" disabled={isSubmitting}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Refund
                          </Button>
                        )}
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to reject this refund request? The customer will be notified with your rejection reason. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => handleReject(form.getValues())} disabled={isSubmitting}>
              {isSubmitting ? 'Rejecting...' : 'Reject Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
