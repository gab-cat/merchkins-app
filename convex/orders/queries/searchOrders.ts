import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const searchOrdersArgs = {
  query: v.string(),
  limit: v.optional(v.number()),
};

export const searchOrdersHandler = async (ctx: QueryCtx, args: { query: string; limit?: number }) => {
  const q = args.query.toLowerCase();

  // No full-text index on orders; approximate by scanning recent orders index and filtering
  const recent = await ctx.db
    .query('orders')
    .withIndex('by_order_date')
    .order('desc')
    .filter((f) => f.eq(f.field('isDeleted'), false))
    .take(Math.max(200, args.limit ?? 50));

  const results = recent.filter((o) => {
    const orderNumber = (o.orderNumber || '').toLowerCase();
    const email = (o.customerInfo.email || '').toLowerCase();
    const name = `${o.customerInfo.firstName ?? ''} ${o.customerInfo.lastName ?? ''}`.trim().toLowerCase();
    return orderNumber.includes(q) || email.includes(q) || name.includes(q);
  });

  const limit = args.limit ?? 50;
  return results.slice(0, limit);
};
