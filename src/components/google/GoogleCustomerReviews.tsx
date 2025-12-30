'use client';

import { useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';

// Google Customer Reviews merchant ID
const MERCHANT_ID = 5571823070;

interface GoogleCustomerReviewsProps {
  orderId: string;
  email: string;
  estimatedDeliveryDate?: number; // Unix timestamp in milliseconds
  orderDate?: number; // Unix timestamp in milliseconds for fallback calculation
}

// Global flag to track opt-in survey rendering per order
declare global {
  interface Window {
    __googleOptInRendered?: Set<string>;
  }
}

/**
 * Google Customer Reviews opt-in survey component.
 * Displays after a successful order to invite customers to leave a review.
 *
 * @see https://support.google.com/merchants/answer/7124319
 */
export function GoogleCustomerReviews({ orderId, email, estimatedDeliveryDate, orderDate }: GoogleCustomerReviewsProps) {
  const hasRendered = useRef(false);

  // Calculate estimated delivery date in YYYY-MM-DD format
  const getEstimatedDeliveryDate = useCallback((): string => {
    if (estimatedDeliveryDate) {
      return new Date(estimatedDeliveryDate).toISOString().split('T')[0];
    }

    // Default: 14 days from order date or now
    const baseDate = orderDate ? new Date(orderDate) : new Date();
    baseDate.setDate(baseDate.getDate() + 14);
    return baseDate.toISOString().split('T')[0];
  }, [estimatedDeliveryDate, orderDate]);

  useEffect(() => {
    // Initialize global set if it doesn't exist
    if (!window.__googleOptInRendered) {
      window.__googleOptInRendered = new Set();
    }

    // Check if this order has already been rendered globally
    if (window.__googleOptInRendered.has(orderId)) {
      return;
    }

    // Expose the renderOptIn function globally for the script callback
    (window as unknown as { renderOptIn?: () => void }).renderOptIn = () => {
      if (hasRendered.current || window.__googleOptInRendered?.has(orderId)) {
        return;
      }

      const gapi = (
        window as unknown as { gapi?: { load: (module: string, callback: () => void) => void; surveyoptin?: { render: (config: object) => void } } }
      ).gapi;

      if (!gapi) {
        console.warn('Google API not loaded');
        return;
      }

      gapi.load('surveyoptin', () => {
        if (gapi.surveyoptin && !hasRendered.current && !window.__googleOptInRendered?.has(orderId)) {
          try {
            hasRendered.current = true;
            window.__googleOptInRendered?.add(orderId);
            gapi.surveyoptin.render({
              merchant_id: MERCHANT_ID,
              order_id: orderId,
              email: email,
              delivery_country: 'PH',
              estimated_delivery_date: getEstimatedDeliveryDate(),
            });
          } catch (error) {
            // If render fails, reset flags to allow retry
            hasRendered.current = false;
            window.__googleOptInRendered?.delete(orderId);
            console.error('Failed to render Google Customer Reviews opt-in:', error);
          }
        }
      });
    };

    // If script already loaded, try to render
    const gapi = (window as unknown as { gapi?: object }).gapi;
    if (gapi) {
      (window as unknown as { renderOptIn?: () => void }).renderOptIn?.();
    }

    return () => {
      // Don't delete renderOptIn as it may be needed by other instances
      // Only cleanup if this is the last order being tracked
      // The cleanup will happen naturally when the component unmounts
    };
  }, [orderId, email, getEstimatedDeliveryDate]);

  return <Script src="https://apis.google.com/js/platform.js?onload=renderOptIn" strategy="afterInteractive" />;
}
