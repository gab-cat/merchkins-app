import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireOrganizationAdmin, logAction } from '../../helpers';

// Assign permission to an organization member
export const assignOrganizationPermissionArgs = {
  organizationId: v.id('organizations'),
  userId: v.id('users'),
  permissionCode: v.string(),
  canCreate: v.boolean(),
  canRead: v.boolean(),
  canUpdate: v.boolean(),
  canDelete: v.boolean(),
};

export const assignOrganizationPermissionHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId: Id<'organizations'>;
    userId: Id<'users'>;
    permissionCode: string;
    canCreate: boolean;
    canRead: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  }
) => {
  const { organizationId, userId, permissionCode, canCreate, canRead, canUpdate, canDelete } = args;

  // Require organization admin privileges
  const { user: currentUser } = await requireOrganizationAdmin(ctx, organizationId);

  // Check if permission definition exists
  const permission = await ctx.db
    .query('permissions')
    .withIndex('by_code', (q) => q.eq('code', permissionCode))
    .filter((q) => q.eq(q.field('isActive'), true))
    .first();

  if (!permission) {
    throw new Error('Permission not found or inactive');
  }

  // Get organization member
  const member = await ctx.db
    .query('organizationMembers')
    .withIndex('by_user_organization', (q) => q.eq('userId', userId).eq('organizationId', organizationId))
    .filter((q) => q.eq(q.field('isActive'), true))
    .first();

  if (!member) {
    throw new Error('User is not an active member of this organization');
  }

  // Get current member permissions
  const currentPermissions = member.permissions || [];

  // Check if member already has this permission
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

  // Update organization member with new permissions
  await ctx.db.patch(member._id, {
    permissions: updatedPermissions,
    updatedAt: Date.now(),
  });

  // Log the action
  await logAction(
    ctx,
    'assign_organization_permission',
    'SECURITY_EVENT',
    'MEDIUM',
    `${action} organization permission ${permissionCode} for member ${member.userInfo.firstName} ${member.userInfo.lastName}`,
    currentUser._id,
    organizationId,
    {
      targetUserId: userId,
      targetUserEmail: member.userInfo.email,
      permissionCode,
      permissions: { canCreate, canRead, canUpdate, canDelete },
      action,
      permissionName: permission.name,
      permissionCategory: permission.category,
      memberRole: member.role,
    }
  );

  return { success: true };
};
