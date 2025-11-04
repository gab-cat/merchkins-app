import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireSelfOrAdmin } from '../../helpers';

// Get permissions for a specific user
export const getUserPermissionsArgs = {
  userId: v.id('users'),
  includeInactive: v.optional(v.boolean()),
};

export const getUserPermissionsHandler = async (
  ctx: QueryCtx,
  args: {
    userId: Id<'users'>;
    includeInactive?: boolean;
  }
) => {
  // Allow users to view their own permissions or admins to view any
  await requireSelfOrAdmin(ctx, args.userId);

  const { includeInactive = false } = args;

  // Get user
  const user = await ctx.db.get(args.userId);
  if (!user || user.isDeleted) {
    return null;
  }

  // Get user's embedded permissions
  const userPermissions = user.permissions || [];

  // Get permission definitions for additional details
  const permissionDefinitions = await ctx.db
    .query('permissions')
    .filter((q) => (includeInactive ? q.eq(q.field('isActive'), true) : q.eq(q.field('isActive'), true)))
    .collect();

  // If including inactive, get all permissions
  if (includeInactive) {
    const allPermissions = await ctx.db.query('permissions').collect();
    permissionDefinitions.push(...allPermissions.filter((p) => !p.isActive));
  }

  // Create a map for quick lookup
  const permissionMap = new Map(permissionDefinitions.map((p) => [p.code, p]));

  // Combine user permissions with definitions
  const detailedPermissions = userPermissions
    .map((userPerm) => {
      const definition = permissionMap.get(userPerm.permissionCode);
      return {
        ...userPerm,
        definition: definition || null,
        isActive: definition?.isActive || false,
      };
    })
    .filter((p) => includeInactive || p.isActive);

  return {
    userId: args.userId,
    userEmail: user.email,
    userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    isAdmin: user.isAdmin,
    isStaff: user.isStaff,
    isMerchant: user.isMerchant,
    permissions: detailedPermissions,
    permissionCount: detailedPermissions.length,
  };
};
