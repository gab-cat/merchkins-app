/**
 * Email Preview Utility
 * Generate preview data and render email templates for testing
 */

import { generateRefundRequestReceivedEmail, RefundRequestReceivedData } from './refundRequestReceived';
import { generateRefundApprovedEmail, RefundApprovedData } from './refundApproved';
import { generateRefundRejectedEmail, RefundRejectedData } from './refundRejected';
import { generatePayoutInvoiceReadyEmail, PayoutInvoiceReadyData } from './payoutInvoiceReady';
import { generatePaymentConfirmationEmail, PaymentConfirmationData } from './paymentConfirmation';
import { generatePaymentReceivedEmail, PaymentReceivedData } from './paymentReceived';
import { generateOrderConfirmationEmail, OrderConfirmationData } from './orderConfirmation';
import { generateShippingUpdateEmail, ShippingUpdateData, ShippingStatus } from './shippingUpdate';
import { generateWelcomeEmail, WelcomeEmailData } from './welcomeEmail';
import { generateOrganizationInviteEmail, OrganizationInviteEmailData } from './organizationInvite';

// =============================================================================
// SAMPLE DATA FOR PREVIEWS
// =============================================================================

export const sampleRefundRequestReceivedData: RefundRequestReceivedData = {
  orderNumber: 'ORD-2024-001234',
  orderDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
  refundAmount: 1299.0,
  customerFirstName: 'Juan',
  customerLastName: 'Dela Cruz',
  customerEmail: 'juan.delacruz@example.com',
  reason: 'NOT_AS_DESCRIBED',
  customerMessage: 'The item I received was different from what was shown in the product listing. I would like to request a full refund.',
};

export const sampleRefundApprovedData: RefundApprovedData = {
  customerFirstName: 'Juan',
  orderNumber: 'ORD-2024-001234',
  refundAmount: 1299.0,
  voucherCode: 'REFUND-ABC123XYZ',
  adminMessage: 'We apologize for the inconvenience. Please enjoy this voucher for your next purchase!',
};

export const sampleRefundRejectedData: RefundRejectedData = {
  customerFirstName: 'Juan',
  orderNumber: 'ORD-2024-001234',
  orderDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
  refundAmount: 1299.0,
  adminMessage:
    'After reviewing your request, we found that the item was delivered as described. The refund request has been declined per our return policy.',
};

export const samplePayoutInvoiceReadyData: PayoutInvoiceReadyData = {
  organizationName: 'Awesome Merch Store',
  invoiceNumber: 'INV-2024-W50-001',
  invoiceId: 'j1234567890abcdef1234567890abcdef',
  periodStart: Date.now() - 7 * 24 * 60 * 60 * 1000,
  periodEnd: Date.now(),
  grossAmount: 52500.0,
  platformFeePercentage: 10,
  platformFeeAmount: 5250.0,
  netAmount: 47250.0,
  orderCount: 42,
  itemCount: 156,
};

export const samplePaymentConfirmationData: PaymentConfirmationData = {
  organizationName: 'Awesome Merch Store',
  invoiceNumber: 'INV-2024-W50-001',
  netAmount: 47250.0,
  paidAt: Date.now(),
  paymentReference: 'BDO-TRF-20241213-001',
  paymentNotes: 'Payment processed via bank transfer.',
};

export const sampleOrderConfirmationData: OrderConfirmationData = {
  customerFirstName: 'Juan',
  orderNumber: 'ORD-2024-005678',
  orderDate: Date.now(),
  organizationName: 'Awesome Merch Store',
  items: [
    { name: 'Classic Logo T-Shirt', variant: 'Black / Large', quantity: 2, price: 599.0 },
    { name: 'Limited Edition Hoodie', variant: 'Navy / Medium', quantity: 1, price: 1499.0 },
    { name: 'Sticker Pack (Set of 5)', quantity: 3, price: 150.0 },
  ],
  subtotal: 3147.0,
  shippingFee: 150.0,
  discount: 300.0,
  total: 2997.0,
  paymentMethod: 'GCash',
  deliveryAddress: '123 Sample Street, Barangay Example, Makati City, Metro Manila 1234',
  estimatedDelivery: 'December 18-20, 2024',
};

export const sampleShippingUpdateData: Record<ShippingStatus, ShippingUpdateData> = {
  SHIPPED: {
    customerFirstName: 'Juan',
    orderNumber: 'ORD-2024-005678',
    status: 'SHIPPED',
    trackingNumber: 'EP123456789PH',
    trackingUrl: 'https://track.example.com/EP123456789PH',
    carrierName: 'LBC Express',
    deliveryAddress: '123 Sample Street, Barangay Example, Makati City, Metro Manila 1234',
    estimatedDelivery: 'December 18-20, 2024',
  },
  OUT_FOR_DELIVERY: {
    customerFirstName: 'Juan',
    orderNumber: 'ORD-2024-005678',
    status: 'OUT_FOR_DELIVERY',
    trackingNumber: 'EP123456789PH',
    trackingUrl: 'https://track.example.com/EP123456789PH',
    carrierName: 'LBC Express',
    deliveryAddress: '123 Sample Street, Barangay Example, Makati City, Metro Manila 1234',
    estimatedDelivery: 'Today, December 18, 2024',
  },
  DELIVERED: {
    customerFirstName: 'Juan',
    orderNumber: 'ORD-2024-005678',
    status: 'DELIVERED',
    trackingNumber: 'EP123456789PH',
    carrierName: 'LBC Express',
    deliveryAddress: '123 Sample Street, Barangay Example, Makati City, Metro Manila 1234',
    deliveredAt: Date.now(),
  },
  READY_FOR_PICKUP: {
    customerFirstName: 'Juan',
    orderNumber: 'ORD-2024-005678',
    status: 'READY_FOR_PICKUP',
    pickupLocation: 'Awesome Merch Store - SM Makati Branch, Ground Floor, North Wing',
    estimatedDelivery: 'Available until December 25, 2024',
  },
};

