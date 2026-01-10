/**
 * Email Templates Module
 * Modular email template system for Merchkins
 *
 * Usage:
 * ```ts
 * import {
 *   generateRefundApprovedEmail,
 *   sendEmail,
 *   getSupportFromAddress,
 * } from '../helpers/emailTemplates';
 *
 * const { subject, html } = generateRefundApprovedEmail({
 *   customerFirstName: 'Juan',
 *   orderNumber: 'ORD-001',
 *   refundAmount: 1299,
 *   voucherCode: 'REFUND-ABC123',
 * });
 *
 * await sendEmail({
 *   to: 'customer@example.com',
 *   subject,
 *   html,
 *   from: getSupportFromAddress(),
 *   fromName: 'Merchkins Support',
 * });
 * ```
 */

// =============================================================================
// CONSTANTS
// =============================================================================
export { EMAIL_COLORS, EMAIL_FONTS, EMAIL_FONT_SIZES, EMAIL_SPACING, EMAIL_RADIUS, EMAIL_ASSETS, EMAIL_LAYOUT, EMAIL_GRADIENTS, EMAIL_SHADOWS } from './constants';

// =============================================================================
// BUILDERS (Low-level utilities for custom templates)
// =============================================================================
export {
  // Types
  type EmailStatusType,
  type EmailButton,
  type EmailHeader,
  type EmailCard,

  // Utility functions
  formatCurrency,
  formatDate,
  formatDateShort,

  // Component builders
  createEmailWrapper,
  createEmailHeader,
  createEmailBody,
  createEmailFooter,
  createParagraph,
  createButton,
  createCenteredButton,
  createCard,
  createHighlightBox,
  createAmountDisplay,
  createVoucherCode,
  createDetailRow,
  createDivider,
  createStatBoxes,
  createOrderedList,
  createUnorderedList,
  createSectionTitle,
  createSpacer,
  createBrandGradientBox,
  createNeonAccent,
  createBrandHeader,
  createFeatureRow,
  createStatusBadge,
} from './builders';

// =============================================================================
// MAILGUN CLIENT
// =============================================================================
export {
  type SendEmailOptions,
  type SendEmailResult,
  sendEmail,
  getSupportFromAddress,
  getPayoutsFromAddress,
  getNotificationsFromAddress,
} from './mailgunClient';

// =============================================================================
// EMAIL TEMPLATES - Refund
// =============================================================================
export { type RefundRequestReceivedData, generateRefundRequestReceivedEmail } from './refundRequestReceived';

export { type RefundApprovedData, generateRefundApprovedEmail } from './refundApproved';

export { type RefundRejectedData, generateRefundRejectedEmail } from './refundRejected';

// =============================================================================
// EMAIL TEMPLATES - Payout
// =============================================================================
export { type PayoutInvoiceReadyData, generatePayoutInvoiceReadyEmail } from './payoutInvoiceReady';

export { type PaymentConfirmationData, generatePaymentConfirmationEmail } from './paymentConfirmation';

export { type PaymentReceivedData, generatePaymentReceivedEmail } from './paymentReceived';

// =============================================================================
// EMAIL TEMPLATES - Order
// =============================================================================
export { type OrderItem, type OrderConfirmationData, generateOrderConfirmationEmail } from './orderConfirmation';

// =============================================================================
// EMAIL TEMPLATES - Shipping
// =============================================================================
export { type ShippingStatus, type ShippingUpdateData, generateShippingUpdateEmail } from './shippingUpdate';

// =============================================================================
// EMAIL TEMPLATES - Welcome
// =============================================================================
export { type WelcomeEmailData, generateWelcomeEmail } from './welcomeEmail';

// =============================================================================
// EMAIL TEMPLATES - Organization Invite
// =============================================================================
export { type OrganizationInviteEmailData, generateOrganizationInviteEmail } from './organizationInvite';

// =============================================================================
// PREVIEW UTILITIES
// =============================================================================
export {
  type EmailTemplateType,
  generateEmailPreview,
  getAllTemplateTypes,
  generateAllPreviews,

  // Sample data for testing
  sampleRefundRequestReceivedData,
  sampleRefundApprovedData,
  sampleRefundRejectedData,
  samplePayoutInvoiceReadyData,
  samplePaymentConfirmationData,
  samplePaymentReceivedData,
  sampleOrderConfirmationData,
  sampleShippingUpdateData,
  sampleWelcomeEmailData,
  sampleOrganizationInviteEmailData,
} from './preview';
