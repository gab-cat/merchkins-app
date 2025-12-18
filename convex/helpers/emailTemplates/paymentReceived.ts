/**
 * Payment Received Email Template
 * Clean light mode design - Confirms payment and order status update to Processing
 */

import { EMAIL_ASSETS, EMAIL_COLORS, EMAIL_SPACING, EMAIL_RADIUS, EMAIL_FONT_SIZES, EMAIL_FONTS } from './constants';
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
  createHighlightBox,
  formatCurrency,
  formatDate,
} from './builders';

export interface PaymentReceivedItem {
  name: string;
  variant?: string;
  quantity: number;
  price: number;
}

export interface PaymentReceivedData {
  customerFirstName: string;
  orderNumber: string;
  orderDate: number;
  organizationName: string;
  items: PaymentReceivedItem[];
  subtotal: number;
  discount?: number;
  total: number;
  paymentAmount: number;
  transactionId: string;
  paymentMethod?: string;
}

/**
 * Generate the payment received email HTML
 */
export const generatePaymentReceivedEmail = (data: PaymentReceivedData): { subject: string; html: string } => {
  const subject = `Payment Received - Order #${data.orderNumber} ✓`;

  // Build items list HTML
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
          <td colspan="2" style="padding-top: 16px; text-align: right; font-weight: 700; font-size: ${EMAIL_FONT_SIZES.base}; color: ${EMAIL_COLORS.textPrimary};">Total Paid</td>
          <td style="padding-top: 16px; text-align: right; font-weight: 700; font-size: ${EMAIL_FONT_SIZES.lg}; color: ${EMAIL_COLORS.success}; font-family: ${EMAIL_FONTS.mono};">${formatCurrency(data.paymentAmount)}</td>
        </tr>
      </tfoot>
    </table>
  `;

  const paymentDetailsContent = `
    ${createDetailRow('Order Number', `<span style="font-family: ${EMAIL_FONTS.mono}; color: ${EMAIL_COLORS.accent};">#${data.orderNumber}</span>`)}
    ${createDetailRow('Payment Date', formatDate(Date.now()))}
    ${createDetailRow('Amount Paid', `<span style="font-weight: 600; color: ${EMAIL_COLORS.success};">${formatCurrency(data.paymentAmount)}</span>`)}
    ${createDetailRow('Transaction ID', `<span style="font-family: ${EMAIL_FONTS.mono}; font-size: ${EMAIL_FONT_SIZES.xs};">${data.transactionId}</span>`)}
    ${createDetailRow('Store', data.organizationName)}
  `;

  const bodyContent = `
    <!-- Success message -->
    <p style="margin: 0 0 ${EMAIL_SPACING.md}; color: ${EMAIL_COLORS.textPrimary}; font-size: ${EMAIL_FONT_SIZES.lg}; font-weight: 500;">
      Hey ${data.customerFirstName}! 💳
    </p>
    
    ${createParagraph("Great news! We've received your payment and your order is now being processed.")}
    
    ${createHighlightBox("✅ Your order status has been updated to <strong>Processing</strong>. We'll notify you when it's ready for pickup or delivery.", 'success')}
    
    ${createCard({
      title: 'Payment Details',
      content: paymentDetailsContent,
      statusType: 'success',
      showBorder: true,
    })}
    
    ${createSectionTitle('Order Summary')}
    
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: ${EMAIL_SPACING.lg}; background-color: ${EMAIL_COLORS.surfaceElevated}; border: 1px solid ${EMAIL_COLORS.border}; border-radius: ${EMAIL_RADIUS.md};">
      <tr>
        <td style="padding: ${EMAIL_SPACING.md};">
          ${orderSummaryContent}
        </td>
      </tr>
    </table>
    
    ${createDivider()}
    
    ${createParagraph("Thank you for your purchase! We'll keep you updated on your order status.", { muted: true })}
    
    ${createCenteredButton({
      text: 'Track Your Order',
      url: `${EMAIL_ASSETS.appUrl}/orders`,
      variant: 'primary',
    })}
  `;

  const html = createEmailWrapper(
    `
    ${createEmailHeader({
      title: 'Payment Received',
      subtitle: `Order #${data.orderNumber}`,
      statusType: 'success',
      showLogo: true,
    })}
    ${createEmailBody(bodyContent)}
    ${createEmailFooter({ showSupportEmail: true })}
    `,
    subject
  );

  return { subject, html };
};
