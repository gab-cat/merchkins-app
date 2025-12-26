'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { showToast } from '@/lib/toast';
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
import { CheckCircle2, XCircle, Clock, DollarSign, Gift, User, Phone, Mail, Store } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const schema = z.object({
  adminMessage: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message is too long'),
});

type FormValues = z.infer<typeof schema>;

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface VoucherRefundRequestDetailDialogProps {
  requestId: Id<'voucherRefundRequests'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoucherRefundRequestDetailDialog({ requestId, open, onOpenChange }: VoucherRefundRequestDetailDialogProps) {
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const request = useQuery(api.voucherRefundRequests.queries.index.getVoucherRefundRequestById, {
    voucherRefundRequestId: requestId,
  });

  const approveMutation = useMutation(api.voucherRefundRequests.mutations.index.approveVoucherRefundRequest);
  const rejectMutation = useMutation(api.voucherRefundRequests.mutations.index.rejectVoucherRefundRequest);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // Reset form when actionType changes
  useEffect(() => {
    if (actionType !== null) {
      reset({ adminMessage: '' });
    }
  }, [actionType, reset]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset({ adminMessage: '' });
      setActionType(null);
    }
  }, [open, reset]);

  const handleApprove = async (data: FormValues) => {
    try {
      await approveMutation({
        voucherRefundRequestId: requestId,
        adminMessage: data.adminMessage,
      });
      showToast({
        type: 'success',
        title: 'Request approved',
        description: 'The monetary refund has been approved and will be processed.',
      });
      reset();
      setActionType(null);
      onOpenChange(false);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Approval failed',
        description: error.message || 'Failed to approve request. Please try again.',
      });
    }
  };

  const handleReject = async (data: FormValues) => {
    try {
      await rejectMutation({
        voucherRefundRequestId: requestId,
        adminMessage: data.adminMessage,
      });
      showToast({
        type: 'success',
        title: 'Request rejected',
        description: 'The request has been rejected.',
      });
      reset();
      setActionType(null);
      onOpenChange(false);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Rejection failed',
        description: error.message || 'Failed to reject request. Please try again.',
      });
    }
  };

  if (!request) {
    return null;
  }

  const getStatusBadge = () => {
    switch (request.status) {
      case 'PENDING':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Voucher Refund Request
            </DialogTitle>
            <DialogDescription>Review and process customer monetary refund request</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              {getStatusBadge()}
              <span className="text-sm text-slate-600">Requested {formatDate(request.createdAt)}</span>
            </div>

            {/* Voucher Info */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Voucher Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Voucher Code</p>
                  <p className="font-mono font-semibold text-lg">{request.voucherInfo.code}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Voucher Value</p>
                  <p className="font-semibold text-lg text-emerald-700">{formatCurrency(request.voucherInfo.discountValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Cancellation Type</p>
                  <div className="flex items-center gap-1 mt-1">
                    {request.voucherInfo.cancellationInitiator === 'CUSTOMER' ? (
                      <>
                        <User className="h-3 w-3 text-slate-500" />
                        <span className="text-sm">Customer-initiated</span>
                      </>
                    ) : (
                      <>
                        <Store className="h-3 w-3 text-slate-500" />
                        <span className="text-sm">Seller-initiated</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Created</p>
                  <p className="text-sm">{formatDate(request.voucherInfo.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={request.customerInfo.imageUrl} />
                  <AvatarFallback>{request.customerInfo.firstName?.[0] || request.customerInfo.email[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {request.customerInfo.firstName} {request.customerInfo.lastName}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {request.customerInfo.email}
                    </span>
                    {request.customerInfo.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {request.customerInfo.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Request Amount */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 mb-1">Requested Refund Amount</p>
                  <p className="text-3xl font-bold text-blue-900">{formatCurrency(request.requestedAmount)}</p>
                </div>
                <DollarSign className="h-12 w-12 text-blue-600 opacity-50" />
              </div>
            </div>

            {/* Admin Message (if reviewed) */}
            {request.adminMessage && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Admin Response</h3>
                <p className="text-sm text-slate-700">{request.adminMessage}</p>
                {request.reviewerInfo && (
                  <p className="text-xs text-slate-500 mt-2">
                    Reviewed by {request.reviewerInfo.firstName} {request.reviewerInfo.lastName} on{' '}
                    {request.reviewedAt ? formatDate(request.reviewedAt) : 'N/A'}
                  </p>
                )}
              </div>
            )}

            {/* Actions (if pending) */}
            {request.status === 'PENDING' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => setActionType('approve')} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Refund
                </Button>
                <Button onClick={() => setActionType('reject')} variant="destructive" className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Request
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={actionType === 'approve'} onOpenChange={(open) => !open && setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Monetary Refund</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a message to the customer. This will be sent along with the approval notification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleSubmit(handleApprove)} className="space-y-4">
            <div>
              <Textarea {...register('adminMessage')} placeholder="Enter approval message..." rows={4} className="resize-none" />
              {errors.adminMessage && <p className="text-sm text-red-600 mt-1">{errors.adminMessage.message}</p>}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel type="button" onClick={() => setActionType(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                {isSubmitting ? 'Approving...' : 'Approve Refund'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={actionType === 'reject'} onOpenChange={(open) => !open && setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Monetary Refund Request</AlertDialogTitle>
            <AlertDialogDescription>Please provide a reason for rejection. This will be sent to the customer.</AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleSubmit(handleReject)} className="space-y-4">
            <div>
              <Textarea {...register('adminMessage')} placeholder="Enter rejection reason..." rows={4} className="resize-none" />
              {errors.adminMessage && <p className="text-sm text-red-600 mt-1">{errors.adminMessage.message}</p>}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel type="button" onClick={() => setActionType(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Rejecting...' : 'Reject Request'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
