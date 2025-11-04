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
}

export function OrderPaymentLink({
  orderId,
  orderStatus,
  paymentStatus,
  xenditInvoiceUrl,
  xenditInvoiceCreatedAt,
  xenditInvoiceExpiryDate,
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

  const handleRefreshInvoice = async () => {
    setIsRefreshing(true);
    try {
      const result = await promiseToast(refreshInvoice({ orderId }), {
        loading: 'Refreshing payment link...',
        success: 'Payment link refreshed',
        error: 'Failed to refresh payment link',
      });

      if (result.invoiceUrl) {
        // Redirect to new payment URL
        window.location.href = result.invoiceUrl;
      }
    } catch (error) {
      console.error('Failed to refresh invoice:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePayNow = () => {
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

  if (isExpired) {
    return (
      <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-destructive">Payment link expired</p>
          <p className="text-xs text-muted-foreground">Xendit payment links are valid for 24 hours. Click refresh to get a new link.</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleRefreshInvoice} disabled={isRefreshing} className="flex-shrink-0">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Link
        </Button>
      </div>
    );
  }

  if (!xenditInvoiceUrl) {
    return (
      <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">Payment setup in progress</p>
          <p className="text-xs text-yellow-700">Your payment link is being generated. Please refresh the page in a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <CreditCard className="h-5 w-5 text-primary flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-primary">Complete your payment</p>
        <p className="text-xs text-muted-foreground">Pay securely with e-wallets, virtual accounts, or cards</p>
      </div>
      <Button size="sm" onClick={handlePayNow} className="flex-shrink-0">
        <CreditCard className="h-4 w-4 mr-2" />
        Pay Now
      </Button>
    </div>
  );
}
