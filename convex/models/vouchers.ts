import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Vouchers table for discount/promo codes
 * Supports multiple discount types:
 * - PERCENTAGE: Percentage off (e.g., 10% off)
 * - FIXED_AMOUNT: Fixed amount off (e.g., ₱100 off)
 * - FREE_ITEM: Free item with purchase (value = item quantity)
 * - FREE_SHIPPING: Free shipping (future use)
 */
export const vouchers = defineTable({
  isDeleted: v.boolean(),
  organizationId: v.optional(v.id('organizations')),

  // Voucher code (unique, case-insensitive)
  code: v.string(),

  // Voucher details
  name: v.string(),
  description: v.optional(v.string()),

  // Discount type and value
  discountType: v.union(
    v.literal('PERCENTAGE'),
    v.literal('FIXED_AMOUNT'),
    v.literal('FREE_ITEM'),
    v.literal('FREE_SHIPPING')
  ),
  discountValue: v.number(), // Percentage (0-100) or fixed amount

  // Constraints
  minOrderAmount: v.optional(v.number()), // Minimum order amount to apply
  maxDiscountAmount: v.optional(v.number()), // Cap on discount (for percentage)
  applicableProductIds: v.optional(v.array(v.id('products'))), // Specific products only
  applicableCategoryIds: v.optional(v.array(v.id('categories'))), // Specific categories only

  // Usage limits
  usageLimit: v.optional(v.number()), // Total times voucher can be used
  usageLimitPerUser: v.optional(v.number()), // Times per user (default 1)
  usedCount: v.number(), // Current usage count

  // Validity period
  validFrom: v.number(),
  validUntil: v.optional(v.number()),
  isActive: v.boolean(),

  // Creator info
  createdById: v.id('users'),
  creatorInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  }),

  // Organization info (if scoped to an organization)
  organizationInfo: v.optional(
    v.object({
      name: v.string(),
      slug: v.string(),
      logo: v.optional(v.string()),
    })
  ),

  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_code', ['code'])
  .index('by_organization', ['organizationId'])
  .index('by_isActive', ['isActive'])
  .index('by_isDeleted', ['isDeleted'])
  .index('by_validFrom', ['validFrom'])
  .index('by_validUntil', ['validUntil'])
  .index('by_creator', ['createdById'])
  .index('by_organization_active', ['organizationId', 'isActive'])
  .index('by_discountType', ['discountType']);

/**
 * Voucher usage tracking
 * Records each time a voucher is used
 */
export const voucherUsages = defineTable({
  voucherId: v.id('vouchers'),
  orderId: v.id('orders'),
  userId: v.id('users'),
  organizationId: v.optional(v.id('organizations')),

  // Snapshot of voucher details at time of use
  voucherSnapshot: v.object({
    code: v.string(),
    name: v.string(),
    discountType: v.string(),
    discountValue: v.number(),
  }),

  // Discount applied
  discountAmount: v.number(),

  // User info
  userInfo: v.object({
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
  }),

  createdAt: v.number(),
})
  .index('by_voucher', ['voucherId'])
  .index('by_order', ['orderId'])
  .index('by_user', ['userId'])
  .index('by_voucher_user', ['voucherId', 'userId'])
  .index('by_organization', ['organizationId']);
