'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { showToast } from '@/lib/toast';
import { AlertTriangle } from 'lucide-react';

interface CancelOrderModalProps {
  orderId: Id<'orders'>;
  orderNumber?: string;
  isPaid: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CancelOrderModal({ orderId, orderNumber, isPaid, open, onOpenChange, onSuccess }: CancelOrderModalProps) {
  const cancelOrder = useMutation(api.orders.mutations.index.cancelOrder);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelOrder({
        orderId,
        reason: 'CUSTOMER_REQUEST',
        message: 'Order cancelled by customer',
      });
      showToast({ type: 'success', title: 'Order cancelled successfully' });
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order';
      showToast({ type: 'error', title: errorMessage });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <DialogTitle>Cancel Order</DialogTitle>
          </div>
          <DialogDescription>
            {isPaid
              ? 'This order has been paid. Please submit a refund request instead.'
              : `Are you sure you want to cancel order ${orderNumber ?? 'this order'}? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>
        {!isPaid && (
          <div className="py-4">
            <p className="text-sm text-slate-600">Cancelling this order will:</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600 list-disc list-inside">
              <li>Mark the order as cancelled</li>
              <li>Restore inventory for products in this order</li>
            </ul>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCancelling}>
            {isPaid ? 'Close' : 'Keep Order'}
          </Button>
          {!isPaid && (
            <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
