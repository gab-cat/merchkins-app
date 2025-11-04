import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission, requireStaffOrAdmin } from '../../helpers';

export const getLogAnalyticsArgs = {
  organizationId: v.optional(v.id('organizations')),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
};

export const getLogAnalyticsHandler = async (ctx: QueryCtx, args: { organizationId?: Id<'organizations'>; dateFrom?: number; dateTo?: number }) => {
  await requireAuthentication(ctx);

  let query;
  if (args.organizationId) {
    await requireOrganizationPermission(ctx, args.organizationId, 'VIEW_LOGS', 'read');
    query = ctx.db.query('logs').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
  } else {
    await requireStaffOrAdmin(ctx);
    query = ctx.db.query('logs');
  }

  const rows = await query.collect();
  const filtered = rows.filter((r) => {
    if (args.dateFrom && r.createdDate < args.dateFrom) return false;
    if (args.dateTo && r.createdDate > args.dateTo) return false;
    return true;
  });

  const total = filtered.length;
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const byAction: Record<string, number> = {};

  for (const row of filtered) {
    byType[row.logType] = (byType[row.logType] || 0) + 1;
    bySeverity[row.severity] = (bySeverity[row.severity] || 0) + 1;
    if (row.action) {
      byAction[row.action] = (byAction[row.action] || 0) + 1;
    }
  }

  const topActions = Object.entries(byAction)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([action, count]) => ({ action, count }));

  const byResource: Record<string, number> = {};
  for (const row of filtered) {
    if (row.resourceType && row.resourceId) {
      const key = `${row.resourceType}:${row.resourceId}`;
      byResource[key] = (byResource[key] || 0) + 1;
    }
  }
  const topResources = Object.entries(byResource)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([key, count]) => {
      const [resourceType, resourceId] = key.split(':');
      return { resourceType, resourceId, count };
    });

  return {
    total,
    byType,
    bySeverity,
    topActions,
    topResources,
  };
};
