import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireSelfOrAdmin, validateUserExists, logAction } from '../../helpers';

// Assign permission to a user (embedded in user record)
export const assignUserPermissionArgs = {
  userId: v.id('users'),
  permissionCode: v.string(),
  canCreate: v.boolean(),
  canRead: v.boolean(),
  canUpdate: v.boolean(),
  canDelete: v.boolean(),
};

export const assignUserPermissionHandler = async (
  ctx: MutationCtx,
  args: {
    userId: Id<'users'>;
    permissionCode: string;
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  }
) => {
  const { userId, permissionCode, canCreate, canRead, canUpdate, canDelete } = args;

  // Check authorization - user can update their own permissions or admin can update any
  const currentUser = await requireSelfOrAdmin(ctx, userId);

  // Validate target user exists
  const targetUser = await validateUserExists(ctx, userId);

  // Check if permission definition exists
  const permission = await ctx.db
    .query('permissions')
    .withIndex('by_code', (q) => q.eq('code', permissionCode))
    .filter((q) => q.eq(q.field('isActive'), true))
    .first();

  if (!permission) {
    throw new Error('Permission not found or inactive');
  }

  // Get current user permissions
  const currentPermissions = targetUser.permissions || [];

  // Check if user already has this permission
  const existingPermissionIndex = currentPermissions.findIndex((p) => p.permissionCode === permissionCode);

  const newPermission = {
    permissionCode,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
  };

  let updatedPermissions;
  let action;

  if (existingPermissionIndex >= 0) {
    // Update existing permission
    updatedPermissions = [...currentPermissions];
    updatedPermissions[existingPermissionIndex] = newPermission;
    action = 'updated';
  } else {
    // Add new permission
    updatedPermissions = [...currentPermissions, newPermission];
    action = 'assigned';
  }

  // Update user with new permissions
  await ctx.db.patch(userId, {
    permissions: updatedPermissions,
    updatedAt: Date.now(),
  });

  // Log the action
  await logAction(
    ctx,
    'assign_user_permission',
    'SECURITY_EVENT',
    'MEDIUM',
    `${action} permission ${permissionCode} for user ${targetUser.firstName} ${targetUser.lastName}`,
    currentUser._id,
    undefined,
    {
      targetUserId: userId,
      targetUserEmail: targetUser.email,
      permissionCode,
      permissions: { canCreate, canRead, canUpdate, canDelete },
      action,
      permissionName: permission.name,
      permissionCategory: permission.category,
    }
  );

  return { success: true };
};
