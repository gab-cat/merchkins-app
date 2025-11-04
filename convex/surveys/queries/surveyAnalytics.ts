import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireOrganizationPermission } from '../../helpers';

export const getSurveyAnalyticsArgs = {
  organizationId: v.optional(v.id('organizations')),
  categoryId: v.optional(v.id('surveyCategories')),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
};

export const getSurveyAnalyticsHandler = async (
  ctx: QueryCtx,
  args: { organizationId?: Id<'organizations'>; categoryId?: Id<'surveyCategories'>; dateFrom?: number; dateTo?: number }
) => {
  if (args.organizationId) {
    await requireOrganizationPermission(ctx, args.organizationId, 'MANAGE_ORDERS', 'read');
  }

  let query;
  if (args.categoryId) {
    query = ctx.db.query('surveyResponses').withIndex('by_category', (ix) => ix.eq('categoryId', args.categoryId!));
  } else if (args.dateFrom || args.dateTo) {
    query = ctx.db.query('surveyResponses').withIndex('by_submit_date', (ix) => ix.gte('submitDate', args.dateFrom ?? 0));
  } else {
    query = ctx.db.query('surveyResponses');
  }

  const list = await query.collect();

  // Filter by organization if provided
  const rows = [] as typeof list;
  for (const r of list) {
    if (args.organizationId) {
      const order = await ctx.db.get(r.orderId);
      if (!order || order.organizationId !== args.organizationId) continue;
    }
    if (args.dateTo && r.submitDate > args.dateTo) continue;
    rows.push(r);
  }

  const total = rows.length;
  const positives = rows.filter((r) => r.isPositive).length;
  const avgScore = total > 0 ? rows.reduce((s, r) => s + r.overallScore, 0) / total : 0;
  const avgResponseTime = total > 0 ? Math.round(rows.reduce((s, r) => s + (r.responseTime ?? 0), 0) / total) : 0;

  // Top categories by score and by responses
  const byCategory: Record<string, { count: number; sum: number }> = {};
  for (const r of rows) {
    const key = String(r.categoryId);
    byCategory[key] = byCategory[key] || { count: 0, sum: 0 };
    byCategory[key].count += 1;
    byCategory[key].sum += r.overallScore;
  }
  const categoryStats = Object.entries(byCategory).map(([key, v]) => ({ categoryId: key, count: v.count, average: v.sum / v.count }));
  categoryStats.sort((a, b) => b.average - a.average);
  const topCategoriesByScore = categoryStats.slice(0, 5);
  const topCategoriesByResponses = [...categoryStats].sort((a, b) => b.count - a.count).slice(0, 5);

  // Recent comments (last 10 with comments)
  const recentComments = rows
    .filter((r) => r.comments && r.comments.trim().length > 0)
    .sort((a, b) => b.submitDate - a.submitDate)
    .slice(0, 10)
    .map((r) => ({ surveyResponseId: r._id, submitDate: r.submitDate, comment: r.comments }));

  return {
    totalResponses: total,
    positiveResponses: positives,
    positiveRate: total > 0 ? positives / total : 0,
    averageScore: avgScore,
    averageResponseTime: avgResponseTime,
    topCategoriesByScore,
    topCategoriesByResponses,
    recentComments,
  };
};
