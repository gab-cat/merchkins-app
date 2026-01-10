import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireOrganizationPermission, validateUserExists, requireActiveOrganization, logAction } from '../../helpers';

// Add member to organization
export const addMemberArgs = {
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

export const addMemberHandler = async (
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

  // Require organization admin or manage_members permission
  const { user: currentUser } = await requireOrganizationPermission(ctx, organizationId, 'MANAGE_MEMBERS', 'create');

  // Validate organization and user exist
  const organization = await requireActiveOrganization(ctx, organizationId);
  const user = await validateUserExists(ctx, userId);

  // Check if user is already a member
  const existingMembership = await ctx.db
    .query('organizationMembers')
    .withIndex('by_user_organization', (q) => q.eq('userId', userId).eq('organizationId', organizationId))
    .first();

  if (existingMembership) {
    if (existingMembership.isActive) {
      throw new Error('User is already an active member of this organization');
    }

    // Reactivate the member instead of creating a new one
    await ctx.db.patch(existingMembership._id, {
      role,
      permissions,
      isActive: true,
      lastActiveAt: Date.now(),
      updatedAt: Date.now(),
    });
  } else {
    // Add new member
    await ctx.db.insert('organizationMembers', {
      userId,
      organizationId,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        imageUrl: user.imageUrl,
        isStaff: user.isStaff,
      },
      organizationInfo: {
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        organizationType: organization.organizationType,
      },
      role,
      isActive: true,
      joinedAt: Date.now(),
      lastActiveAt: Date.now(),
      permissions,
      orderCount: 0,
      messageCount: 0,
      updatedAt: Date.now(),
    });
  }

  // Update organization member count
  const activeMembers = await ctx.db
    .query('organizationMembers')
    .withIndex('by_organization_active', (q) => q.eq('organizationId', organizationId).eq('isActive', true))
    .collect();

  const adminCount = activeMembers.filter((m) => m.role === 'ADMIN').length;

  await ctx.db.patch(organizationId, {
    memberCount: activeMembers.length,
    adminCount,
    updatedAt: Date.now(),
  });

  // Log the action
  await logAction(
    ctx,
    'add_organization_member',
    'DATA_CHANGE',
    'MEDIUM',
    `Added ${user.firstName} ${user.lastName} as ${role} to organization ${organization.name}`,
    currentUser._id,
    organizationId,
    {
      addedUserId: userId,
      addedUserEmail: user.email,
      role,
      isReactivation: !!existingMembership,
    }
  );

  return { success: true };
};
