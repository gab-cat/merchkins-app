import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getCheckoutSessionByIdArgs = {
  checkoutId: v.string(),
};

export const getCheckoutSessionByIdHandler = async (ctx: QueryCtx, args: { checkoutId: string }) => {
  const session = await ctx.db
    .query('checkoutSessions')
    .withIndex('by_checkout_id', (q) => q.eq('checkoutId', args.checkoutId))
    .first();

  return session;
};
