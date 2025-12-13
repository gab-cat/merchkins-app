'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { showToast } from '@/lib/toast';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Clock, User, DollarSign, FileText, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

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

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: 'PENDING' | 'APPROVED' | 'REJECTED' }) {
  const config = {
    PENDING: { label: 'Pending Review', icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200' },
    APPROVED: { label: 'Approved', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    REJECTED: { label: 'Rejected', icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200' },
  }[status];

  const Icon = config.icon;
  return (
    <Badge className={cn('text-sm font-medium border px-3 py-1.5 flex items-center gap-2', config.className)}>
      <Icon className="h-4 w-4" />
      {config.label}
    </Badge>
  );
}

interface RefundRequestDetailSheetProps {
  refundRequestId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RefundRequestDetailSheet({ refundRequestId, open, onOpenChange }: RefundRequestDetailSheetProps) {
  const refundRequest = useQuery(api.refundRequests.queries.index.getRefundRequestById, {
    refundRequestId: refundRequestId as Id<'refundRequests'>,
  });

  const approveRefund = useMutation(api.refundRequests.mutations.index.approveRefundRequest);
  const rejectRefund = useMutation(api.refundRequests.mutations.index.rejectRefundRequest);

  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      showToast({ type: 'success', title: 'Refund request approved' });
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
      onOpenChange(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject refund request';
      showToast({ type: 'error', title: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!refundRequest) {
    return null;
  }

  const canTakeAction = refundRequest.status === 'PENDING';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Refund Request Details</SheetTitle>
          <SheetDescription>Review customer refund request and take action</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <StatusBadge status={refundRequest.status} />
            {refundRequest.voucher && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Voucher Issued: {refundRequest.voucher.code}</Badge>
            )}
          </div>

          <Separator />

          {/* Order Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Order Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number:</span>
                <span className="font-medium">{refundRequest.orderInfo.orderNumber ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date:</span>
                <span className="font-medium">{formatDate(refundRequest.orderInfo.orderDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Status:</span>
                <span className="font-medium">{refundRequest.orderInfo.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status:</span>
                <span className="font-medium">{refundRequest.orderInfo.paymentStatus}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">
                  {[refundRequest.customerInfo.firstName, refundRequest.customerInfo.lastName].filter(Boolean).join(' ') || 'Customer'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{refundRequest.customerInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{refundRequest.customerInfo.phone}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Refund Amount */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Refund Amount
            </h3>
            <div className="text-2xl font-bold text-[#1d43d8]">{formatCurrency(refundRequest.refundAmount)}</div>
          </div>

          <Separator />

          {/* Customer Message */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Customer&apos;s Reason for Refund</h3>
            {/* Reason Category Badge */}
            <div className="mb-3">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
                {refundRequest.reason ? REFUND_REASON_LABELS[refundRequest.reason] || refundRequest.reason : 'Other'}
              </Badge>
            </div>
            {/* Optional Additional Details */}
            {refundRequest.customerMessage && (
              <div className="rounded-lg border bg-slate-50 p-4">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Additional Details:</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{refundRequest.customerMessage}</p>
              </div>
            )}
          </div>

          {/* Admin Message (if reviewed) */}
          {refundRequest.adminMessage && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-3">Admin Response</h3>
                <div className="rounded-lg border bg-blue-50 p-4">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{refundRequest.adminMessage}</p>
                </div>
                {refundRequest.reviewerInfo && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Reviewed by {refundRequest.reviewerInfo.firstName} {refundRequest.reviewerInfo.lastName} on{' '}
                    {refundRequest.reviewedAt ? formatDate(refundRequest.reviewedAt) : 'N/A'}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Action Form */}
          {canTakeAction && !actionType && (
            <>
              <Separator />
              <div className="flex gap-3">
                <Button variant="default" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => setActionType('approve')}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Refund
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => setActionType('reject')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Refund
                </Button>
              </div>
            </>
          )}

          {/* Approve Form */}
          {canTakeAction && actionType === 'approve' && (
            <>
              <Separator />
              <form onSubmit={form.handleSubmit(handleApprove)} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Admin Message (Required)</label>
                  <Textarea {...form.register('adminMessage')} placeholder="Add a message for the customer..." rows={4} className="resize-none" />
                  {form.formState.errors.adminMessage && <p className="mt-1 text-xs text-red-600">{form.formState.errors.adminMessage.message}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">This message will be sent to the customer along with their refund voucher.</p>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setActionType(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                    {isSubmitting ? 'Approving...' : 'Approve & Issue Voucher'}
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* Reject Form */}
          {canTakeAction && actionType === 'reject' && (
            <>
              <Separator />
              <form onSubmit={form.handleSubmit(handleReject)} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Rejection Reason (Required)</label>
                  <Textarea
                    {...form.register('adminMessage')}
                    placeholder="Explain why the refund request is being rejected..."
                    rows={4}
                    className="resize-none"
                  />
                  {form.formState.errors.adminMessage && <p className="mt-1 text-xs text-red-600">{form.formState.errors.adminMessage.message}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">This message will be sent to the customer explaining the rejection.</p>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setActionType(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="destructive" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? 'Rejecting...' : 'Reject Refund'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
