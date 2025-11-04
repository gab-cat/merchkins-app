import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { requireStaffOrAdmin } from '../../helpers';
import { Id } from '../../_generated/dataModel';

// Get user by ID
export const getUserByIdArgs = {
  userId: v.id('users'),
};

export const getUserByIdHandler = async (ctx: QueryCtx, args: { userId: Id<'users'> }) => {
  // Require staff or admin permissions to view user details
  await requireStaffOrAdmin(ctx);

  const user = await ctx.db.get(args.userId);

  if (!user || user.isDeleted) {
    return null;
  }

  return user;
};
