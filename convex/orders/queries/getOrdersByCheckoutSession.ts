import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getOrdersByCheckoutSessionArgs = {
  checkoutId: v.string(),
};

export const getOrdersByCheckoutSessionHandler = async (ctx: QueryCtx, args: { checkoutId: string }) => {
  const orders = await ctx.db
    .query('orders')
    .withIndex('by_checkout_id', (q) => q.eq('checkoutId', args.checkoutId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .collect();

  return orders;
};
