import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAdmin, validateUserExists, logAction } from '../../helpers';

// Update user permissions
export const updateUserPermissionsArgs = {
  userId: v.id('users'),
  permissions: v.array(
    v.object({
      permissionCode: v.string(),
      canCreate: v.boolean(),
      canRead: v.boolean(),
      canUpdate: v.boolean(),
      canDelete: v.boolean(),
    })
  ),
};

export const updateUserPermissionsHandler = async (
  ctx: MutationCtx,
  args: {
    userId: Id<'users'>;
    permissions: Array<{
      permissionCode: string;
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }>;
  }
) => {
  const { userId, permissions } = args;

  // Require admin privileges for permission changes
  const currentUser = await requireAdmin(ctx);

  // Validate target user exists
  const user = await validateUserExists(ctx, userId);

  // Update user permissions
  await ctx.db.patch(userId, {
    permissions,
    updatedAt: Date.now(),
  });

  // Log the security event
  await logAction(
    ctx,
    'update_user_permissions',
    'SECURITY_EVENT',
    'HIGH',
    `Updated permissions for ${user.firstName} ${user.lastName}`,
    currentUser._id,
    undefined,
    { targetUserId: userId, permissionsCount: permissions.length }
  );

  return { success: true };
};
