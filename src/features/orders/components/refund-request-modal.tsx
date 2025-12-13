'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { showToast } from '@/lib/toast';
import { AlertCircle } from 'lucide-react';

const REFUND_REASONS = [
  { value: 'WRONG_SIZE', label: 'Wrong Size' },
  { value: 'WRONG_ITEM', label: 'Wrong Item Received' },
  { value: 'WRONG_PAYMENT', label: 'Wrong Payment Method' },
  { value: 'DEFECTIVE_ITEM', label: 'Defective/Damaged Item' },
  { value: 'NOT_AS_DESCRIBED', label: 'Item Not as Described' },
  { value: 'CHANGED_MIND', label: 'Changed My Mind' },
  { value: 'DUPLICATE_ORDER', label: 'Duplicate Order' },
  { value: 'DELIVERY_ISSUE', label: 'Delivery Issue' },
  { value: 'OTHER', label: 'Other' },
] as const;

type RefundReasonValue = (typeof REFUND_REASONS)[number]['value'];

const schema = z.object({
  reason: z.enum(
    ['WRONG_SIZE', 'WRONG_ITEM', 'WRONG_PAYMENT', 'DEFECTIVE_ITEM', 'NOT_AS_DESCRIBED', 'CHANGED_MIND', 'DUPLICATE_ORDER', 'DELIVERY_ISSUE', 'OTHER'],
    {
      required_error: 'Please select a reason for your refund',
    }
  ),
  customerMessage: z.string().max(2000, 'Message is too long').optional(),
});

type FormValues = z.infer<typeof schema>;

interface RefundRequestModalProps {
  orderId: Id<'orders'>;
  orderNumber?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RefundRequestModal({ orderId, orderNumber, open, onOpenChange, onSuccess }: RefundRequestModalProps) {
  const createRefundRequest = useMutation(api.refundRequests.mutations.index.createRefundRequest);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: undefined,
      customerMessage: '',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await createRefundRequest({
        orderId,
        reason: values.reason,
        customerMessage: values.customerMessage || undefined,
      });
      showToast({ type: 'success', title: 'Refund request submitted successfully' });
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit refund request';
      showToast({ type: 'error', title: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <DialogTitle>Request Refund</DialogTitle>
          </div>
          <DialogDescription>
            Submit a refund request for order {orderNumber ?? 'this order'}. An admin will review your request within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Reason Dropdown */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Reason for Refund <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.watch('reason')}
              onValueChange={(value: RefundReasonValue) => {
                form.setValue('reason', value, { shouldValidate: true });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {REFUND_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.reason && <p className="mt-1 text-xs text-red-600">{form.formState.errors.reason.message}</p>}
          </div>

          {/* Optional Message */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Additional Details <span className="text-slate-400">(Optional)</span>
            </label>
            <Textarea
              {...form.register('customerMessage')}
              placeholder="Provide any additional details about your refund request..."
              rows={4}
              className="resize-none"
            />
            {form.formState.errors.customerMessage && <p className="mt-1 text-xs text-red-600">{form.formState.errors.customerMessage.message}</p>}
            <p className="mt-1 text-xs text-slate-500">{form.watch('customerMessage')?.length ?? 0} / 2000 characters</p>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> Refund requests must be submitted within 24 hours of payment. Approved refunds will be issued as platform
              vouchers that can be used at any store.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !form.watch('reason')}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
