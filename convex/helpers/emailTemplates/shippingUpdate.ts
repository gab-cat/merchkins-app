/**
 * Shipping Update Email Template
 * Merchkins brand design - Keep customers informed with brand styling
 */

import { EMAIL_ASSETS, EMAIL_COLORS, EMAIL_SPACING, EMAIL_FONTS, EMAIL_FONT_SIZES, EMAIL_RADIUS } from './constants';
import {
  createEmailWrapper,
  createEmailHeader,
  createEmailBody,
  createEmailFooter,
  createParagraph,
  createCard,
  createCenteredButton,
  createDetailRow,
  createHighlightBox,
  formatDate,
  EmailStatusType,
} from './builders';

export type ShippingStatus = 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'READY_FOR_PICKUP';

export interface ShippingUpdateData {
  customerFirstName: string;
  orderNumber: string;
  status: ShippingStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  carrierName?: string;
  deliveryAddress?: string;
  estimatedDelivery?: string;
  deliveredAt?: number;
  pickupLocation?: string;
}

/**
 * Get status-specific content with premium styling
 */
const getStatusContent = (
  status: ShippingStatus
): { title: string; subtitle: string; statusType: EmailStatusType; message: string; emoji: string } => {
  switch (status) {
    case 'SHIPPED':
      return {
        title: 'Your Order Has Shipped',
        subtitle: 'On its way to you',
        statusType: 'primary',
        message: 'Your order is on its way! Track your package using the details below.',
        emoji: '📦',
      };
    case 'OUT_FOR_DELIVERY':
      return {
        title: 'Out for Delivery',
        subtitle: 'Arriving today',
        statusType: 'warning',
        message: 'Your order is out for delivery and should arrive today. Keep an eye out!',
        emoji: '🚚',
      };
    case 'DELIVERED':
      return {
        title: 'Delivered',
        subtitle: 'Package arrived',
        statusType: 'success',
        message: 'Your order has been delivered! We hope you love it.',
        emoji: '✅',
      };
    case 'READY_FOR_PICKUP':
      return {
        title: 'Ready for Pickup',
        subtitle: 'Your order awaits',
        statusType: 'primary',
        message: 'Your order is ready! Pick it up at your earliest convenience.',
        emoji: '🏪',
      };
  }
};

/**
 * Create tracking progress indicator - Premium timeline design
 */
const createTrackingProgress = (status: ShippingStatus): string => {
  const steps = [
    { label: 'Ordered', completed: true, icon: '📋' },
    { label: 'Shipped', completed: status !== 'READY_FOR_PICKUP', icon: '📦' },
    {
      label: status === 'READY_FOR_PICKUP' ? 'Ready' : 'In Transit',
      completed: status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED' || status === 'READY_FOR_PICKUP',
      icon: status === 'READY_FOR_PICKUP' ? '🏪' : '🚚',
    },
    { label: 'Delivered', completed: status === 'DELIVERED', icon: '✅' },
  ];

  const stepsHtml = steps
    .map((step, _index) => {
      const isActive = step.completed;
      const dotColor = isActive ? EMAIL_COLORS.primary : EMAIL_COLORS.surfaceElevated;
      const textColor = isActive ? EMAIL_COLORS.textPrimary : EMAIL_COLORS.textMuted;
      const borderColor = isActive ? EMAIL_COLORS.primary : EMAIL_COLORS.border;

      return `
      <td style="text-align: center; width: 25%;">
        <div style="width: 36px; height: 36px; border-radius: ${EMAIL_RADIUS.full}; background-color: ${dotColor}; margin: 0 auto 8px; display: inline-block; line-height: 36px; border: 2px solid ${borderColor}; font-size: 16px;">
          ${isActive ? step.icon : ''}
        </div>
        <p style="margin: 0; font-size: ${EMAIL_FONT_SIZES.xs}; color: ${textColor}; font-weight: ${isActive ? '600' : '400'}; letter-spacing: 0.3px;">${step.label}</p>
      </td>`;
    })
    .join('');

  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: ${EMAIL_SPACING.lg} 0; background-color: ${EMAIL_COLORS.surfaceElevated}; border-radius: ${EMAIL_RADIUS.md}; padding: ${EMAIL_SPACING.lg}; border: 1px solid ${EMAIL_COLORS.borderAccent};">
    <tr>
      <td style="padding: ${EMAIL_SPACING.md};">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            ${stepsHtml}
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
};

/**
 * Generate the shipping update email HTML - Premium dark mode
 */
export const generateShippingUpdateEmail = (data: ShippingUpdateData): { subject: string; html: string } => {
  const statusContent = getStatusContent(data.status);
  const subject = `${statusContent.emoji} ${statusContent.title} - Order #${data.orderNumber}`;

  const trackingDetailsContent = `
    ${createDetailRow('Order', `<span style="font-family: ${EMAIL_FONTS.mono}; color: ${EMAIL_COLORS.primary}; font-weight: 600;">#${data.orderNumber}</span>`)}
    ${data.trackingNumber ? createDetailRow('Tracking', `<span style="font-family: ${EMAIL_FONTS.mono};">${data.trackingNumber}</span>`) : ''}
    ${data.carrierName ? createDetailRow('Carrier', data.carrierName) : ''}
    ${data.estimatedDelivery ? createDetailRow('Est. Delivery', data.estimatedDelivery) : ''}
    ${data.deliveredAt ? createDetailRow('Delivered', formatDate(data.deliveredAt)) : ''}
    ${data.pickupLocation ? createDetailRow('Pickup At', data.pickupLocation) : ''}
  `;

  const bodyContent = `
    <p style="margin: 0 0 ${EMAIL_SPACING.md}; color: ${EMAIL_COLORS.textPrimary}; font-size: ${EMAIL_FONT_SIZES.lg}; font-weight: 500;">
      Hey ${data.customerFirstName}! ${statusContent.emoji}
    </p>
    
    ${createParagraph(statusContent.message)}
    
    ${createTrackingProgress(data.status)}
    
    ${createCard({
      title: 'Tracking Info',
      content: trackingDetailsContent,
      statusType: statusContent.statusType,
      showBorder: true,
    })}
    
    ${
      data.deliveryAddress
        ? createCard({
            title: 'Shipping To',
            content: `<p style="margin: 0; color: ${EMAIL_COLORS.textSecondary};">${data.deliveryAddress}</p>`,
            statusType: 'neutral',
            showBorder: false,
          })
        : ''
    }
    
    ${
      data.trackingUrl
        ? createCenteredButton({
            text: 'Track Package',
            url: data.trackingUrl,
            variant: 'primary',
          })
        : createCenteredButton({
            text: 'View Order',
            url: `${EMAIL_ASSETS.appUrl}/orders`,
            variant: 'primary',
          })
    }
    
    ${data.status === 'DELIVERED' ? createHighlightBox('⭐ Love your purchase? Leave a review and help other shoppers!', 'success') : ''}
  `;

  const html = createEmailWrapper(
    `
    ${createEmailHeader({
      title: statusContent.title,
      subtitle: statusContent.subtitle,
      statusType: statusContent.statusType,
      showLogo: true,
    })}
    ${createEmailBody(bodyContent)}
    ${createEmailFooter({ showSupportEmail: true })}
    `,
    subject
  );

  return { subject, html };
};
