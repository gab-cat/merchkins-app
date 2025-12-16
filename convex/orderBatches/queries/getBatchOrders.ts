import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission } from '../../helpers';

export const getBatchOrdersArgs = {
  batchId: v.id('orderBatches'),
  status: v.optional(v.union(v.literal('PENDING'), v.literal('PROCESSING'), v.literal('READY'), v.literal('DELIVERED'), v.literal('CANCELLED'))),
  paymentStatus: v.optional(v.union(v.literal('PENDING'), v.literal('DOWNPAYMENT'), v.literal('PAID'), v.literal('REFUNDED'))),
  limit: v.optional(v.number()),
  offset: v.optional(v.number()),
};

export const getBatchOrdersHandler = async (
  ctx: QueryCtx,
  args: {
    batchId: Id<'orderBatches'>;
    status?: 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED';
    paymentStatus?: 'PENDING' | 'DOWNPAYMENT' | 'PAID' | 'REFUNDED';
    limit?: number;
    offset?: number;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const batch = await ctx.db.get(args.batchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  await requireOrganizationPermission(ctx, batch.organizationId, 'MANAGE_ORDERS', 'read');

  // Get all orders for this organization
  const allOrgOrders = await ctx.db
    .query('orders')
    .withIndex('by_organization', (q) => q.eq('organizationId', batch.organizationId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .collect();

  // Filter to only orders that include this batch in their batchIds
  let batchOrders = allOrgOrders.filter((order) => order.batchIds && order.batchIds.includes(args.batchId));

  // Apply additional filters
  if (args.status) {
    batchOrders = batchOrders.filter((o) => o.status === args.status);
  }
  if (args.paymentStatus) {
    batchOrders = batchOrders.filter((o) => o.paymentStatus === args.paymentStatus);
  }

  // Sort by orderDate descending
  batchOrders.sort((a, b) => b.orderDate - a.orderDate);

  // Pagination
  const total = batchOrders.length;
  const offset = args.offset || 0;
  const limit = args.limit || 50;
  const page = batchOrders.slice(offset, offset + limit);

  return {
    orders: page,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
  };
};
