import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission } from '../../helpers';

export const getPaymentsArgs = {
  organizationId: v.optional(v.id('organizations')),
  orderId: v.optional(v.id('orders')),
  userId: v.optional(v.id('users')),
  processedById: v.optional(v.id('users')),
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
  paymentMethod: v.optional(v.literal('XENDIT')),
  dateFrom: v.optional(v.number()),
  dateTo: v.optional(v.number()),
  includeDeleted: v.optional(v.boolean()),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
} as const;

export const getPaymentsHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId?: Id<'organizations'>;
    orderId?: Id<'orders'>;
    userId?: Id<'users'>;
    processedById?: Id<'users'>;
    paymentStatus?: 'VERIFIED' | 'PENDING' | 'DECLINED' | 'PROCESSING' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED' | 'CANCELLED';
    paymentMethod?: 'XENDIT';
    dateFrom?: number;
    dateTo?: number;
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  if (args.organizationId) {
    await requireOrganizationPermission(ctx, args.organizationId, 'MANAGE_PAYMENTS', 'read');
  } else if (!currentUser.isAdmin && !currentUser.isStaff && currentUser._id !== args.userId) {
    // Allow personal payments via userId filter if not staff/admin
    throw new Error('Permission denied');
  }
  let query;

  if (args.orderId) {
    query = ctx.db.query('payments').withIndex('by_order', (q) => q.eq('orderId', args.orderId!));
  } else if (args.userId) {
    query = ctx.db.query('payments').withIndex('by_user', (q) => q.eq('userId', args.userId!));
  } else if (args.processedById) {
    query = ctx.db.query('payments').withIndex('by_processedBy', (q) => q.eq('processedById', args.processedById!));
  } else if (args.organizationId) {
    query = ctx.db.query('payments').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId!));
  } else if (args.paymentStatus) {
    query = ctx.db.query('payments').withIndex('by_payment_status', (q) => q.eq('paymentStatus', args.paymentStatus!));
  } else if (args.dateFrom || args.dateTo) {
    query = ctx.db.query('payments').withIndex('by_payment_date');
  } else {
    query = ctx.db.query('payments').withIndex('by_isDeleted', (q) => q.eq('isDeleted', false));
  }

  const filtered = query.filter((q) => {
    const cond = [];
    if (!args.includeDeleted) {
      cond.push(q.eq(q.field('isDeleted'), false));
    }
    if (args.paymentStatus) {
      cond.push(q.eq(q.field('paymentStatus'), args.paymentStatus));
    }
    if (args.paymentMethod) {
      cond.push(q.eq(q.field('paymentMethod'), args.paymentMethod));
    }
    if (args.dateFrom !== undefined) {
      cond.push(q.gte(q.field('paymentDate'), args.dateFrom));
    }
    if (args.dateTo !== undefined) {
      cond.push(q.lte(q.field('paymentDate'), args.dateTo));
    }
    return cond.length > 0 ? q.and(...cond) : q.and();
  });

  const results = await filtered.collect();
  const total = results.length;
  const offset = args.offset || 0;
  const limit = args.limit || 50;
  const page = results.slice(offset, offset + limit);

  return {
    payments: page,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
  };
};
