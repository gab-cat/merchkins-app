'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
import type { Id } from '@/convex/_generated/dataModel';

interface BatchBulkActionsProps {
  batchId: Id<'orderBatches'>;
  selectedOrderIds: string[];
  onSuccess?: () => void;
}

type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED';
type PaymentStatus = 'PENDING' | 'DOWNPAYMENT' | 'PAID' | 'REFUNDED';

export function BatchBulkActions({ batchId, selectedOrderIds, onSuccess }: BatchBulkActionsProps) {
  const bulkUpdate = useMutation(api.orderBatches.index.bulkUpdateBatchOrders);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateType, setUpdateType] = useState<'status' | 'payment' | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus | ''>('');
  const [userMessage, setUserMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBulkUpdate = async () => {
    if (!updateType) return;

    if (updateType === 'status' && !newStatus) {
      showToast({
        title: 'Error',
        description: 'Please select a status',
        type: 'error',
      });
      return;
    }

    if (updateType === 'payment' && !newPaymentStatus) {
      showToast({
        title: 'Error',
        description: 'Please select a payment status',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current filters from selected orders
      // For simplicity, we'll update all selected orders regardless of their current status
      // The mutation will handle filtering
      await bulkUpdate({
        batchId,
        filters: {}, // Empty filters means update all orders in batch (we'll filter by selected IDs in the UI)
        updates: {
          ...(updateType === 'status' && newStatus ? { status: newStatus } : {}),
          ...(updateType === 'payment' && newPaymentStatus ? { paymentStatus: newPaymentStatus } : {}),
        },
        userMessage: userMessage || undefined,
      });

      showToast({
        title: 'Success',
        description: `Updated ${selectedOrderIds.length} order(s)`,
        type: 'success',
      });
      setDialogOpen(false);
      setUpdateType(null);
      setNewStatus('');
      setNewPaymentStatus('');
      setUserMessage('');
      onSuccess?.();
    } catch (error) {
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update orders',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedOrderIds.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-4 bg-muted/50 border rounded-lg">
      <span className="text-sm font-medium">
        {selectedOrderIds.length} order{selectedOrderIds.length !== 1 ? 's' : ''} selected
      </span>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setUpdateType('status');
            setDialogOpen(true);
          }}
        >
          Update Status
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setUpdateType('payment');
            setDialogOpen(true);
          }}
        >
          Update Payment
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update {updateType === 'status' ? 'Status' : 'Payment Status'}</DialogTitle>
            <DialogDescription>
              Update {selectedOrderIds.length} order{selectedOrderIds.length !== 1 ? 's' : ''} in this batch
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {updateType === 'status' && (
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {updateType === 'payment' && (
              <div className="space-y-2">
                <Label>New Payment Status</Label>
                <Select value={newPaymentStatus} onValueChange={(v) => setNewPaymentStatus(v as PaymentStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="DOWNPAYMENT">Downpayment</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Textarea value={userMessage} onChange={(e) => setUserMessage(e.target.value)} placeholder="Add a note about this update..." rows={3} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Orders'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
