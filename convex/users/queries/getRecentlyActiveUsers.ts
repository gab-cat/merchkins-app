import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

// Get recently active users
export const getRecentlyActiveUsersArgs = {
  limit: v.optional(v.number()),
  timeRange: v.optional(v.union(v.literal('1h'), v.literal('24h'), v.literal('7d'), v.literal('30d'))),
};

export const getRecentlyActiveUsersHandler = async (
  ctx: QueryCtx,
  args: {
    limit?: number;
    timeRange?: '1h' | '24h' | '7d' | '30d';
  }
) => {
  const { limit = 50, timeRange = '24h' } = args;

  // Calculate time range in milliseconds
  const now = Date.now();
  const timeRanges = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  const cutoffTime = now - timeRanges[timeRange];

  const users = await ctx.db
    .query('users')
    .withIndex('by_last_login', (q) => q.gte('lastLoginAt', cutoffTime))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .order('desc')
    .take(limit);

  return users;
};
