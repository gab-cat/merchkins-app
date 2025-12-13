/**
 * Payment Confirmation Email Template
 * Premium dark mode design - Celebrate the payout
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
  createDetailRow,
  createAmountDisplay,
  createHighlightBox,
  formatCurrency,
  formatDate,
} from './builders';

export interface PaymentConfirmationData {
  organizationName: string;
  invoiceNumber: string;
  netAmount: number;
  paidAt: number;
  paymentReference?: string;
  paymentNotes?: string;
}

/**
 * Generate the payment confirmation email HTML - Premium dark mode
 */
export const generatePaymentConfirmationEmail = (data: PaymentConfirmationData): { subject: string; html: string } => {
  const subject = `Payment Sent - ${formatCurrency(data.netAmount)} 💰`;

  const paymentDetailsContent = `
    ${createDetailRow('Invoice', `<span style="font-family: ${EMAIL_FONTS.mono};">${data.invoiceNumber}</span>`)}
    ${createDetailRow('Processed', formatDate(data.paidAt))}
    ${data.paymentReference ? createDetailRow('Reference', `<span style="font-family: ${EMAIL_FONTS.mono};">${data.paymentReference}</span>`) : ''}
  `;

  const bodyContent = `
    <p style="margin: 0 0 ${EMAIL_SPACING.md}; color: ${EMAIL_COLORS.textPrimary}; font-size: ${EMAIL_FONT_SIZES.lg}; font-weight: 500;">
      Hey ${data.organizationName} Team! 💸
    </p>
    
    ${createParagraph(`Great news — your payout for invoice <strong style="color: ${EMAIL_COLORS.accent};">${data.invoiceNumber}</strong> has been processed.`)}
    
    ${createAmountDisplay('Payout Amount', formatCurrency(data.netAmount), 'success')}
    
    ${createCard({
      title: 'Payment Details',
      content: paymentDetailsContent,
      statusType: 'success',
      showBorder: true,
    })}
    
    ${data.paymentNotes ? createHighlightBox(`📝 <strong>Admin Note:</strong> ${data.paymentNotes}`, 'warning') : ''}
    
    ${createParagraph('The funds should hit your bank account within 1-3 business days.', { muted: true })}
    
    ${createCenteredButton({
      text: 'View Payment History',
      url: `${EMAIL_ASSETS.appUrl}/admin/payouts`,
      variant: 'success',
    })}
  `;

  const html = createEmailWrapper(
    `
    ${createEmailHeader({
      title: 'Payment Processed',
      subtitle: 'Your payout is on its way',
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
