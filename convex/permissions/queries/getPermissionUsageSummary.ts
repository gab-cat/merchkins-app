import { MutationCtx, QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { requireStaffOrAdmin } from '../../helpers';

// Get permission usage summary across the system
export const getPermissionUsageSummaryArgs = {
  permissionCode: v.optional(v.string()),
};

export const getPermissionUsageSummaryHandler = async (ctx: QueryCtx, args: { permissionCode?: string }) => {
  // Require staff or admin to view usage summary
  await requireStaffOrAdmin(ctx);

  const { permissionCode } = args;

  if (permissionCode) {
    // Get usage for a specific permission
    return await getSpecificPermissionUsage(ctx, permissionCode);
  } else {
    // Get overall usage summary
    return await getOverallUsageSummary(ctx);
  }
};

// Helper function to get usage for a specific permission
async function getSpecificPermissionUsage(ctx: MutationCtx | QueryCtx, permissionCode: string) {
  // Get permission definition
  const permission = await ctx.db
    .query('permissions')
    .withIndex('by_code', (q) => q.eq('code', permissionCode))
    .first();

  if (!permission) {
    throw new Error('Permission not found');
  }

  // Get all users with this permission
  const allUsers = await ctx.db
    .query('users')
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .collect();

  const usersWithPermission = allUsers.filter((user) => user.permissions?.some((p) => p.permissionCode === permissionCode));

  // Get all organization members with this permission
  const allOrgMembers = await ctx.db
    .query('organizationMembers')
    .filter((q) => q.eq(q.field('isActive'), true))
    .collect();

  const membersWithPermission = allOrgMembers.filter((member) => member.permissions?.some((p) => p.permissionCode === permissionCode));

  // Get organizations that have members with this permission
  const organizationsWithPermission = new Set(membersWithPermission.map((member) => member.organizationId));

  // Get organization details for members
  const organizationMap = new Map();
  for (const orgId of organizationsWithPermission) {
    const org = await ctx.db.get(orgId);
    if (org) {
      organizationMap.set(orgId, org.name);
    }
  }

  return {
    permission: {
      code: permission.code,
      name: permission.name,
      category: permission.category,
      description: permission.description,
      isActive: permission.isActive,
      isSystemPermission: permission.isSystemPermission,
    },
    usage: {
      totalDirectUsers: usersWithPermission.length,
      totalOrgMembers: membersWithPermission.length,
      totalOrganizations: organizationsWithPermission.size,
      totalEntities: usersWithPermission.length + membersWithPermission.length,
    },
    userDetails: usersWithPermission.map((user) => {
      const userFullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
      const userPermission = user.permissions?.find((p) => p.permissionCode === permissionCode);

      return {
        _id: user._id,
        email: user.email,
        name: userFullName,
        role: user.isAdmin ? 'ADMIN' : user.isStaff ? 'STAFF' : user.isMerchant ? 'MERCHANT' : 'USER',
        permission: userPermission,
      };
    }),
    memberDetails: membersWithPermission.map((member) => {
      const memberPermission = member.permissions?.find((p) => p.permissionCode === permissionCode);

      return {
        _id: member._id,
        userId: member.userId,
        organizationId: member.organizationId,
        organizationName: organizationMap.get(member.organizationId) || 'Unknown Organization',
        role: member.role,
        permission: memberPermission,
        joinedAt: member.joinedAt,
      };
    }),
  };
}

// Helper function to get overall usage summary
async function getOverallUsageSummary(ctx: MutationCtx | QueryCtx) {
  // Get all permissions
  const allPermissions = await ctx.db.query('permissions').collect();

  // Get all users
  const allUsers = await ctx.db
    .query('users')
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .collect();

  // Get all organization members
  const allOrgMembers = await ctx.db
    .query('organizationMembers')
    .filter((q) => q.eq(q.field('isActive'), true))
    .collect();

  // Calculate usage statistics
  const usersWithAnyPermission = allUsers.filter((user) => user.permissions && user.permissions.length > 0);

  const membersWithAnyPermission = allOrgMembers.filter((member) => member.permissions && member.permissions.length > 0);

  // Calculate permission usage by category
  const categoryUsage = new Map();

  allPermissions.forEach((permission) => {
    const category = permission.category;

    if (!categoryUsage.has(category)) {
      categoryUsage.set(category, {
        category,
        totalPermissions: 0,
        activePermissions: 0,
        systemPermissions: 0,
        userAssignments: 0,
        memberAssignments: 0,
      });
    }

    const stats = categoryUsage.get(category);
    stats.totalPermissions++;

    if (permission.isActive) {
      stats.activePermissions++;
    }

    if (permission.isSystemPermission) {
      stats.systemPermissions++;
    }

    // Count assignments
    stats.userAssignments += allUsers.filter((user) => user.permissions?.some((p) => p.permissionCode === permission.code)).length;

    stats.memberAssignments += allOrgMembers.filter((member) => member.permissions?.some((p) => p.permissionCode === permission.code)).length;
  });

  // Find most and least used permissions
  const permissionUsageCounts = allPermissions.map((permission) => {
    const userCount = allUsers.filter((user) => user.permissions?.some((p) => p.permissionCode === permission.code)).length;

    const memberCount = allOrgMembers.filter((member) => member.permissions?.some((p) => p.permissionCode === permission.code)).length;

    return {
      permission: {
        code: permission.code,
        name: permission.name,
        category: permission.category,
      },
      totalUsage: userCount + memberCount,
      userUsage: userCount,
      memberUsage: memberCount,
    };
  });

  permissionUsageCounts.sort((a, b) => b.totalUsage - a.totalUsage);

  return {
    summary: {
      totalPermissions: allPermissions.length,
      activePermissions: allPermissions.filter((p) => p.isActive).length,
      systemPermissions: allPermissions.filter((p) => p.isSystemPermission).length,
      totalUsers: allUsers.length,
      usersWithPermissions: usersWithAnyPermission.length,
      totalOrgMembers: allOrgMembers.length,
      membersWithPermissions: membersWithAnyPermission.length,
    },
    categoryBreakdown: Array.from(categoryUsage.values()),
    mostUsedPermissions: permissionUsageCounts.slice(0, 10),
    leastUsedPermissions: permissionUsageCounts.slice(-10).reverse(),
    unusedPermissions: permissionUsageCounts.filter((p) => p.totalUsage === 0),
  };
}
