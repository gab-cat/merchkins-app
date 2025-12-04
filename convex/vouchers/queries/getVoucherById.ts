import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const getVoucherByIdArgs = {
  voucherId: v.id('vouchers'),
};

export const getVoucherByIdHandler = async (
  ctx: QueryCtx,
  args: {
    voucherId: Id<'vouchers'>;
  }
) => {
  const voucher = await ctx.db.get(args.voucherId);
  
  if (!voucher || voucher.isDeleted) {
    return null;
  }

  const now = Date.now();
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

  // Get usage statistics
  const usages = await ctx.db
    .query('voucherUsages')
    .withIndex('by_voucher', (q) => q.eq('voucherId', args.voucherId))
    .collect();

  const totalDiscountGiven = usages.reduce((sum, u) => sum + u.discountAmount, 0);
  const uniqueUsers = new Set(usages.map((u) => String(u.userId))).size;

  return {
    ...voucher,
    computedStatus,
    isExpired,
    isUsageLimitReached,
    remainingUses: voucher.usageLimit ? voucher.usageLimit - voucher.usedCount : null,
    stats: {
      totalUsages: usages.length,
      totalDiscountGiven,
      uniqueUsers,
      recentUsages: usages.slice(-5).reverse(),
    },
  };
};
