import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

// Get organization analytics
export const getOrganizationAnalyticsArgs = {
  organizationId: v.optional(v.id('organizations')),
  timeRange: v.optional(v.union(v.literal('7d'), v.literal('30d'), v.literal('90d'), v.literal('1y'))),
};

export const getOrganizationAnalyticsHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<'organizations'>;
    timeRange?: '7d' | '30d' | '90d' | '1y';
  }
) => {
  const { organizationId, timeRange = '30d' } = args;

  // Calculate time range in milliseconds
  const now = Date.now();
  const timeRanges = {
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
    '1y': 365 * 24 * 60 * 60 * 1000,
  };
  const cutoffTime = now - timeRanges[timeRange];

  if (organizationId) {
    // Get specific organization analytics
    const organization = await ctx.db.get(organizationId);
    if (!organization || organization.isDeleted) {
      throw new Error('Organization not found');
    }

    // Get recent member activity
    const recentlyActiveMembers = await ctx.db
      .query('organizationMembers')
      .withIndex('by_organization', (q) => q.eq('organizationId', organizationId))
      .filter((q) => q.and(q.eq(q.field('isActive'), true), q.gte(q.field('lastActiveAt'), cutoffTime)))
      .collect();

    return {
      memberCount: organization.memberCount,
      adminCount: organization.adminCount,
      activeProductCount: organization.activeProductCount,
      totalOrderCount: organization.totalOrderCount,
      recentlyActiveMembers: recentlyActiveMembers.length,
      organizationType: organization.organizationType,
      createdAt: organization.createdAt,
    };
  } else {
    // Get platform-wide organization analytics
    const allOrganizations = await ctx.db
      .query('organizations')
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect();

    const totalOrganizations = allOrganizations.length;
    const publicOrganizations = allOrganizations.filter((org) => org.organizationType === 'PUBLIC').length;
    const privateOrganizations = allOrganizations.filter((org) => org.organizationType === 'PRIVATE').length;
    const secretOrganizations = allOrganizations.filter((org) => org.organizationType === 'SECRET').length;

    const totalMembers = allOrganizations.reduce((sum, org) => sum + org.memberCount, 0);
    const totalAdmins = allOrganizations.reduce((sum, org) => sum + org.adminCount, 0);
    const totalProducts = allOrganizations.reduce((sum, org) => sum + org.activeProductCount, 0);
    const totalOrders = allOrganizations.reduce((sum, org) => sum + org.totalOrderCount, 0);

    return {
      totalOrganizations,
      publicOrganizations,
      privateOrganizations,
      secretOrganizations,
      totalMembers,
      totalAdmins,
      totalProducts,
      totalOrders,
      averageMembersPerOrg: totalOrganizations > 0 ? totalMembers / totalOrganizations : 0,
      averageOrdersPerOrg: totalOrganizations > 0 ? totalOrders / totalOrganizations : 0,
    };
  }
};
