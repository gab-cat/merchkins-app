import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireOrganizationPermission, requireAuthentication } from '../../helpers';

export const getSurveyResponseByIdArgs = { surveyResponseId: v.id('surveyResponses') };

export const getSurveyResponseByIdHandler = async (ctx: QueryCtx, args: { surveyResponseId: Id<'surveyResponses'> }) => {
  const user = await requireAuthentication(ctx);
  const doc = await ctx.db.get(args.surveyResponseId);
  if (!doc) return null;

  // Access control: if order has organization, require org permission; else allow admin or order owner
  const order = await ctx.db.get(doc.orderId);
  if (!order) return null;
  if (order.organizationId) {
    await requireOrganizationPermission(ctx, order.organizationId, 'MANAGE_ORDERS', 'read');
  } else if (!(user.isAdmin || user._id === order.customerId)) {
    throw new Error('Permission denied');
  }
  return doc;
};

export const searchSurveyResponsesArgs = {
  organizationId: v.optional(v.id('organizations')),
  categoryId: v.optional(v.id('surveyCategories')),
  isPositive: v.optional(v.boolean()),
  needsFollowUp: v.optional(v.boolean()),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
  limit: v.optional(v.number()),
};

export const searchSurveyResponsesHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<'organizations'>;
    categoryId?: Id<'surveyCategories'>;
    isPositive?: boolean;
    needsFollowUp?: boolean;
    dateFrom?: number;
    dateTo?: number;
    limit?: number;
  }
) => {
  const user = await requireAuthentication(ctx);
  // Choose best index
  let baseQuery;
  if (args.categoryId) {
    baseQuery = ctx.db.query('surveyResponses').withIndex('by_category', (ix) => ix.eq('categoryId', args.categoryId!));
  } else if (args.isPositive !== undefined) {
    baseQuery = ctx.db.query('surveyResponses').withIndex('by_positive', (ix) => ix.eq('isPositive', args.isPositive!));
  } else if (args.needsFollowUp !== undefined) {
    baseQuery = ctx.db.query('surveyResponses').withIndex('by_needs_followup', (ix) => ix.eq('needsFollowUp', args.needsFollowUp!));
  } else if (args.dateFrom) {
    baseQuery = ctx.db.query('surveyResponses').withIndex('by_submit_date', (ix) => ix.gte('submitDate', args.dateFrom!));
  } else {
    baseQuery = ctx.db.query('surveyResponses');
  }

  // Apply remaining filters
  const filteredQuery = baseQuery.filter((q) => {
    const conditions = [] as any[];
    if (args.isPositive !== undefined) {
      conditions.push(q.eq(q.field('isPositive'), args.isPositive));
    }
    if (args.needsFollowUp !== undefined) {
      conditions.push(q.eq(q.field('needsFollowUp'), args.needsFollowUp));
    }
    if (args.dateFrom) {
      conditions.push(q.gte(q.field('submitDate'), args.dateFrom));
    }
    if (args.dateTo) {
      conditions.push(q.lte(q.field('submitDate'), args.dateTo));
    }
    return conditions.length > 0 ? q.and(...conditions) : q.and();
  });

  let rows = await filteredQuery.collect();

  // If filtering by organization, enforce permission and filter by order.org
  if (args.organizationId) {
    await requireOrganizationPermission(ctx, args.organizationId, 'MANAGE_ORDERS', 'read');
    const filtered: typeof rows = [];
    for (const r of rows) {
      const order = await ctx.db.get(r.orderId);
      if (order && order.organizationId === args.organizationId) filtered.push(r);
    }
    rows = filtered;
  } else {
    // Otherwise restrict visibility to admin/staff or owner of order
    if (!(user.isAdmin || user.isStaff)) {
      const filtered: typeof rows = [];
      for (const r of rows) {
        const order = await ctx.db.get(r.orderId);
        if (order && order.customerId === user._id) filtered.push(r);
      }
      rows = filtered;
    }
  }

  rows.sort((a, b) => b.submitDate - a.submitDate);
  const limit = Math.max(1, Math.min(args.limit ?? 50, 200));
  return rows.slice(0, limit);
};
