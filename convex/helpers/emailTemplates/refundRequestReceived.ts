/**
 * Refund Request Received Email Template
 * Premium dark mode design - For organization admins
 */

import { EMAIL_ASSETS, EMAIL_COLORS, EMAIL_SPACING, EMAIL_FONT_SIZES } from './constants';
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
  formatCurrency,
  formatDate,
} from './builders';

export interface RefundRequestReceivedData {
  orderNumber: string;
  orderDate: number;
  refundAmount: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  reason?: string;
  customerMessage?: string;
}

// Refund reason labels for display
const REFUND_REASON_LABELS: Record<string, string> = {
  WRONG_SIZE: 'Wrong Size',
  WRONG_ITEM: 'Wrong Item Received',
  WRONG_PAYMENT: 'Wrong Payment Method',
  DEFECTIVE_ITEM: 'Defective/Damaged Item',
  NOT_AS_DESCRIBED: 'Item Not as Described',
  CHANGED_MIND: 'Changed My Mind',
  DUPLICATE_ORDER: 'Duplicate Order',
  DELIVERY_ISSUE: 'Delivery Issue',
  OTHER: 'Other',
};

/**
 * Generate the refund request received email HTML - Premium dark mode
 */
export const generateRefundRequestReceivedEmail = (data: RefundRequestReceivedData): { subject: string; html: string } => {
  const subject = `🔔 Refund Request - Order #${data.orderNumber}`;

  const orderDetailsContent = `
    ${createDetailRow('Order', `<span style="color: ${EMAIL_COLORS.accent};">#${data.orderNumber}</span>`)}
    ${createDetailRow('Date', formatDate(data.orderDate))}
    ${createDetailRow('Amount', `<span style="color: ${EMAIL_COLORS.warning};">${formatCurrency(data.refundAmount)}</span>`)}
    ${createDetailRow('Customer', `${data.customerFirstName} ${data.customerLastName}`)}
    ${createDetailRow('Email', `<a href="mailto:${data.customerEmail}" style="color: ${EMAIL_COLORS.accent}; text-decoration: none;">${data.customerEmail}</a>`)}
    ${createDetailRow('Reason', `<span style="color: ${EMAIL_COLORS.warning};">${data.reason ? REFUND_REASON_LABELS[data.reason] || data.reason : 'Other'}</span>`)}
  `;

  // Build customer message section only if there's a message
  const customerMessageSection = data.customerMessage
    ? createCard({
        title: 'Additional Details',
        content: `<p style="margin: 0; font-style: italic; color: ${EMAIL_COLORS.textSecondary};">"${data.customerMessage}"</p>`,
        statusType: 'neutral',
        showBorder: false,
      })
    : '';

  const bodyContent = `
    <p style="margin: 0 0 ${EMAIL_SPACING.md}; color: ${EMAIL_COLORS.textPrimary}; font-size: ${EMAIL_FONT_SIZES.lg}; font-weight: 500;">
      New Refund Request 📋
    </p>
    
    ${createParagraph('A customer has submitted a refund request. Please review and respond promptly.')}
    
    ${createCard({
      title: 'Request Details',
      content: orderDetailsContent,
      statusType: 'warning',
      showBorder: true,
    })}
    
    ${customerMessageSection}
    
    ${createHighlightBox('⏰ <strong>Action Required:</strong> Please review this request and respond within 48 hours.', 'warning')}
    
    ${createCenteredButton({
      text: 'Review Request',
      url: `${EMAIL_ASSETS.appUrl}/admin/refunds`,
      variant: 'primary',
    })}
  `;

  const html = createEmailWrapper(
    `
    ${createEmailHeader({
      title: 'Refund Request',
      subtitle: `Order #${data.orderNumber}`,
      statusType: 'warning',
      showLogo: true,
    })}
    ${createEmailBody(bodyContent)}
    ${createEmailFooter({ showSupportEmail: false })}
    `,
    subject
  );

  return { subject, html };
};
