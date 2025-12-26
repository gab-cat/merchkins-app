'use client';

import { Id } from '@/convex/_generated/dataModel';
import { Gift, Clock, CheckCircle, XCircle, DollarSign, User, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { VoucherRefundRequestDialog } from './voucher-refund-request-dialog';
import { useState } from 'react';

interface VoucherCardProps {
  voucher: {
    _id: Id<'vouchers'>;
    code: string;
    name: string;
    description?: string;
    discountValue: number;
    discountType: string;
    usedCount: number;
    validFrom: number;
    validUntil?: number;
    isActive: boolean;
    cancellationInitiator?: 'CUSTOMER' | 'SELLER';
    monetaryRefundEligibleAt?: number;
    monetaryRefundRequestedAt?: number;
    computedStatus: 'active' | 'inactive' | 'expired' | 'used' | 'refunded';
    isMonetaryRefundEligible?: boolean;
    daysUntilMonetaryRefundEligible?: number | null;
  };
}

export function VoucherCard({ voucher }: VoucherCardProps) {
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = () => {
    switch (voucher.computedStatus) {
      case 'active':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'used':
        return (
          <Badge className="bg-slate-50 text-slate-700 border-slate-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Used
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200">
            <XCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case 'refunded':
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
            <DollarSign className="h-3 w-3 mr-1" />
            Refunded
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-50 text-slate-700 border-slate-200">
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        );
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-lg">{voucher.name}</h3>
            </div>
            {voucher.description && <p className="text-sm text-slate-600 mb-2">{voucher.description}</p>}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-lg font-bold text-emerald-700">{voucher.code}</span>
              {getStatusBadge()}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Value:</span>
            <span className="font-semibold text-lg text-emerald-700">{formatCurrency(voucher.discountValue, 'PHP')}</span>
          </div>

          {voucher.cancellationInitiator && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Cancellation Type:</span>
              <div className="flex items-center gap-1">
                {voucher.cancellationInitiator === 'CUSTOMER' ? (
                  <>
                    <User className="h-3 w-3 text-slate-500" />
                    <span className="text-sm font-medium">Customer-initiated</span>
                  </>
                ) : (
                  <>
                    <Store className="h-3 w-3 text-slate-500" />
                    <span className="text-sm font-medium">Seller-initiated</span>
                  </>
                )}
              </div>
            </div>
          )}

          {voucher.validUntil && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Expires:</span>
              <span className="text-sm">{formatDate(voucher.validUntil)}</span>
            </div>
          )}

          {!voucher.validUntil && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Expiration:</span>
              <span className="text-sm text-emerald-600">Never expires</span>
            </div>
          )}
        </div>

        {voucher.cancellationInitiator === 'SELLER' && voucher.computedStatus === 'active' && !voucher.monetaryRefundRequestedAt && (
          <div className="border-t border-slate-200 pt-4 mt-4">
            {voucher.isMonetaryRefundEligible ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  You can request a monetary refund for this voucher. The voucher will be deactivated once approved.
                </p>
                <Button onClick={() => setShowRefundDialog(true)} className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Request Monetary Refund
                </Button>
              </div>
            ) : voucher.daysUntilMonetaryRefundEligible !== null && voucher.daysUntilMonetaryRefundEligible !== undefined ? (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                <Clock className="h-4 w-4" />
                <span>
                  Monetary refund will be available in {voucher.daysUntilMonetaryRefundEligible} day
                  {voucher.daysUntilMonetaryRefundEligible !== 1 ? 's' : ''}
                </span>
              </div>
            ) : null}
          </div>
        )}

        {voucher.monetaryRefundRequestedAt && (
          <div className="border-t border-slate-200 pt-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
              <Clock className="h-4 w-4" />
              <span>Monetary refund request submitted. Waiting for review.</span>
            </div>
          </div>
        )}
      </motion.div>

      {showRefundDialog && <VoucherRefundRequestDialog voucherId={voucher._id} open={showRefundDialog} onOpenChange={setShowRefundDialog} />}
    </>
  );
}
