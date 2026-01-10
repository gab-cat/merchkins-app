/**
 * Order Confirmation Email Template
 * Merchkins brand design - Celebrate the purchase with brand gradients and neon accents
 */

import { EMAIL_ASSETS, EMAIL_COLORS, EMAIL_SPACING, EMAIL_RADIUS, EMAIL_FONT_SIZES, EMAIL_FONTS, EMAIL_GRADIENTS, EMAIL_SHADOWS } from './constants';
import {
  createEmailWrapper,
  createEmailHeader,
  createEmailBody,
  createEmailFooter,
  createParagraph,
  createCard,
  createCenteredButton,
  createDetailRow,
  createDivider,
  createSectionTitle,
  formatCurrency,
  formatDate,
} from './builders';

export interface OrderItem {
  name: string;
  variant?: string;
  quantity: number;
  price: number;
}

export interface OrderConfirmationData {
  customerFirstName: string;
  orderNumber: string;
  orderDate: number;
  organizationName: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee?: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  deliveryAddress?: string;
  estimatedDelivery?: string;
  paymentUrl?: string;
}

/**
 * Generate the order confirmation email HTML - Premium dark mode
 */
export const generateOrderConfirmationEmail = (data: OrderConfirmationData): { subject: string; html: string } => {
  const subject = `Order Placed #${data.orderNumber}`;

  // Build items list HTML with premium styling
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 14px 0; border-bottom: 1px solid ${EMAIL_COLORS.border};">
        <p style="margin: 0 0 3px; font-weight: 600; color: ${EMAIL_COLORS.textPrimary}; font-size: ${EMAIL_FONT_SIZES.sm};">${item.name}</p>
        ${item.variant ? `<p style="margin: 0; font-size: ${EMAIL_FONT_SIZES.xs}; color: ${EMAIL_COLORS.textMuted};">${item.variant}</p>` : ''}
      </td>
      <td style="padding: 14px 0; border-bottom: 1px solid ${EMAIL_COLORS.border}; text-align: center; color: ${EMAIL_COLORS.textMuted}; font-size: ${EMAIL_FONT_SIZES.sm};">
        ×${item.quantity}
      </td>
      <td style="padding: 14px 0; border-bottom: 1px solid ${EMAIL_COLORS.border}; text-align: right; font-weight: 600; color: ${EMAIL_COLORS.textPrimary}; font-family: ${EMAIL_FONTS.mono}; font-size: ${EMAIL_FONT_SIZES.sm};">
        ${formatCurrency(item.price * item.quantity)}
      </td>
    </tr>`
    )
    .join('');

  const orderSummaryContent = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <thead>
        <tr>
          <th style="text-align: left; padding-bottom: 12px; color: ${EMAIL_COLORS.textMuted}; font-size: ${EMAIL_FONT_SIZES.xs}; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">Item</th>
          <th style="text-align: center; padding-bottom: 12px; color: ${EMAIL_COLORS.textMuted}; font-size: ${EMAIL_FONT_SIZES.xs}; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">Qty</th>
          <th style="text-align: right; padding-bottom: 12px; color: ${EMAIL_COLORS.textMuted}; font-size: ${EMAIL_FONT_SIZES.xs}; text-transform: uppercase; letter-spacing: 1px; font-weight: 500;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding-top: 14px; text-align: right; color: ${EMAIL_COLORS.textMuted}; font-size: ${EMAIL_FONT_SIZES.sm};">Subtotal</td>
          <td style="padding-top: 14px; text-align: right; color: ${EMAIL_COLORS.textSecondary}; font-family: ${EMAIL_FONTS.mono}; font-size: ${EMAIL_FONT_SIZES.sm};">${formatCurrency(data.subtotal)}</td>
        </tr>
        ${
          data.shippingFee !== undefined
            ? `
        <tr>
          <td colspan="2" style="padding-top: 6px; text-align: right; color: ${EMAIL_COLORS.textMuted}; font-size: ${EMAIL_FONT_SIZES.sm};">Shipping</td>
          <td style="padding-top: 6px; text-align: right; color: ${EMAIL_COLORS.textSecondary}; font-family: ${EMAIL_FONTS.mono}; font-size: ${EMAIL_FONT_SIZES.sm};">${data.shippingFee === 0 ? '<span style="color: ' + EMAIL_COLORS.success + ';">Free</span>' : formatCurrency(data.shippingFee)}</td>
        </tr>
        `
            : ''
        }
        ${
          data.discount
            ? `
        <tr>
          <td colspan="2" style="padding-top: 6px; text-align: right; color: ${EMAIL_COLORS.success}; font-size: ${EMAIL_FONT_SIZES.sm};">Discount</td>
          <td style="padding-top: 6px; text-align: right; color: ${EMAIL_COLORS.success}; font-family: ${EMAIL_FONTS.mono}; font-size: ${EMAIL_FONT_SIZES.sm};">-${formatCurrency(data.discount)}</td>
        </tr>
        `
            : ''
        }
        <tr>
          <td colspan="2" style="padding-top: 16px; text-align: right; font-weight: 700; font-size: ${EMAIL_FONT_SIZES.base}; color: ${EMAIL_COLORS.textPrimary};">Total</td>
          <td style="padding-top: 16px; text-align: right; font-weight: 700; font-size: ${EMAIL_FONT_SIZES.lg}; font-family: ${EMAIL_FONTS.mono};">
            <!--[if !mso]><!-->
            <span style="color: ${EMAIL_COLORS.neon}; text-shadow: ${EMAIL_SHADOWS.neonGlow};">${formatCurrency(data.total)}</span>
            <!--<![endif]-->
            <!--[if mso]>
            <span style="color: ${EMAIL_COLORS.primary};">${formatCurrency(data.total)}</span>
            <![endif]-->
          </td>
        </tr>
      </tfoot>
    </table>
  `;

  const orderDetailsContent = `
    ${createDetailRow('Order Number', `<span style="font-family: ${EMAIL_FONTS.mono}; color: ${EMAIL_COLORS.primary}; font-weight: 600;">#${data.orderNumber}</span>`)}
    ${createDetailRow('Order Date', formatDate(data.orderDate))}
    ${createDetailRow('Store', data.organizationName)}
    ${createDetailRow('Payment Status', '<span style="color: ' + EMAIL_COLORS.warning + ';">Pending</span>')}
    ${createDetailRow('Payment Method', data.paymentMethod)}
    ${data.estimatedDelivery ? createDetailRow('Est. Delivery', data.estimatedDelivery) : ''}
  `;

  const bodyContent = `
    <!-- Success message -->
    <p style="margin: 0 0 ${EMAIL_SPACING.md}; color: ${EMAIL_COLORS.textPrimary}; font-size: ${EMAIL_FONT_SIZES.lg}; font-weight: 500;">
      Hey ${data.customerFirstName}! 🎉
    </p>
    
    ${createParagraph("Your order has been placed! Complete your payment to confirm your order. Here's what you ordered:")}
    
    ${createCard({
      title: 'Order Details',
      content: orderDetailsContent,
      statusType: 'primary',
      showBorder: true,
    })}
    
    ${createSectionTitle('Items')}
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: ${EMAIL_SPACING.lg}; background: ${EMAIL_GRADIENTS.cardAccent}; border: 1px solid ${EMAIL_COLORS.borderAccent}; border-radius: ${EMAIL_RADIUS.md};">
      <tr>
        <td style="padding: ${EMAIL_SPACING.md};">
          ${orderSummaryContent}
        </td>
      </tr>
    </table>
    
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
    
    ${createDivider()}
    
    <!-- Payment CTA Section -->
    ${
      data.paymentUrl
        ? createCenteredButton({
            text: 'Pay Now',
            url: data.paymentUrl,
            variant: 'primary',
          })
        : ''
    }
    
    <!-- Warning about 24-hour cancellation -->
    ${createCard({
      title: '⚠️ Important',
      content: `<p style="margin: 0; color: ${EMAIL_COLORS.textPrimary}; font-weight: 500;">Your order will be automatically cancelled in 24 hours if payment is not completed.</p>`,
      statusType: 'warning',
      showBorder: true,
    })}
    
    ${createDivider()}
    
    ${createParagraph("Complete your payment to secure your order. We'll send you tracking details once your order ships.", { muted: true })}
    
    ${createCenteredButton({
      text: 'View Order',
      url: `${EMAIL_ASSETS.appUrl}/orders`,
      variant: 'neutral',
    })}
  `;

  const html = createEmailWrapper(
    `
    ${createEmailHeader({
      title: 'Order Placed',
      subtitle: `Order #${data.orderNumber}`,
      statusType: 'primary',
      showLogo: true,
    })}
    ${createEmailBody(bodyContent)}
    ${createEmailFooter({ showSupportEmail: true })}
    `,
    subject
  );

  return { subject, html };
};
