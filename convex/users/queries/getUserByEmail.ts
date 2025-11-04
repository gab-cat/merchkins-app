import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';

// Get user by email
export const getUserByEmailArgs = {
  email: v.string(),
};

export const getUserByEmailHandler = async (ctx: QueryCtx, args: { email: string }) => {
  const user = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', args.email))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .first();

  return user;
};
