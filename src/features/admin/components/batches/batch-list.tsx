'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Package, Calendar, Archive, Edit, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { BatchForm } from './batch-form';
import { BatchBadge } from './batch-badge';
import { motion, AnimatePresence } from 'framer-motion';
import type { Id } from '@/convex/_generated/dataModel';
import { useSearchParams } from 'next/navigation';

interface BatchListProps {
  organizationId: Id<'organizations'>;
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BatchList({ organizationId }: BatchListProps) {
  const batches = useQuery(api.orderBatches.index.getBatches, {
    organizationId,
    includeDeleted: false,
  });

  const deleteBatch = useMutation(api.orderBatches.index.deleteBatch);
  const orgSlug = useSearchParams().get('org');

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Id<'orderBatches'> | null>(null);
  const [archivingBatch, setArchivingBatch] = useState<Id<'orderBatches'> | null>(null);

  const handleArchive = async (batchId: Id<'orderBatches'>) => {
    try {
      await deleteBatch({ batchId });
      setArchivingBatch(null);
    } catch (error) {
      console.error('Failed to archive batch:', error);
    }
  };

  const editingBatchData = batches?.find((b) => b._id === editingBatch);

  if (batches === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Order Batches</h2>
            <p className="text-sm text-muted-foreground">
              {batches.length} batch{batches.length !== 1 ? 'es' : ''} total
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Batch
          </Button>
        </div>

        {batches.length === 0 ? (
          <div className="py-12 text-center border rounded-lg">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No batches yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first batch to start organizing orders</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Batch
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Batch Name</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Date Range</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Orders</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {batches.map((batch, index) => (
                    <motion.tr
                      key={batch._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <BatchBadge name={batch.name} isArchived={batch.isDeleted} />
                          {!batch.isActive && <span className="text-xs text-muted-foreground">(Inactive)</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium">{batch.stats.total}</span>
                          <span className="text-muted-foreground">
                            {batch.stats.pending} pending, {batch.stats.delivered} delivered
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {batch.isActive ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">Inactive</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/batches/${batch._id}?org=${orgSlug}`}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Orders
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingBatch(batch._id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setArchivingBatch(batch._id)} className="text-destructive">
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <BatchForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        organizationId={organizationId}
        onSuccess={() => {
          setCreateDialogOpen(false);
        }}
      />

      {editingBatchData && (
        <BatchForm
          open={!!editingBatch}
          onOpenChange={(open) => {
            if (!open) setEditingBatch(null);
          }}
          organizationId={organizationId}
          batchId={editingBatch!}
          initialData={{
            name: editingBatchData.name,
            description: editingBatchData.description,
            startDate: editingBatchData.startDate,
            endDate: editingBatchData.endDate,
            isActive: editingBatchData.isActive,
          }}
          onSuccess={() => {
            setEditingBatch(null);
          }}
        />
      )}

      {archivingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Archive Batch?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will archive the batch. Orders will retain their batch label for historical reference.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setArchivingBatch(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleArchive(archivingBatch)}>
                Archive
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
