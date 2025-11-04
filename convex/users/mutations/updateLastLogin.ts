import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

// Update last login timestamp
export const updateLastLoginArgs = {
  userId: v.id('users'),
};

export const updateLastLoginHandler = async (ctx: MutationCtx, args: { userId: Id<'users'> }) => {
  const { userId } = args;

  // Get current user
  const user = await ctx.db.get(userId);
  if (!user || user.isDeleted) {
    throw new Error('User not found');
  }

  // Update last login timestamp
  await ctx.db.patch(userId, {
    lastLoginAt: Date.now(),
    updatedAt: Date.now(),
  });

  return { success: true };
};
