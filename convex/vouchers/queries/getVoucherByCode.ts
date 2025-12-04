import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getVoucherByCodeArgs = {
  code: v.string(),
};

export const getVoucherByCodeHandler = async (
  ctx: QueryCtx,
  args: {
    code: string;
  }
) => {
  // Normalize code to uppercase
  const normalizedCode = args.code.toUpperCase().trim();
  
  const voucher = await ctx.db
    .query('vouchers')
    .withIndex('by_code', (q) => q.eq('code', normalizedCode))
    .first();
  
  if (!voucher || voucher.isDeleted) {
    return null;
  }

  return voucher;
};
