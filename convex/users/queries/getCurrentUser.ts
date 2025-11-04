import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

// Get current user by Clerk ID
export const getCurrentUserArgs = {
  clerkId: v.string(),
};

export const getCurrentUserHandler = async (ctx: QueryCtx, args: { clerkId: string }) => {
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('clerkId', args.clerkId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .first();

  return user;
};
