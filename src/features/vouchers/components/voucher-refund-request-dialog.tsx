'use client';

import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, DollarSign } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface VoucherRefundRequestDialogProps {
  voucherId: Id<'vouchers'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoucherRefundRequestDialog({ voucherId, open, onOpenChange }: VoucherRefundRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createVoucherRefundRequest = useMutation(api.voucherRefundRequests.mutations.index.createVoucherRefundRequest);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await createVoucherRefundRequest({ voucherId });
      showToast({
        type: 'success',
        title: 'Refund request submitted',
        description: 'Your monetary refund request has been submitted and is pending review.',
      });
      onOpenChange(false);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Request failed',
        description: error.message || 'Failed to submit refund request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (isSubmitting) {
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Request Monetary Refund
          </DialogTitle>
          <DialogDescription>
            Request a monetary refund for this voucher. Once approved, the voucher will be deactivated and the refund will be processed to your
            original payment method.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Important Information</p>
              <ul className="list-disc list-inside space-y-1 text-amber-700">
                <li>This request will be reviewed by our support team</li>
                <li>The voucher will be deactivated once the refund is approved</li>
                <li>Refunds are processed to your original payment method</li>
                <li>Processing time is typically 3-5 business days</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
