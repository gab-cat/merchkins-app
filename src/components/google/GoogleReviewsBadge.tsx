'use client';

import { useEffect } from 'react';
import Script from 'next/script';

// Google Customer Reviews merchant ID
const MERCHANT_ID = 5571823070;

type BadgePosition = 'BOTTOM_RIGHT' | 'BOTTOM_LEFT' | 'INLINE';

interface GoogleReviewsBadgeProps {
  position?: BadgePosition;
}

// Global flag to track widget initialization across component remounts
declare global {
  interface Window {
    __googleMerchantWidgetInitialized?: boolean;
  }
}

/**
 * Check if the Google Merchant Widget iframe already exists in the DOM
 */
const isWidgetAlreadyRendered = (): boolean => {
  // Check for the widget iframe container
  const widgetContainer = document.querySelector('[id*="merchant-widget"]') || document.querySelector('iframe[src*="merchantwidget"]');
  return widgetContainer !== null;
};

/**
 * Google Customer Reviews badge component.
 * Displays seller rating and participation in the Google Customer Reviews program.
 *
 * @see https://support.google.com/merchants/answer/7105655
 */
export function GoogleReviewsBadge({ position = 'BOTTOM_RIGHT' }: GoogleReviewsBadgeProps) {
  useEffect(() => {
    const script = document.getElementById('merchantWidgetScript');

    const initializeBadge = () => {
      // Check global flag to prevent multiple initializations across navigations
      if (window.__googleMerchantWidgetInitialized) {
        return;
      }

      // Check if widget iframe already exists in DOM
      if (isWidgetAlreadyRendered()) {
        window.__googleMerchantWidgetInitialized = true;
        return;
      }

      const merchantwidget = (
        window as unknown as {
          merchantwidget?: {
            start: (config: { merchant_id: number; position: BadgePosition }) => void;
          };
        }
      ).merchantwidget;

      if (merchantwidget) {
        try {
          merchantwidget.start({
            merchant_id: MERCHANT_ID,
            position: position,
          });
          window.__googleMerchantWidgetInitialized = true;
        } catch (error) {
          // If widget already exists, mark as initialized to prevent retries
          if (error instanceof Error && error.message.includes('already exists')) {
            window.__googleMerchantWidgetInitialized = true;
          } else {
            console.error('Failed to initialize Google Merchant Widget:', error);
          }
        }
      }
    };

    if (script) {
      script.addEventListener('load', initializeBadge);
      // Check if already loaded
      if ((window as unknown as { merchantwidget?: object }).merchantwidget) {
        initializeBadge();
      }
    }

    return () => {
      if (script) {
        script.removeEventListener('load', initializeBadge);
      }
    };
  }, [position]);

  return <Script id="merchantWidgetScript" src="https://www.gstatic.com/shopping/merchant/merchantwidget.js" strategy="afterInteractive" />;
}
