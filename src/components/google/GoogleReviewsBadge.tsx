'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

// Google Customer Reviews merchant ID
const MERCHANT_ID = 5571823070;

type BadgePosition = 'BOTTOM_RIGHT' | 'BOTTOM_LEFT' | 'INLINE';

interface GoogleReviewsBadgeProps {
  position?: BadgePosition;
}

/**
 * Google Customer Reviews badge component.
 * Displays seller rating and participation in the Google Customer Reviews program.
 *
 * @see https://support.google.com/merchants/answer/7105655
 */
export function GoogleReviewsBadge({ position = 'BOTTOM_RIGHT' }: GoogleReviewsBadgeProps) {
  const hasInitialized = useRef(false);

  useEffect(() => {
    const script = document.getElementById('merchantWidgetScript');

    const initializeBadge = () => {
      if (hasInitialized.current) return;

      const merchantwidget = (
        window as unknown as {
          merchantwidget?: {
            start: (config: { merchant_id: number; position: BadgePosition }) => void;
          };
        }
      ).merchantwidget;

      if (merchantwidget) {
        hasInitialized.current = true;
        merchantwidget.start({
          merchant_id: MERCHANT_ID,
          position: position,
        });
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
