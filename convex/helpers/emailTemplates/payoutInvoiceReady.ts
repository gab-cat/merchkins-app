/**
 * Payout Invoice Ready Email Template
 * Merchkins brand design - Celebrate seller success with brand styling
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
  createStatBoxes,
  createAmountDisplay,
  createDivider,
  formatCurrency,
  formatDate,
} from './builders';

export interface PayoutInvoiceReadyData {
  organizationName: string;
  invoiceNumber: string;
  invoiceId: string; // Convex ID for the invoice
  periodStart: number;
  periodEnd: number;
  grossAmount: number;
  platformFeePercentage: number;
  platformFeeAmount: number;
  netAmount: number;
  orderCount: number;
  itemCount: number;
}

/**
 * Generate the payout invoice ready email HTML - Premium dark mode
 */
export const generatePayoutInvoiceReadyEmail = (data: PayoutInvoiceReadyData): { subject: string; html: string } => {
  const subject = `Invoice Ready - ${data.invoiceNumber} 📊`;

  const invoiceDetailsContent = `
    ${createDetailRow('Invoice', `<span style="font-family: ${EMAIL_FONTS.mono}; color: ${EMAIL_COLORS.primary}; font-weight: 600;">${data.invoiceNumber}</span>`)}
    ${createDetailRow('Period', `${formatDate(data.periodStart)} — ${formatDate(data.periodEnd)}`)}
    ${createDetailRow('Gross Sales', formatCurrency(data.grossAmount))}
    ${createDetailRow('Platform Fee', `<span style="color: ${EMAIL_COLORS.textMuted};">${formatCurrency(data.platformFeeAmount)} (${data.platformFeePercentage}%)</span>`)}
  `;

  const bodyContent = `
    <p style="margin: 0 0 ${EMAIL_SPACING.md}; color: ${EMAIL_COLORS.textPrimary}; font-size: ${EMAIL_FONT_SIZES.lg}; font-weight: 500;">
      Hey ${data.organizationName} Team! 📈
    </p>
    
    ${createParagraph(`Your payout invoice for <strong style="color: ${EMAIL_COLORS.textPrimary};">${formatDate(data.periodStart)}</strong> to <strong style="color: ${EMAIL_COLORS.textPrimary};">${formatDate(data.periodEnd)}</strong> is ready.`)}
    
    ${createAmountDisplay('Net Payout', formatCurrency(data.netAmount), 'success')}
    
    ${createStatBoxes([
      { label: 'Orders', value: data.orderCount.toString(), statusType: 'primary' },
      { label: 'Items Sold', value: data.itemCount.toString(), statusType: 'success' },
    ])}
    
    ${createCard({
      title: 'Invoice Breakdown',
      content: invoiceDetailsContent,
      statusType: 'primary',
      showBorder: true,
    })}
    
    ${createDivider()}
    
    ${createParagraph('Your payout will be processed on the upcoming Friday. You can view and download the full invoice PDF below.', { muted: true })}
    
    ${createCenteredButton({
      text: 'View Invoice PDF',
      url: `${EMAIL_ASSETS.appUrl}/admin/payouts/invoices/${data.invoiceId}`,
      variant: 'primary',
    })}
  `;

  const html = createEmailWrapper(
    `
    ${createEmailHeader({
      title: 'Invoice Ready',
      subtitle: 'Your weekly payout summary',
      statusType: 'primary',
      showLogo: true,
    })}
    ${createEmailBody(bodyContent)}
    ${createEmailFooter({ showSupportEmail: false })}
    `,
    subject
  );

  return { subject, html };
};
