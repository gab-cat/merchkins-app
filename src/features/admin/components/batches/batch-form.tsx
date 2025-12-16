'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Id } from '@/convex/_generated/dataModel';

function formatDateForInput(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string): number {
  const date = new Date(value);
  // Set to start of day in local timezone
  return date.setHours(0, 0, 0, 0);
}

interface BatchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: Id<'organizations'>;
  batchId?: Id<'orderBatches'>;
  initialData?: {
    name: string;
    description?: string;
    startDate: number;
    endDate: number;
    isActive: boolean;
  };
  onSuccess?: () => void;
}

export function BatchForm({ open, onOpenChange, organizationId, batchId, initialData, onSuccess }: BatchFormProps) {
  const createBatch = useMutation(api.orderBatches.index.createBatch);
  const updateBatch = useMutation(api.orderBatches.index.updateBatch);

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [startDateInput, setStartDateInput] = useState(initialData?.startDate ? formatDateForInput(initialData.startDate) : '');
  const [endDateInput, setEndDateInput] = useState(initialData?.endDate ? formatDateForInput(initialData.endDate) : '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setStartDateInput(formatDateForInput(initialData.startDate));
      setEndDateInput(formatDateForInput(initialData.endDate));
      setIsActive(initialData.isActive);
    } else {
      setName('');
      setDescription('');
      setStartDateInput('');
      setEndDateInput('');
      setIsActive(true);
    }
    setError(null);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Batch name is required');
      return;
    }

    if (!startDateInput || !endDateInput) {
      setError('Both start and end dates are required');
      return;
    }

    const startDate = parseDateInput(startDateInput);
    const endDate = parseDateInput(endDateInput);

    if (startDate >= endDate) {
      setError('Start date must be before end date');
      return;
    }

    setIsSubmitting(true);

    try {
      if (batchId && initialData) {
        // Update existing batch
        await updateBatch({
          batchId,
          name: name.trim(),
          description: description.trim() || undefined,
          startDate,
          endDate,
          isActive,
        });
      } else {
        // Create new batch
        await createBatch({
          organizationId,
          name: name.trim(),
          description: description.trim() || undefined,
          startDate,
          endDate,
          isActive,
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{batchId ? 'Edit Batch' : 'Create Batch'}</DialogTitle>
          <DialogDescription>
            {batchId
              ? 'Update batch details. Orders will be automatically assigned based on the date range.'
              : 'Create a new batch to group orders. Orders within the date range will be automatically assigned.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Batch Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., December Week 1" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this batch"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input id="startDate" type="date" value={startDateInput} onChange={(e) => setStartDateInput(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input id="endDate" type="date" value={endDateInput} onChange={(e) => setEndDateInput(e.target.value)} required />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="font-normal cursor-pointer">
              Active (orders will be auto-assigned to active batches)
            </Label>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : batchId ? 'Update Batch' : 'Create Batch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
