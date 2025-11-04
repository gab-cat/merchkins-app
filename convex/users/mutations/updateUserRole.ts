import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAdmin, validateUserExists, logAction } from '../../helpers';

// Update user role permissions
export const updateUserRoleArgs = {
  userId: v.id('users'),
  isStaff: v.optional(v.boolean()),
  isAdmin: v.optional(v.boolean()),
  isMerchant: v.optional(v.boolean()),
  managerId: v.optional(v.id('users')),
};

export const updateUserRoleHandler = async (
  ctx: MutationCtx,
  args: {
    userId: Id<'users'>;
    isStaff?: boolean;
    isAdmin?: boolean;
    isMerchant?: boolean;
    managerId?: Id<'users'>;
  }
) => {
  const { userId, isStaff, isAdmin, isMerchant, managerId } = args;

  // Require admin permissions for role changes
  const currentUser = await requireAdmin(ctx);

  // Validate target user exists
  const user = await validateUserExists(ctx, userId);

  let managerInfo;

  // If managerId is provided, validate and get manager info
  if (managerId) {
    const manager = await validateUserExists(ctx, managerId);

    managerInfo = {
      firstName: manager.firstName,
      lastName: manager.lastName,
      email: manager.email,
      imageUrl: manager.imageUrl,
    };
  }

  // Prepare updates object
  const updates: Record<string, unknown> = {
    updatedAt: Date.now(),
  };

  if (isStaff !== undefined) updates.isStaff = isStaff;
  if (isAdmin !== undefined) updates.isAdmin = isAdmin;
  if (isMerchant !== undefined) updates.isMerchant = isMerchant;
  if (managerId !== undefined) {
    updates.managerId = managerId;
    updates.managerInfo = managerInfo;
  }

  // Track what changed for logging
  const changedRoles: string[] = [];
  if (isStaff !== undefined && isStaff !== user.isStaff) {
    changedRoles.push(`staff: ${user.isStaff} → ${isStaff}`);
  }
  if (isAdmin !== undefined && isAdmin !== user.isAdmin) {
    changedRoles.push(`admin: ${user.isAdmin} → ${isAdmin}`);
  }
  if (isMerchant !== undefined && isMerchant !== user.isMerchant) {
    changedRoles.push(`merchant: ${user.isMerchant} → ${isMerchant}`);
  }
  if (managerId !== undefined && managerId !== user.managerId) {
    changedRoles.push(`manager: ${user.managerId || 'none'} → ${managerId || 'none'}`);
  }

  // Update user role
  await ctx.db.patch(userId, updates);

  // Log the action
  await logAction(
    ctx,
    'update_user_role',
    'SECURITY_EVENT',
    'HIGH',
    `Updated user roles for ${user.firstName} ${user.lastName}: ${changedRoles.join(', ')}`,
    currentUser._id,
    undefined,
    {
      targetUserId: userId,
      targetUserEmail: user.email,
      roleChanges: changedRoles,
      previousRoles: {
        isStaff: user.isStaff,
        isAdmin: user.isAdmin,
        isMerchant: user.isMerchant,
        managerId: user.managerId,
      },
      newRoles: {
        isStaff,
        isAdmin,
        isMerchant,
        managerId,
      },
    }
  );

  return { success: true };
};
