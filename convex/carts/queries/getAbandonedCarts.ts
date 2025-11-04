import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

export const getAbandonedCartsArgs = {
  sinceMs: v.optional(v.number()),
  limit: v.optional(v.number()),
};

export const getAbandonedCartsHandler = async (ctx: QueryCtx, args: { sinceMs?: number; limit?: number }) => {
  const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
  const query = ctx.db.query('carts').withIndex('by_abandoned', (q) => q.eq('isAbandoned', true));

  const all = await query.collect();
  const filtered = all
    .filter((c) => (args.sinceMs ? (c.abandonedAt ?? 0) >= args.sinceMs : true))
    .sort((a, b) => (b.abandonedAt ?? 0) - (a.abandonedAt ?? 0))
    .slice(0, limit);

  return filtered;
};
