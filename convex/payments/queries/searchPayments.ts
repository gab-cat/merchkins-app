import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission } from '../../helpers';

export const searchPaymentsArgs = {
  organizationId: v.optional(v.id('organizations')),
  query: v.optional(v.string()),
  minAmount: v.optional(v.number()),
  maxAmount: v.optional(v.number()),
  paymentStatus: v.optional(
    v.union(
      v.literal('VERIFIED'),
      v.literal('PENDING'),
      v.literal('DECLINED'),
      v.literal('PROCESSING'),
      v.literal('FAILED'),
      v.literal('REFUND_PENDING'),
      v.literal('REFUNDED'),
      v.literal('CANCELLED')
    )
  ),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
} as const;

export const searchPaymentsHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<'organizations'>;
    query?: string;
    minAmount?: number;
    maxAmount?: number;
    paymentStatus?: 'VERIFIED' | 'PENDING' | 'DECLINED' | 'PROCESSING' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED' | 'CANCELLED';
    limit?: number;
    offset?: number;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  if (args.organizationId) {
    await requireOrganizationPermission(ctx, args.organizationId, 'MANAGE_PAYMENTS', 'read');
  } else if (!currentUser.isAdmin && !currentUser.isStaff) {
    throw new Error('Permission denied');
  }
  // Start from org or global scope
  let query = args.organizationId
    ? ctx.db.query('payments').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!))
    : ctx.db.query('payments').withIndex('by_isDeleted', (q) => q.eq('isDeleted', false));

  const filtered = query.filter((q) => {
    const cond: any[] = [q.eq(q.field('isDeleted'), false)];
    if (args.paymentStatus) cond.push(q.eq(q.field('paymentStatus'), args.paymentStatus));
    if (args.minAmount !== undefined) cond.push(q.gte(q.field('amount'), args.minAmount));
    if (args.maxAmount !== undefined) cond.push(q.lte(q.field('amount'), args.maxAmount));
    if (args.query) {
      const _qstr = args.query.toLowerCase();
      cond.push(
        q.or(
          q.eq(q.field('referenceNo'), args.query),
          q.eq(q.field('transactionId'), args.query),
          q.eq(q.field('orderInfo.orderNumber'), args.query),
          q.eq(q.field('userInfo.email'), args.query),
          q.eq(q.field('orderInfo.customerEmail'), args.query)
        )
      );
    }
    return q.and(...cond);
  });

  const results = await filtered.collect();
  const total = results.length;
  const offset = args.offset || 0;
  const limit = args.limit || 50;
  const page = results.slice(offset, offset + limit);

  return { payments: page, total, offset, limit, hasMore: offset + limit < total };
};
