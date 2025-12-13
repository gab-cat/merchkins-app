import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Voucher redemption costs table
 * Tracks platform costs when REFUND vouchers are used
 * Used for platform accounting and payout calculations
 */
export const voucherRedemptionCosts = defineTable({
  isDeleted: v.boolean(),
  voucherId: v.id('vouchers'),
  orderId: v.id('orders'),
  sellerOrganizationId: v.id('organizations'),

  // Amount covered by platform (voucher value)
  amountCovered: v.number(),

  // Embedded voucher info
  voucherInfo: v.object({
    code: v.string(),
    discountType: v.string(),
    discountValue: v.number(),
    sourceRefundRequestId: v.optional(v.string()),
  }),

  // Embedded order info
  orderInfo: v.object({
    orderNumber: v.optional(v.string()),
    totalAmount: v.number(),
    orderDate: v.number(),
  }),

  // Embedded seller organization info
  sellerOrgInfo: v.object({
    name: v.string(),
    slug: v.string(),
  }),

  createdAt: v.number(),
})
  .index('by_voucher', ['voucherId'])
  .index('by_order', ['orderId'])
  .index('by_seller_org', ['sellerOrganizationId'])
  .index('by_isDeleted', ['isDeleted'])
  .index('by_createdAt', ['createdAt']);
