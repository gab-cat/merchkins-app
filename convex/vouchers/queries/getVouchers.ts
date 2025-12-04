import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const getVouchersArgs = {
  organizationId: v.optional(v.id('organizations')),
  isActive: v.optional(v.boolean()),
  discountType: v.optional(
    v.union(
      v.literal('PERCENTAGE'),
      v.literal('FIXED_AMOUNT'),
      v.literal('FREE_ITEM'),
      v.literal('FREE_SHIPPING')
    )
  ),
  search: v.optional(v.string()),
  includeExpired: v.optional(v.boolean()),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
};

export const getVouchersHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<'organizations'>;
    isActive?: boolean;
    discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_ITEM' | 'FREE_SHIPPING';
    search?: string;
    includeExpired?: boolean;
    limit?: number;
    offset?: number;
  }
) => {
  const now = Date.now();
  let query;

  // Build base query based on organization and active status
  if (args.organizationId !== undefined && args.isActive !== undefined) {
    query = ctx.db
      .query('vouchers')
      .withIndex('by_organization_active', (q) =>
        q.eq('organizationId', args.organizationId).eq('isActive', args.isActive!)
      );
  } else if (args.organizationId !== undefined) {
    query = ctx.db
      .query('vouchers')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId));
  } else if (args.isActive !== undefined) {
    query = ctx.db
      .query('vouchers')
      .withIndex('by_isActive', (q) => q.eq('isActive', args.isActive!));
  } else {
    query = ctx.db.query('vouchers');
  }

  // Filter results
  const filtered = query.filter((q) => {
    const conditions = [q.eq(q.field('isDeleted'), false)];

    // Discount type filter
    if (args.discountType) {
      conditions.push(q.eq(q.field('discountType'), args.discountType));
    }

    // Exclude expired unless requested
    if (!args.includeExpired) {
      conditions.push(
        q.or(
          q.eq(q.field('validUntil'), undefined),
          q.gte(q.field('validUntil'), now)
        )
      );
    }

    return q.and(...conditions);
  });

  let results = await filtered.collect();

  // Search filter (code or name)
  if (args.search) {
    const searchLower = args.search.toLowerCase();
    results = results.filter(
      (v) =>
        v.code.toLowerCase().includes(searchLower) ||
        v.name.toLowerCase().includes(searchLower)
    );
  }

  // Sort by creation date (newest first)
  results.sort((a, b) => b.createdAt - a.createdAt);

  const total = results.length;
  const offset = args.offset || 0;
  const limit = args.limit || 20;
  const page = results.slice(offset, offset + limit);

  // Enrich with computed status
  const enrichedVouchers = page.map((voucher) => {
    const isExpired = voucher.validUntil ? voucher.validUntil < now : false;
    const isStarted = voucher.validFrom <= now;
    const isUsageLimitReached = voucher.usageLimit ? voucher.usedCount >= voucher.usageLimit : false;

    let computedStatus: 'active' | 'inactive' | 'expired' | 'scheduled' | 'exhausted';
    if (!voucher.isActive) {
      computedStatus = 'inactive';
    } else if (isExpired) {
      computedStatus = 'expired';
    } else if (isUsageLimitReached) {
      computedStatus = 'exhausted';
    } else if (!isStarted) {
      computedStatus = 'scheduled';
    } else {
      computedStatus = 'active';
    }

    return {
      ...voucher,
      computedStatus,
      isExpired,
      isUsageLimitReached,
      remainingUses: voucher.usageLimit ? voucher.usageLimit - voucher.usedCount : null,
    };
  });

  return {
    vouchers: enrichedVouchers,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
  };
};
