import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { logAction, requireOrganizationPermission } from '../../helpers';

// Update member role and permissions
export const updateMemberRoleArgs = {
  organizationId: v.id('organizations'),
  userId: v.id('users'),
  role: v.union(v.literal('ADMIN'), v.literal('STAFF'), v.literal('MEMBER')),
  permissions: v.optional(
    v.array(
      v.object({
        permissionCode: v.string(),
        canCreate: v.boolean(),
        canRead: v.boolean(),
        canUpdate: v.boolean(),
        canDelete: v.boolean(),
      })
    )
  ),
};

export const updateMemberRoleHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId: Id<'organizations'>;
    userId: Id<'users'>;
    role: 'ADMIN' | 'STAFF' | 'MEMBER';
    permissions?: Array<{
      permissionCode: string;
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }>;
  }
) => {
  const { organizationId, userId, role, permissions = [] } = args;
  // Ensure actor has manage_members permission for this org
  await requireOrganizationPermission(ctx, organizationId, 'MANAGE_MEMBERS', 'update');

  // Get membership
  const membership = await ctx.db
    .query('organizationMembers')
    .withIndex('by_user_organization', (q) => q.eq('userId', userId).eq('organizationId', organizationId))
    .filter((q) => q.eq(q.field('isActive'), true))
    .first();

  if (!membership) {
    throw new Error('User is not a member of this organization');
  }

  const oldRole = membership.role;

  // Check if removing admin role would leave no admins
  if (oldRole === 'ADMIN' && role !== 'ADMIN') {
    const adminCount = await ctx.db
      .query('organizationMembers')
      .withIndex('by_organization_role', (q) => q.eq('organizationId', organizationId).eq('role', 'ADMIN'))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    if (adminCount.length <= 1) {
      throw new Error('Cannot remove admin role from the last admin');
    }
  }

  // Update member role and permissions
  await ctx.db.patch(membership._id, {
    role,
    permissions,
    updatedAt: Date.now(),
  });

  // Update organization admin count if role changed
  if (oldRole !== role) {
    const organization = await ctx.db.get(organizationId);
    if (organization) {
      let newAdminCount = organization.adminCount;

      if (oldRole === 'ADMIN' && role !== 'ADMIN') {
        newAdminCount = Math.max(0, organization.adminCount - 1);
      } else if (oldRole !== 'ADMIN' && role === 'ADMIN') {
        newAdminCount = organization.adminCount + 1;
      }

      await ctx.db.patch(organizationId, {
        adminCount: newAdminCount,
        updatedAt: Date.now(),
      });
    }
  }

  // Audit log
  await logAction(
    ctx,
    'update_member_role',
    'AUDIT_TRAIL',
    'HIGH',
    `Updated role for member ${userId} in organization ${organizationId} from ${oldRole} to ${role}`,
    userId,
    organizationId,
    { oldRole, newRole: role, permissions },
    {
      resourceType: 'organization_member',
      resourceId: membership._id as unknown as string,
      previousValue: { role: oldRole },
      newValue: { role },
    }
  );

  return { success: true };
};
