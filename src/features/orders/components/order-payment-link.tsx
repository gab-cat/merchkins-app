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
  // Paymongo fields (primary)
  paymongoCheckoutUrl?: string | null;
  paymongoCheckoutCreatedAt?: number | null;
  paymongoCheckoutExpiryDate?: number | null;
  // Xendit fields (legacy - for backward compatibility)
  xenditInvoiceUrl?: string | null;
  xenditInvoiceCreatedAt?: number | null;
  xenditInvoiceExpiryDate?: number | null;
  totalAmount?: number;
  customerEmail?: string;
  orderNumber?: string | null;
  compact?: boolean;
  short?: boolean; // Short button variant to replace badge
}

export function OrderPaymentLink({
  orderId,
  orderStatus,
  paymentStatus,
  paymongoCheckoutUrl,
  paymongoCheckoutCreatedAt,
  paymongoCheckoutExpiryDate,
  xenditInvoiceUrl,
  xenditInvoiceCreatedAt,
  xenditInvoiceExpiryDate,
  compact = false,
  short = false,
}: OrderPaymentLinkProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Paymongo action for refreshing/creating checkout
  const refreshPaymongoCheckout = useAction(api.orders.mutations.index.refreshPaymongoCheckout);

  // Only show payment link for PENDING orders that haven't been paid
  const shouldShowPayment = orderStatus === 'PENDING' && paymentStatus !== 'PAID';

  if (!shouldShowPayment) {
    return null;
  }

  // Determine which checkout URL to use (prefer Paymongo, fall back to Xendit for legacy orders)
  const checkoutUrl = paymongoCheckoutUrl || xenditInvoiceUrl;
  const checkoutCreatedAt = paymongoCheckoutCreatedAt || xenditInvoiceCreatedAt;
  const checkoutExpiryDate = paymongoCheckoutExpiryDate || xenditInvoiceExpiryDate;

  // Check if checkout is expired (more than 24 hours old or past expiry date)
  const isExpired = checkoutCreatedAt && checkoutExpiryDate ? Date.now() > checkoutExpiryDate : false;

  const handleRefreshCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRefreshing(true);
    try {
      const result = await promiseToast(refreshPaymongoCheckout({ orderId }), {
        loading: 'Refreshing payment link...',
        success: 'Payment link refreshed',
        error: 'Failed to refresh payment link',
      });

      if (result.checkoutUrl) {
        // External Paymongo URL - use window.location for external redirects
        window.location.href = result.checkoutUrl;
      }
    } catch (error) {
      console.error('Failed to refresh checkout:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePayNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If payment link exists, redirect immediately (external Paymongo URL)
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }

    // If no payment link exists, create one using the refresh action
    // which handles both creating new checkouts and refreshing expired ones

    setIsCreating(true);
    try {
      showToast({ type: 'info', title: 'Creating payment link...', description: 'Please wait.' });

      // Use refreshPaymongoCheckout which handles creating new checkouts if none exists
      const result = await refreshPaymongoCheckout({ orderId });

      if (result.checkoutUrl) {
        showToast({ type: 'success', title: 'Payment link created', description: 'Redirecting...' });
        // External Paymongo URL - use window.location for external redirects
        window.location.href = result.checkoutUrl;
      } else {
        showToast({ type: 'error', title: 'Failed to get payment link', description: 'Please try again.' });
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
      showToast({ type: 'error', title: 'Failed to create payment link', description: 'Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  // Short button variant to replace badge (for desktop)
  if (short) {
    if (isExpired) {
      return (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefreshCheckout}
          disabled={isRefreshing}
          className="h-6 px-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-100 rounded-full"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        onClick={handlePayNow}
        disabled={isCreating}
        className="h-6 px-2.5 text-xs font-medium bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white rounded-full shadow-sm"
      >
        <CreditCard className={`h-3 w-3 mr-1 ${isCreating ? 'animate-pulse' : ''}`} />
        {isCreating ? 'Creating...' : 'Pay Now'}
      </Button>
    );
  }

  // Compact mode for order list (long button for mobile)
  if (compact) {
    if (isExpired) {
      return (
        <div className="px-4 pb-4 pt-0 md:hidden">
          <div className="flex items-center justify-between gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-red-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="font-medium">Payment link expired</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefreshCheckout}
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

    return (
      <div className="px-4 pb-4 pt-0 md:hidden">
        <Button
          size="sm"
          onClick={handlePayNow}
          disabled={isCreating}
          className="w-full h-9 bg-[#1d43d8] hover:bg-[#1d43d8]/90 text-white text-xs font-semibold rounded-lg shadow-sm"
        >
          <CreditCard className={`h-3.5 w-3.5 mr-1.5 ${isCreating ? 'animate-pulse' : ''}`} />
          {isCreating ? 'Creating link...' : 'Complete Payment'}
        </Button>
      </div>
    );
  }

  // Full mode for order detail page
  if (isExpired) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-700">Payment link expired</p>
          <p className="text-xs text-red-600/80">Click refresh to get a new payment link.</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefreshCheckout}
          disabled={isRefreshing}
          className="shrink-0 border-red-200 text-red-600 hover:bg-red-100"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-[#1d43d8]/5 border border-[#1d43d8]/10 rounded-xl">
      <CreditCard className="h-5 w-5 text-[#1d43d8] shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-[#1d43d8]">Complete your payment</p>
        <p className="text-xs text-slate-500">Pay securely with e-wallets, cards, or bank transfer</p>
      </div>
      <Button size="sm" onClick={handlePayNow} disabled={isCreating} className="shrink-0 bg-[#1d43d8] hover:bg-[#1d43d8]/90">
        <CreditCard className={`h-4 w-4 mr-2 ${isCreating ? 'animate-pulse' : ''}`} />
        {isCreating ? 'Creating...' : 'Pay Now'}
      </Button>
    </div>
  );
}