export const sampleWelcomeEmailData: WelcomeEmailData = {
  firstName: 'Juan',
  email: 'juan.delacruz@example.com',
};

export const samplePaymentReceivedData: PaymentReceivedData = {
  customerFirstName: 'Juan',
  orderNumber: 'ORD-2024-005678',
  orderDate: Date.now(),
  organizationName: 'Awesome Merch Store',
  items: [
    { name: 'Classic Logo T-Shirt', variant: 'Black / Large', quantity: 2, price: 599.0 },
    { name: 'Limited Edition Hoodie', variant: 'Navy / Medium', quantity: 1, price: 1499.0 },
  ],
  subtotal: 2697.0,
  discount: 300.0,
  total: 2397.0,
  paymentAmount: 2397.0,
  transactionId: 'TXN-20241213-ABC123XYZ',
  paymentMethod: 'GCash',
};

export const sampleOrganizationInviteEmailData: OrganizationInviteEmailData = {
  recipientEmail: 'juan.delacruz@example.com',
  organizationName: 'Awesome Merch Store',
  creatorName: 'Maria Santos',
  inviteLinkUrl: 'https://app.merchkins.com/invite/abc123xyz789',
  expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
  usageLimit: 5,
  usedCount: 1,
};

// =============================================================================
// PREVIEW GENERATORS
// =============================================================================

export type EmailTemplateType =
  | 'refund-request-received'
  | 'refund-approved'
  | 'refund-rejected'
  | 'payout-invoice-ready'
  | 'payment-confirmation'
  | 'payment-received'
  | 'order-confirmation'
  | 'shipping-shipped'
  | 'shipping-out-for-delivery'
  | 'shipping-delivered'
  | 'shipping-ready-for-pickup'
  | 'welcome'
  | 'organization-invite';

/**
 * Generate a preview of any email template using sample data
 */
export const generateEmailPreview = (templateType: EmailTemplateType): { subject: string; html: string } => {
  switch (templateType) {
    case 'refund-request-received':
      return generateRefundRequestReceivedEmail(sampleRefundRequestReceivedData);
    case 'refund-approved':
      return generateRefundApprovedEmail(sampleRefundApprovedData);
    case 'refund-rejected':
      return generateRefundRejectedEmail(sampleRefundRejectedData);
    case 'payout-invoice-ready':
      return generatePayoutInvoiceReadyEmail(samplePayoutInvoiceReadyData);
    case 'payment-confirmation':
      return generatePaymentConfirmationEmail(samplePaymentConfirmationData);
    case 'payment-received':
      return generatePaymentReceivedEmail(samplePaymentReceivedData);
    case 'order-confirmation':
      return generateOrderConfirmationEmail(sampleOrderConfirmationData);
    case 'shipping-shipped':
      return generateShippingUpdateEmail(sampleShippingUpdateData.SHIPPED);
    case 'shipping-out-for-delivery':
      return generateShippingUpdateEmail(sampleShippingUpdateData.OUT_FOR_DELIVERY);
    case 'shipping-delivered':
      return generateShippingUpdateEmail(sampleShippingUpdateData.DELIVERED);
    case 'shipping-ready-for-pickup':
      return generateShippingUpdateEmail(sampleShippingUpdateData.READY_FOR_PICKUP);
    case 'welcome':
      return generateWelcomeEmail(sampleWelcomeEmailData);
    case 'organization-invite':
      return generateOrganizationInviteEmail(sampleOrganizationInviteEmailData);
  }
};

/**
 * Get all available template types
 */
export const getAllTemplateTypes = (): EmailTemplateType[] => {
  return [
    'refund-request-received',
    'refund-approved',
    'refund-rejected',
    'payout-invoice-ready',
    'payment-confirmation',
    'payment-received',
    'order-confirmation',
    'shipping-shipped',
    'shipping-out-for-delivery',
    'shipping-delivered',
    'shipping-ready-for-pickup',
    'welcome',
    'organization-invite',
  ];
};

/**
 * Generate all email previews
 */
export const generateAllPreviews = (): Array<{ type: EmailTemplateType; subject: string; html: string }> => {
  return getAllTemplateTypes().map((type) => ({
    type,
    ...generateEmailPreview(type),
  }));
};
