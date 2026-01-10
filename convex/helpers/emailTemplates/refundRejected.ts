/**
 * Refund Rejected Email Template
 * Merchkins brand design - Handle with care using brand styling
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

export interface RefundRejectedData {
  customerFirstName: string;
  orderNumber: string;
  orderDate: number;
  refundAmount: number;
  adminMessage?: string;
}

/**
 * Generate the refund rejected email HTML - Premium dark mode
 */
export const generateRefundRejectedEmail = (data: RefundRejectedData): { subject: string; html: string } => {
  const subject = `Update on Your Refund Request - Order #${data.orderNumber}`;

  const orderDetailsContent = `
    ${createDetailRow('Order', `<span style="color: ${EMAIL_COLORS.primary}; font-weight: 600;">#${data.orderNumber}</span>`)}
    ${createDetailRow('Date', formatDate(data.orderDate))}
    ${createDetailRow('Requested', formatCurrency(data.refundAmount))}
  `;

  const bodyContent = `
    <p style="margin: 0 0 ${EMAIL_SPACING.md}; color: ${EMAIL_COLORS.textPrimary}; font-size: ${EMAIL_FONT_SIZES.lg}; font-weight: 500;">
      Hey ${data.customerFirstName},
    </p>
    
    ${createParagraph("We've reviewed your refund request and unfortunately, we weren't able to approve it this time.")}
    
    ${createCard({
      title: 'Request Details',
      content: orderDetailsContent,
      statusType: 'error',
      showBorder: true,
    })}
    
    ${
      data.adminMessage
        ? createCard({
            title: 'Why We Made This Decision',
            content: `<p style="margin: 0; color: ${EMAIL_COLORS.textSecondary};">${data.adminMessage}</p>`,
            statusType: 'error',
            showBorder: true,
          })
        : ''
    }
    
    ${createHighlightBox(
      '💬 <strong>Disagree?</strong> If you have additional information or believe this was made in error, reach out to our support team.',
      'primary'
    )}
    
    ${createCenteredButton({
      text: 'View My Orders',
      url: `${EMAIL_ASSETS.appUrl}/orders`,
      variant: 'primary',
    })}
    
    ${createParagraph('We appreciate your understanding.', { muted: true, centered: true })}
  `;

  const html = createEmailWrapper(
    `
    ${createEmailHeader({
      title: 'Refund Update',
      subtitle: `Order #${data.orderNumber}`,
      statusType: 'error',
      showLogo: true,
    })}
    ${createEmailBody(bodyContent)}
    ${createEmailFooter({ showSupportEmail: true })}
    `,
    subject
  );

  return { subject, html };
};
