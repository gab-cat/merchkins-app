import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { requireStaffOrAdmin } from '../../helpers';

// Get permission usage analytics
export const getPermissionAnalyticsArgs = {
  permissionCode: v.optional(v.string()),
  category: v.optional(
    v.union(
      v.literal('USER_MANAGEMENT'),
      v.literal('PRODUCT_MANAGEMENT'),
      v.literal('ORDER_MANAGEMENT'),
      v.literal('PAYMENT_MANAGEMENT'),
      v.literal('ORGANIZATION_MANAGEMENT'),
      v.literal('SYSTEM_ADMINISTRATION')
    )
  ),
};

export const getPermissionAnalyticsHandler = async (
  ctx: QueryCtx,
  args: {
    permissionCode?: string;
    category?:
      | 'USER_MANAGEMENT'
      | 'PRODUCT_MANAGEMENT'
      | 'ORDER_MANAGEMENT'
      | 'PAYMENT_MANAGEMENT'
      | 'ORGANIZATION_MANAGEMENT'
      | 'SYSTEM_ADMINISTRATION';
  }
) => {
  // Require staff or admin to view analytics
  await requireStaffOrAdmin(ctx);

  const { permissionCode, category } = args;

  if (permissionCode) {
    // Analytics for a specific permission
    return await getPermissionUsageStats(ctx, permissionCode);
  } else if (category) {
    // Analytics for a category
    return await getCategoryAnalytics(ctx, category);
  } else {
    // Overall permission analytics
    return await getOverallAnalytics(ctx);
  }
};

// Helper function to get usage stats for a specific permission
async function getPermissionUsageStats(ctx: QueryCtx, permissionCode: string) {
  // Get permission definition
  const permission = await ctx.db
    .query('permissions')
    .withIndex('by_code', (q) => q.eq('code', permissionCode))
    .first();

  if (!permission) {
    throw new Error('Permission not found');
  }

  // Count users with this permission
  const allUsers = await ctx.db
    .query('users')
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .collect();

  const usersWithPermission = allUsers.filter((user) => user.permissions?.some((p) => p.permissionCode === permissionCode));

  // Count organization members with this permission
  const allOrgMembers = await ctx.db
    .query('organizationMembers')
    .filter((q) => q.eq(q.field('isActive'), true))
    .collect();

  const membersWithPermission = allOrgMembers.filter((member) => member.permissions?.some((p) => p.permissionCode === permissionCode));

  // Calculate permission combinations
  const permissionCombinations = new Map<string, number>();

  [...usersWithPermission, ...membersWithPermission].forEach((entity) => {
    const otherPermissions = (entity.permissions || [])
      .filter((p) => p.permissionCode !== permissionCode)
      .map((p) => p.permissionCode)
      .sort();

    const combination = otherPermissions.join(',');
    permissionCombinations.set(combination, (permissionCombinations.get(combination) || 0) + 1);
  });

  return {
    permission: {
      code: permission.code,
      name: permission.name,
      category: permission.category,
      isActive: permission.isActive,
      isSystemPermission: permission.isSystemPermission,
    },
    usage: {
      totalUsers: usersWithPermission.length,
      totalOrgMembers: membersWithPermission.length,
      totalEntities: usersWithPermission.length + membersWithPermission.length,
    },
    userBreakdown: {
      admins: usersWithPermission.filter((u) => u.isAdmin).length,
      staff: usersWithPermission.filter((u) => u.isStaff).length,
      merchants: usersWithPermission.filter((u) => u.isMerchant).length,
      regular: usersWithPermission.filter((u) => !u.isAdmin && !u.isStaff && !u.isMerchant).length,
    },
    orgMemberBreakdown: {
      admins: membersWithPermission.filter((m) => m.role === 'ADMIN').length,
      staff: membersWithPermission.filter((m) => m.role === 'STAFF').length,
      members: membersWithPermission.filter((m) => m.role === 'MEMBER').length,
    },
    commonCombinations: Array.from(permissionCombinations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([combination, count]) => ({
        permissions: combination.split(',').filter((p) => p),
        count,
      })),
  };
}

// Helper function to get analytics for a category
async function getCategoryAnalytics(
  ctx: QueryCtx,
  category: 'USER_MANAGEMENT' | 'PRODUCT_MANAGEMENT' | 'ORDER_MANAGEMENT' | 'PAYMENT_MANAGEMENT' | 'ORGANIZATION_MANAGEMENT' | 'SYSTEM_ADMINISTRATION'
) {
  const permissions = await ctx.db
    .query('permissions')
    .withIndex('by_category', (q) => q.eq('category', category))
    .collect();

  const activePermissions = permissions.filter((p) => p.isActive);
  const systemPermissions = permissions.filter((p) => p.isSystemPermission);

  return {
    category,
    summary: {
      totalPermissions: permissions.length,
      activePermissions: activePermissions.length,
      inactivePermissions: permissions.length - activePermissions.length,
      systemPermissions: systemPermissions.length,
    },
    permissions: permissions.map((p) => ({
      code: p.code,
      name: p.name,
      isActive: p.isActive,
      isSystemPermission: p.isSystemPermission,
      createdAt: p.createdAt,
    })),
  };
}

// Helper function to get overall analytics
async function getOverallAnalytics(ctx: QueryCtx) {
  const allPermissions = await ctx.db.query('permissions').collect();
  const allUsers = await ctx.db
    .query('users')
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .collect();
  const allOrgMembers = await ctx.db
    .query('organizationMembers')
    .filter((q) => q.eq(q.field('isActive'), true))
    .collect();

  // Category breakdown
  const categoryStats = new Map<string, { total: number; active: number; system: number }>();

  allPermissions.forEach((permission) => {
    const current = categoryStats.get(permission.category) || { total: 0, active: 0, system: 0 };
    current.total++;
    if (permission.isActive) current.active++;
    if (permission.isSystemPermission) current.system++;
    categoryStats.set(permission.category, current);
  });

  // User permission stats
  const usersWithPermissions = allUsers.filter((u) => u.permissions && u.permissions.length > 0);
  const orgMembersWithPermissions = allOrgMembers.filter((m) => m.permissions && m.permissions.length > 0);

  return {
    summary: {
      totalPermissions: allPermissions.length,
      activePermissions: allPermissions.filter((p) => p.isActive).length,
      systemPermissions: allPermissions.filter((p) => p.isSystemPermission).length,
      totalUsers: allUsers.length,
      usersWithPermissions: usersWithPermissions.length,
      totalOrgMembers: allOrgMembers.length,
      orgMembersWithPermissions: orgMembersWithPermissions.length,
    },
    categoryBreakdown: Array.from(categoryStats.entries()).map(([category, stats]) => ({
      category,
      ...stats,
    })),
    averagePermissionsPerUser:
      usersWithPermissions.length > 0
        ? usersWithPermissions.reduce((sum, user) => sum + (user.permissions?.length || 0), 0) / usersWithPermissions.length
        : 0,
    averagePermissionsPerOrgMember:
      orgMembersWithPermissions.length > 0
        ? orgMembersWithPermissions.reduce((sum, member) => sum + (member.permissions?.length || 0), 0) / orgMembersWithPermissions.length
        : 0,
  };
}
