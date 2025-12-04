'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { showToast } from '@/lib/toast';

// UI components
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// Icons
import { MessageSquarePlus, Loader2 } from 'lucide-react';

interface AddOrderNoteDialogProps {
  orderId: Id<'orders'>;
  trigger?: React.ReactNode;
  onCreated?: () => void;
}

export function AddOrderNoteDialog({ orderId, trigger, onCreated }: AddOrderNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrderLog = useMutation(api.orders.mutations.index.createOrderLog);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!note.trim()) {
      showToast({ type: 'error', title: 'Note cannot be empty' });
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrderLog({
        orderId,
        logType: 'NOTE_ADDED',
        reason: 'Manual note added',
        userMessage: note.trim(),
        isPublic,
      });
      showToast({ type: 'success', title: 'Note added successfully' });
      setOpen(false);
      setNote('');
      setIsPublic(true);
      onCreated?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add note';
      showToast({ type: 'error', title: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquarePlus className="h-4 w-4 mr-1.5" />
            Add Note
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note to Order</DialogTitle>
          <DialogDescription>Add a note or comment to this order. Public notes are visible to customers.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Enter your note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public">Visible to customer</Label>
              <p className="text-xs text-muted-foreground">Customer can see this note in their order details</p>
            </div>
            <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !note.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Note'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddOrderNoteDialog;
