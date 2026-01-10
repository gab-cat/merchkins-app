/**
 * Refund Approved Email Template
 * Merchkins brand design - Celebrate the resolution with brand styling
 */

import { EMAIL_ASSETS, EMAIL_COLORS, EMAIL_SPACING, EMAIL_FONTS, EMAIL_FONT_SIZES } from './constants';
import {
  createEmailWrapper,
  createEmailHeader,
  createEmailBody,
  createEmailFooter,
  createParagraph,
  createCard,
  createCenteredButton,
  createVoucherCode,
  createOrderedList,
  createHighlightBox,
  createSectionTitle,
  formatCurrency,
} from './builders';

export interface RefundApprovedData {
  customerFirstName: string;
  orderNumber: string;
  refundAmount: number;
  voucherCode: string;
  adminMessage?: string;
}

/**
 * Generate the refund approved email HTML - Premium dark mode
 */
export const generateRefundApprovedEmail = (data: RefundApprovedData): { subject: string; html: string } => {
  const subject = `Refund Approved ✓ Order #${data.orderNumber}`;

  const howToUseSteps = [
    'Add items to your cart from any store',
    `Enter your voucher code at checkout: <strong style="font-family: ${EMAIL_FONTS.mono}; color: ${EMAIL_COLORS.success};">${data.voucherCode}</strong>`,
    'The voucher value will be applied automatically',
    'Pay the difference if your order exceeds the voucher amount',
  ];

  const bodyContent = `
    <p style="margin: 0 0 ${EMAIL_SPACING.md}; color: ${EMAIL_COLORS.textPrimary}; font-size: ${EMAIL_FONT_SIZES.lg}; font-weight: 500;">
      Hey ${data.customerFirstName}! 🎉
    </p>
    
    ${createParagraph(`Good news — your refund request for order <strong style="color: ${EMAIL_COLORS.primary}; font-weight: 600;">#${data.orderNumber}</strong> has been approved!`)}
    
    ${createParagraph("We've issued a voucher for the refund amount that you can use on your next purchase:")}
    
    ${createVoucherCode(data.voucherCode, formatCurrency(data.refundAmount))}
    
    ${createSectionTitle('How to Use')}
    ${createOrderedList(howToUseSteps)}
    
    ${createHighlightBox('💡 <strong>Good to know:</strong> This voucher never expires and works at any store on Merchkins!', 'success')}
    
    ${
      data.adminMessage
        ? createCard({
            title: 'Message from Support',
            content: `<p style="margin: 0; color: ${EMAIL_COLORS.textSecondary};">${data.adminMessage}</p>`,
            statusType: 'primary',
            showBorder: true,
          })
        : ''
    }
    
    ${createCenteredButton({
      text: 'Shop Now',
      url: `${EMAIL_ASSETS.appUrl}`,
      variant: 'success',
    })}
    
    ${createParagraph('Thanks for your patience — we appreciate you!', { muted: true, centered: true })}
  `;

  const html = createEmailWrapper(
    `
    ${createEmailHeader({
      title: 'Refund Approved',
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
