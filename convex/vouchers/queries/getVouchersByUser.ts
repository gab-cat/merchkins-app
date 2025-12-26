import { query } from '../../_generated/server';
import { v } from 'convex/values';

export const getVouchersByUserArgs = {
  userId: v.id('users'),
  includeUsed: v.optional(v.boolean()),
};

export const getVouchersByUserReturns = v.array(
  v.object({
    _id: v.id('vouchers'),
    _creationTime: v.number(),
    isDeleted: v.boolean(),
    organizationId: v.optional(v.id('organizations')),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    discountType: v.union(
      v.literal('PERCENTAGE'),
      v.literal('FIXED_AMOUNT'),
      v.literal('FREE_ITEM'),
      v.literal('FREE_SHIPPING'),
      v.literal('REFUND')
    ),
    discountValue: v.number(),
    minOrderAmount: v.optional(v.number()),
    maxDiscountAmount: v.optional(v.number()),
    applicableProductIds: v.optional(v.array(v.id('products'))),
    applicableCategoryIds: v.optional(v.array(v.id('categories'))),
    usageLimit: v.optional(v.number()),
    usageLimitPerUser: v.optional(v.number()),
    usedCount: v.number(),
    validFrom: v.number(),
    validUntil: v.optional(v.number()),
    isActive: v.boolean(),
    createdById: v.id('users'),
    creatorInfo: v.object({
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      email: v.string(),
      imageUrl: v.optional(v.string()),
    }),
    organizationInfo: v.optional(
      v.object({
        name: v.string(),
        slug: v.string(),
        logo: v.optional(v.string()),
      })
    ),
    sourceRefundRequestId: v.optional(v.id('refundRequests')),
    sourceOrderId: v.optional(v.id('orders')),
    assignedToUserId: v.optional(v.id('users')),
    cancellationInitiator: v.optional(v.union(v.literal('CUSTOMER'), v.literal('SELLER'))),
    monetaryRefundEligibleAt: v.optional(v.number()),
    monetaryRefundRequestedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    computedStatus: v.union(v.literal('active'), v.literal('inactive'), v.literal('expired'), v.literal('used'), v.literal('refunded')),
    isExpired: v.boolean(),
    isUsed: v.boolean(),
    isMonetaryRefundEligible: v.boolean(),
    daysUntilMonetaryRefundEligible: v.union(v.number(), v.null()),
  })
);

export const getVouchersByUser = query({
  args: getVouchersByUserArgs,
  returns: getVouchersByUserReturns,
  handler: async (ctx, args) => {
    const now = Date.now();

    let query = ctx.db
      .query('vouchers')
      .withIndex('by_assignedUser', (q) => q.eq('assignedToUserId', args.userId))
      .filter((q) => q.eq(q.field('isDeleted'), false));

    // Filter out used vouchers unless requested
    if (!args.includeUsed) {
      query = query.filter((q) => q.eq(q.field('usedCount'), 0));
    }

    const vouchers = await query.order('desc').collect();

    // Enrich with computed status and eligibility
    const enrichedVouchers = vouchers.map((voucher) => {
      const isExpired = voucher.validUntil ? voucher.validUntil < now : false;
      const isStarted = voucher.validFrom <= now;
      const isUsed = voucher.usedCount > 0;
      const isMonetaryRefundEligible =
        voucher.cancellationInitiator === 'SELLER' &&
        voucher.monetaryRefundEligibleAt !== undefined &&
        now >= voucher.monetaryRefundEligibleAt &&
        !isUsed;

      let computedStatus: 'active' | 'inactive' | 'expired' | 'used' | 'refunded';
      if (!voucher.isActive) {
        computedStatus = 'refunded';
      } else if (isUsed) {
        computedStatus = 'used';
      } else if (isExpired) {
        computedStatus = 'expired';
      } else if (!isStarted) {
        computedStatus = 'inactive';
      } else {
        computedStatus = 'active';
      }

      return {
        ...voucher,
        computedStatus,
        isExpired,
        isUsed,
        isMonetaryRefundEligible,
        daysUntilMonetaryRefundEligible:
          voucher.monetaryRefundEligibleAt && now < voucher.monetaryRefundEligibleAt
            ? Math.ceil((voucher.monetaryRefundEligibleAt - now) / (24 * 60 * 60 * 1000))
            : null,
      };
    });

    return enrichedVouchers;
  },
});
