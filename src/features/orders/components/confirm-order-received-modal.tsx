'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
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
import { CheckCircle2, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Id } from '@/convex/_generated/dataModel';

interface ConfirmOrderReceivedModalProps {
  orderId: Id<'orders'>;
  orderNumber?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ConfirmOrderReceivedModal({ orderId, orderNumber, open, onOpenChange, onSuccess }: ConfirmOrderReceivedModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const confirmOrderReceived = useMutation(api.orders.mutations.index.confirmOrderReceived);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await confirmOrderReceived({ orderId });
      toast.success('Order confirmed as received!', {
        description: 'Thank you for confirming. We hope you enjoy your purchase!',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm order received';
      toast.error('Failed to confirm', {
        description: errorMessage,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-emerald-100">
              <Package className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-bold">Confirm Order Received</AlertDialogTitle>
              {orderNumber && <p className="text-sm text-slate-500 font-mono">Order #{orderNumber}</p>}
            </div>
          </div>
          <AlertDialogDescription className="text-slate-600 pt-2">
            By confirming, you acknowledge that you have received your order and it is in good condition. This will mark your order as{' '}
            <span className="font-semibold text-emerald-600">Delivered</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isConfirming}>Not Yet</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isConfirming}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Yes, I Received It
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
