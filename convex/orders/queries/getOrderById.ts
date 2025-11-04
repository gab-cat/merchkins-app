import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const getOrderByIdArgs = {
  orderId: v.id('orders'),
  includeItems: v.optional(v.boolean()),
};

export const getOrderByIdHandler = async (ctx: QueryCtx, args: { orderId: Id<'orders'>; includeItems?: boolean }) => {
  const order = await ctx.db.get(args.orderId);
  if (!order || order.isDeleted) return null;

  if (order.embeddedItems || !args.includeItems) return order;

  const items = await ctx.db
    .query('orderItems')
    .withIndex('by_order', (q) => q.eq('orderId', args.orderId))
    .collect();

  return { ...order, items };
};
