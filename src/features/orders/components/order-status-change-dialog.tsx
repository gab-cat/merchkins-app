'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';

// UI components
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// Icons
import { Loader2, ArrowRight, Package, Clock, RefreshCw, Truck, XCircle, CreditCard, Banknote, AlertCircle } from 'lucide-react';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED';
type PaymentStatus = 'PENDING' | 'DOWNPAYMENT' | 'PAID' | 'REFUNDED';

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
  DOWNPAYMENT: {
    icon: Banknote,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-950/30',
    label: 'Downpayment',
  },
  PAID: {
    icon: CreditCard,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950/30',
    label: 'Paid',
  },
  REFUNDED: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-950/30',
    label: 'Refunded',
  },
};

interface OrderStatusChangeDialogProps {
  orderId: Id<'orders'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changeType: 'status' | 'payment';
  currentValue: OrderStatus | PaymentStatus;
  newValue: OrderStatus | PaymentStatus;
  onSuccess?: () => void;
}

export function OrderStatusChangeDialog({
  orderId,
  open,
  onOpenChange,
  changeType,
  currentValue,
  newValue,
  onSuccess,
}: OrderStatusChangeDialogProps) {
  const [note, setNote] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateOrderWithNote = useMutation(api.orders.mutations.index.updateOrderWithNote);

  const config = changeType === 'status' ? ORDER_STATUS_CONFIG : PAYMENT_STATUS_CONFIG;
  const currentConfig = config[currentValue as keyof typeof config];
  const newConfig = config[newValue as keyof typeof config];
  const CurrentIcon = currentConfig?.icon || Clock;
  const NewIcon = newConfig?.icon || Clock;

  const title = changeType === 'status' ? 'Change Order Status' : 'Change Payment Status';
  const description =
    changeType === 'status'
      ? 'Please provide a note explaining the status change. This helps track order history.'
      : 'Please provide a note explaining the payment status change. This helps track payment history.';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!note.trim()) {
      showToast({ type: 'error', title: 'Note is required' });
      return;
    }

    setIsSubmitting(true);
    try {
      const args: Parameters<typeof updateOrderWithNote>[0] = {
        orderId,
        userNote: note.trim(),
        isPublic,
      };

      if (changeType === 'status') {
        args.status = newValue as OrderStatus;
      } else {
        args.paymentStatus = newValue as PaymentStatus;
      }

      await updateOrderWithNote(args);

      const successMessage =
        changeType === 'status'
          ? `Order status updated to ${newConfig?.label || newValue}`
          : `Payment status updated to ${newConfig?.label || newValue}`;

      showToast({ type: 'success', title: successMessage });
      onOpenChange(false);
      setNote('');
      setIsPublic(true);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      showToast({ type: 'error', title: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      onOpenChange(false);
      setNote('');
      setIsPublic(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status change visualization */}
          <div className="flex items-center justify-center gap-4 py-4 px-6 rounded-lg bg-muted/50 border">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', currentConfig?.bgColor || 'bg-muted')}>
                <CurrentIcon className={cn('h-5 w-5', currentConfig?.color || 'text-muted-foreground')} />
              </div>
              <Badge variant="outline" className="text-xs">
                {currentConfig?.label || currentValue}
              </Badge>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground" />

            <div className="flex flex-col items-center gap-1.5">
              <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', newConfig?.bgColor || 'bg-muted')}>
                <NewIcon className={cn('h-5 w-5', newConfig?.color || 'text-muted-foreground')} />
              </div>
              <Badge variant="default" className="text-xs">
                {newConfig?.label || newValue}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">
              Note <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="note"
              placeholder="Enter reason for this change..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">This note will be recorded in the order activity log.</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public">Visible to customer</Label>
              <p className="text-xs text-muted-foreground">Customer can see this in their order</p>
            </div>
            <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !note.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Updating...
                </>
              ) : (
                'Confirm Change'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default OrderStatusChangeDialog;
