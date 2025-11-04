import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { requireSelfOrAdmin, logAction } from '../../helpers';
import { Id } from '../../_generated/dataModel';

// Update user profile
export const updateProfileArgs = {
  userId: v.id('users'),
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  phone: v.optional(v.string()),
  courses: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
};

export const updateProfileHandler = async (
  ctx: MutationCtx,
  args: {
    userId: Id<'users'>;
    firstName?: string;
    lastName?: string;
    phone?: string;
    courses?: string;
    imageUrl?: string;
  }
) => {
  const { userId, ...updates } = args;

  // Check authentication and authorization
  const currentUser = await requireSelfOrAdmin(ctx, userId);

  // Get current user data to verify it exists
  const user = await ctx.db.get(userId);
  if (!user || user.isDeleted) {
    throw new Error('User not found');
  }

  // Update user
  await ctx.db.patch(userId, {
    ...updates,
    updatedAt: Date.now(),
  });

  // Log the action
  await logAction(
    ctx,
    'update_profile',
    'DATA_CHANGE',
    'LOW',
    `User profile updated: ${updates.firstName || user.firstName} ${updates.lastName || user.lastName}`,
    currentUser._id,
    undefined,
    { updatedFields: Object.keys(updates) }
  );

  return { success: true };
};
