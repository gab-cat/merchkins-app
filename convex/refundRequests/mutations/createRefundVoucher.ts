import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

/**
 * Monetary refund delay period for seller-initiated cancellations
 * Refund vouchers become eligible for monetary refund after this period
 */
const MONETARY_REFUND_DELAY_MS = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

/**
 * Generates a unique refund voucher code
 * Format: REFUND-XXXXXX
 */
function generateRefundVoucherCode(): string {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `REFUND-${randomPart}`;
}

export const createRefundVoucherArgs = {
  refundRequestId: v.optional(v.id('refundRequests')),
  orderId: v.id('orders'),
  amount: v.number(),
  assignedToUserId: v.id('users'),
  createdById: v.id('users'),
  cancellationInitiator: v.union(v.literal('CUSTOMER'), v.literal('SELLER')),
} as const;

export const createRefundVoucherHandler = async (
  ctx: MutationCtx,
  args: {
    refundRequestId?: Id<'refundRequests'>;
    orderId: Id<'orders'>;
    amount: number;
    assignedToUserId: Id<'users'>;
    createdById: Id<'users'>;
    cancellationInitiator: 'CUSTOMER' | 'SELLER';
  }
) => {
  // Validate amount is a positive number
  if (typeof args.amount !== 'number' || args.amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  // Get user info for creator
  const creator = await ctx.db.get(args.createdById);
  if (!creator) {
    throw new Error('Creator not found');
  }

  // Get order info
  const order = await ctx.db.get(args.orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Generate unique code
  let code = generateRefundVoucherCode();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await ctx.db
      .query('vouchers')
      .withIndex('by_code', (q) => q.eq('code', code))
      .first();
    if (!existing) break;
    code = generateRefundVoucherCode();
    attempts++;
  }

  if (attempts >= 10) {
    throw new Error('Failed to generate unique voucher code');
  }

  const now = Date.now();

  // Calculate monetary refund eligibility (14 days for seller-initiated cancellations)
  const monetaryRefundEligibleAt = args.cancellationInitiator === 'SELLER' ? now + MONETARY_REFUND_DELAY_MS : undefined;

  // Create REFUND voucher
  // REFUND vouchers are:
  // - Platform-wide (no organizationId)
  // - Personal (assignedToUserId)
  // - Single-use (usageLimit: 1, usageLimitPerUser: 1)
  // - No expiration (validUntil: undefined)
  // - FIXED_AMOUNT type with value = refund amount
  const voucherId = await ctx.db.insert('vouchers', {
    isDeleted: false,
    organizationId: undefined, // Platform-wide
    code,
    name: `Refund Voucher - Order ${order.orderNumber ?? String(args.orderId)}`,
    description: `Refund voucher issued for ${args.cancellationInitiator.toLowerCase()}-initiated cancellation`,
    discountType: 'REFUND',
    discountValue: args.amount,
    minOrderAmount: undefined, // No minimum
    maxDiscountAmount: undefined,
    applicableProductIds: undefined, // Platform-wide
    applicableCategoryIds: undefined, // Platform-wide
    usageLimit: 1, // Single-use
    usageLimitPerUser: 1,
    usedCount: 0,
    validFrom: now,
    validUntil: undefined, // No expiration
    isActive: true,
    createdById: args.createdById,
    creatorInfo: {
      firstName: creator.firstName,
      lastName: creator.lastName,
      email: creator.email,
      imageUrl: creator.imageUrl,
    },
    sourceRefundRequestId: args.refundRequestId,
    sourceOrderId: args.orderId,
    assignedToUserId: args.assignedToUserId,
    cancellationInitiator: args.cancellationInitiator,
    monetaryRefundEligibleAt,
    monetaryRefundRequestedAt: undefined,
    createdAt: now,
    updatedAt: now,
  });

  return voucherId;
};
