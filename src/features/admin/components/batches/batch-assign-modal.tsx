'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
import type { Id } from '@/convex/_generated/dataModel';

interface BatchAssignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: Id<'organizations'>;
  orderIds: Id<'orders'>[];
  onSuccess?: () => void;
}

export function BatchAssignModal({ open, onOpenChange, organizationId, orderIds, onSuccess }: BatchAssignModalProps) {
  const batches = useQuery(api.orderBatches.index.getBatches, {
    organizationId,
    includeDeleted: false,
  });

  const assignOrders = useMutation(api.orderBatches.index.assignOrdersToBatch);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAssign = async () => {
    if (!selectedBatchId) {
      showToast({
        title: 'Error',
        description: 'Please select a batch',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await assignOrders({
        batchId: selectedBatchId as Id<'orderBatches'>,
        orderIds: orderIds,
      });

      showToast({
        title: 'Success',
        description: `Assigned ${orderIds.length} order(s) to batch`,
        type: 'success',
      });
      setSelectedBatchId('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign orders',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Orders to Batch</DialogTitle>
          <DialogDescription>
            Assign {orderIds.length} order{orderIds.length !== 1 ? 's' : ''} to a batch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Batch</Label>
            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a batch" />
              </SelectTrigger>
              <SelectContent>
                {batches === undefined ? (
                  <SelectItem value="loading" disabled>
                    Loading batches...
                  </SelectItem>
                ) : batches.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No batches available
                  </SelectItem>
                ) : (
                  batches.map((batch) => (
                    <SelectItem key={batch._id} value={batch._id}>
                      {batch.name} ({batch.stats.total} orders)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isSubmitting || !selectedBatchId}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Orders'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
