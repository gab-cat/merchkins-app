import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';

export const getPayoutInvoicesArgs = {
  organizationId: v.optional(v.id('organizations')),
  status: v.optional(v.union(v.literal('PENDING'), v.literal('PROCESSING'), v.literal('PAID'), v.literal('CANCELLED'))),
  periodStart: v.optional(v.number()),
  periodEnd: v.optional(v.number()),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
};

export const getPayoutInvoicesHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<'organizations'>;
    status?: 'PENDING' | 'PROCESSING' | 'PAID' | 'CANCELLED';
    periodStart?: number;
    periodEnd?: number;
    limit?: number;
    offset?: number;
  }
) => {
  let query;

  // Use the most selective index based on provided filters
  if (args.organizationId && args.status) {
    query = ctx.db
      .query('payoutInvoices')
      .withIndex('by_organization_status', (q) => q.eq('organizationId', args.organizationId!).eq('status', args.status!));
  } else if (args.organizationId) {
    query = ctx.db.query('payoutInvoices').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
  } else if (args.status) {
    query = ctx.db.query('payoutInvoices').withIndex('by_status', (q) => q.eq('status', args.status!));
  } else {
    query = ctx.db.query('payoutInvoices').withIndex('by_created_at');
  }

  // Apply additional filters
  const filtered = query.filter((q) => {
    const conditions: any[] = [];

    if (args.periodStart !== undefined) {
      conditions.push(q.gte(q.field('periodStart'), args.periodStart));
    }
    if (args.periodEnd !== undefined) {
      conditions.push(q.lte(q.field('periodEnd'), args.periodEnd));
    }

    return conditions.length > 0 ? q.and(...conditions) : true;
  });

  const results = await filtered.collect();

  // Sort by createdAt descending (most recent first)
  results.sort((a, b) => b.createdAt - a.createdAt);

  const total = results.length;
  const offset = args.offset || 0;
  const limit = args.limit || 50;
  const page = results.slice(offset, offset + limit);

  return {
    invoices: page,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
  };
};
