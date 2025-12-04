import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const getOrderLogsArgs = {
  orderId: v.id('orders'),
  limit: v.optional(v.number()),
  publicOnly: v.optional(v.boolean()),
};

export const getOrderLogsHandler = async (
  ctx: QueryCtx,
  args: {
    orderId: Id<'orders'>;
    limit?: number;
    publicOnly?: boolean;
  }
) => {
  const order = await ctx.db.get(args.orderId);
  if (!order || order.isDeleted) return [];

  let query = ctx.db.query('orderLogs').withIndex('by_order', (q) => q.eq('orderId', args.orderId));

  const logs = await query.collect();

  // Filter by public visibility if requested
  let filteredLogs = args.publicOnly ? logs.filter((log) => log.isPublic) : logs;

  // Sort by createdAt descending (newest first)
  filteredLogs.sort((a, b) => b.createdAt - a.createdAt);

  // Apply limit if specified
  if (args.limit && args.limit > 0) {
    filteredLogs = filteredLogs.slice(0, args.limit);
  }

  return filteredLogs;
};
