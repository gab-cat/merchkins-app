'use client';

import React, { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { CreditCard, RefreshCw, AlertTriangle } from 'lucide-react';
import { showToast, promiseToast } from '@/lib/toast';
import type { Id } from '@/convex/_generated/dataModel';

interface OrderPaymentLinkProps {
  orderId: Id<'orders'>;
  orderStatus: string;
  paymentStatus?: string;
  xenditInvoiceUrl?: string | null;
  xenditInvoiceCreatedAt?: number | null;
  xenditInvoiceExpiryDate?: number | null;
  compact?: boolean;
}

export function OrderPaymentLink({
  orderId,
  orderStatus,
  paymentStatus,
  xenditInvoiceUrl,
  xenditInvoiceCreatedAt,
  xenditInvoiceExpiryDate,
  compact = false,
}: OrderPaymentLinkProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshInvoice = useAction(api.orders.mutations.index.refreshXenditInvoice);

  // Only show payment link for PENDING orders that haven't been paid
  const shouldShowPayment = orderStatus === 'PENDING' && paymentStatus !== 'PAID';

  if (!shouldShowPayment) {
    return null;
  }

  // Check if invoice is expired (more than 24 hours old)
  const isExpired = xenditInvoiceCreatedAt && xenditInvoiceExpiryDate ? Date.now() > xenditInvoiceExpiryDate : false;

  const handleRefreshInvoice = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRefreshing(true);
    try {
      const result = await promiseToast(refreshInvoice({ orderId }), {
        loading: 'Refreshing payment link...',
        success: 'Payment link refreshed',
        error: 'Failed to refresh payment link',
      });

      if (result.invoiceUrl) {
        window.location.href = result.invoiceUrl;
      }
    } catch (error) {
      console.error('Failed to refresh invoice:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePayNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (xenditInvoiceUrl) {
      window.location.href = xenditInvoiceUrl;
    } else {
      showToast({
        type: 'error',
        title: 'Payment link not available',
        description: 'Please refresh the page and try again.',
      });
    }
  };

  // Compact mode for order list
  if (compact) {
    if (isExpired) {
      return (
        <div className="px-4 pb-4 pt-0">
          <div className="flex items-center justify-between gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-red-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="font-medium">Payment link expired</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefreshInvoice}
              disabled={isRefreshing}
              className="h-7 px-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      );
    }

    if (!xenditInvoiceUrl) {
      return (
        <div className="px-4 pb-4 pt-0">
          <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-amber-700 font-medium">Payment link generating...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="px-4 pb-4 pt-0">
        <Button
          size="sm"
          onClick={handlePayNow}
          className="w-full h-9 bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white text-xs font-semibold rounded-lg shadow-sm"
        >
          <CreditCard className="h-3.5 w-3.5 mr-1.5" />
          Complete Payment
        </Button>
      </div>
    );
  }

  // Full mode for order detail page
  if (isExpired) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-700">Payment link expired</p>
          <p className="text-xs text-red-600/80">Click refresh to get a new payment link.</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefreshInvoice}
          disabled={isRefreshing}
          className="flex-shrink-0 border-red-200 text-red-600 hover:bg-red-100"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    );
  }

  if (!xenditInvoiceUrl) {
    return (
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-700">Payment setup in progress</p>
          <p className="text-xs text-amber-600/80">Your payment link is being generated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-[#1d43d8]/5 border border-[#1d43d8]/10 rounded-xl">
      <CreditCard className="h-5 w-5 text-[#1d43d8] flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-[#1d43d8]">Complete your payment</p>
        <p className="text-xs text-slate-500">Pay securely with e-wallets, cards, or bank transfer</p>
      </div>
      <Button size="sm" onClick={handlePayNow} className="flex-shrink-0 bg-[#1d43d8] hover:bg-[#1d43d8]/90">
        <CreditCard className="h-4 w-4 mr-2" />
        Pay Now
      </Button>
    </div>
  );
}
