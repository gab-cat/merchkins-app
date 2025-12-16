'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BatchBadge } from '@/src/features/admin/components/batches/batch-badge';
import { showToast } from '@/lib/toast';
import { Loader2, Plus, X, Tag, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderBatchManagerProps {
  orderId: Id<'orders'>;
  organizationId: Id<'organizations'>;
  currentBatches?: Array<{ id: Id<'orderBatches'>; name: string }>;
}

export function OrderBatchManager({ orderId, organizationId, currentBatches = [] }: OrderBatchManagerProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState<Id<'orderBatches'> | null>(null);

  // Fetch available batches
  const batches = useQuery(api.orderBatches.queries.index.getBatches, {
    organizationId,
  });

  // Mutations
  const assignToBatch = useMutation(api.orderBatches.mutations.index.assignOrdersToBatch);
  const removeFromBatch = useMutation(api.orderBatches.mutations.index.removeOrdersFromBatch);

  // Filter out already assigned batches
  const availableBatches = batches?.filter((batch) => !currentBatches.some((cb) => cb.id === batch._id) && !batch.isDeleted);

  async function handleAssign(batchId: Id<'orderBatches'>) {
    setIsAssigning(true);
    try {
      await assignToBatch({
        batchId,
        orderIds: [orderId],
      });
      showToast({ type: 'success', title: 'Order added to batch' });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to add to batch',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleRemove(batchId: Id<'orderBatches'>) {
    setIsRemoving(batchId);
    try {
      await removeFromBatch({
        batchId,
        orderIds: [orderId],
      });
      showToast({ type: 'success', title: 'Order removed from batch' });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to remove from batch',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsRemoving(null);
    }
  }

  const loading = batches === undefined;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Tag className="h-4 w-4" />
          Batch Assignment
        </CardTitle>
        <CardDescription>Manage order batch assignments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current batch assignments */}
        <div className="space-y-2">
          {currentBatches.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {currentBatches.map((batch) => (
                <motion.div
                  key={batch.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50"
                >
                  <BatchBadge name={batch.name} size="md" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemove(batch.id)}
                    disabled={isRemoving === batch.id}
                  >
                    {isRemoving === batch.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-3">No batches assigned</p>
          )}
        </div>

        {/* Add to batch dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full" disabled={loading || isAssigning || !availableBatches?.length}>
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : availableBatches?.length === 0 ? (
                'No available batches'
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Batch
                  <ChevronDown className="h-4 w-4 ml-auto" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {availableBatches?.map((batch) => (
              <DropdownMenuItem key={batch._id} onClick={() => handleAssign(batch._id)}>
                <Tag className="h-4 w-4 mr-2 text-blue-600" />
                {batch.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
