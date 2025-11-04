import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAdmin, logAction } from '../../helpers';

// Bulk assign permissions to multiple users
export const bulkAssignUserPermissionsArgs = {
  userIds: v.array(v.id('users')),
  permissions: v.array(
    v.object({
      permissionCode: v.string(),
      canCreate: v.boolean(),
      canRead: v.boolean(),
      canUpdate: v.boolean(),
      canDelete: v.boolean(),
    })
  ),
  overwrite: v.optional(v.boolean()), // Whether to overwrite existing permissions
};

export const bulkAssignUserPermissionsHandler = async (
  ctx: MutationCtx,
  args: {
    userIds: Id<'users'>[];
    permissions: Array<{
      permissionCode: string;
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }>;
    overwrite?: boolean;
  }
) => {
  // Require admin privileges for bulk operations
  const currentUser = await requireAdmin(ctx);

  const { userIds, permissions, overwrite = false } = args;

  // Validate that all permission codes exist
  const permissionCodes = permissions.map((p) => p.permissionCode);
  const existingPermissions = await ctx.db
    .query('permissions')
    .filter((q) => q.eq(q.field('isActive'), true))
    .collect();

  const existingCodes = new Set(existingPermissions.map((p) => p.code));
  const invalidCodes = permissionCodes.filter((code) => !existingCodes.has(code));

  if (invalidCodes.length > 0) {
    throw new Error(`Invalid permission codes: ${invalidCodes.join(', ')}`);
  }

  // Process each user
  const results = [];
  for (const userId of userIds) {
    try {
      // Get user
      const user = await ctx.db.get(userId);
      if (!user || user.isDeleted) {
        results.push({ userId, success: false, error: 'User not found' });
        continue;
      }

      // Get current permissions
      const currentPermissions = user.permissions || [];

      let updatedPermissions;
      if (overwrite) {
        // Replace all permissions
        updatedPermissions = permissions;
      } else {
        // Merge with existing permissions
        updatedPermissions = [...currentPermissions];

        for (const newPerm of permissions) {
          const existingIndex = updatedPermissions.findIndex((p) => p.permissionCode === newPerm.permissionCode);
          if (existingIndex >= 0) {
            updatedPermissions[existingIndex] = newPerm;
          } else {
            updatedPermissions.push(newPerm);
          }
        }
      }

      // Update user
      await ctx.db.patch(userId, {
        permissions: updatedPermissions,
        updatedAt: Date.now(),
      });

      results.push({ userId, success: true });
    } catch (error) {
      results.push({
        userId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Count successes and failures
  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  // Log the action
  await logAction(
    ctx,
    'bulk_assign_user_permissions',
    'SECURITY_EVENT',
    'HIGH',
    `Bulk assigned permissions to ${successCount} users (${failureCount} failures)`,
    currentUser._id,
    undefined,
    {
      totalUsers: userIds.length,
      successCount,
      failureCount,
      permissionCodes,
      overwrite,
      results: results.filter((r) => !r.success), // Log only failures for debugging
    }
  );

  return {
    success: true,
    processed: userIds.length,
    succeeded: successCount,
    failed: failureCount,
    results,
  };
};
