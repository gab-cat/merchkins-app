import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission } from '../../helpers';

export const getBatchByIdArgs = {
  batchId: v.id('orderBatches'),
};

export const getBatchByIdHandler = async (
  ctx: QueryCtx,
  args: {
    batchId: Id<'orderBatches'>;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const batch = await ctx.db.get(args.batchId);

  if (!batch) {
    return null;
  }

  await requireOrganizationPermission(ctx, batch.organizationId, 'MANAGE_ORDERS', 'read');

  // Get order counts for this batch
  const allOrgOrders = await ctx.db
    .query('orders')
    .withIndex('by_organization', (q) => q.eq('organizationId', batch.organizationId))
    .filter((q) => q.eq(q.field('isDeleted'), false))
    .collect();

  const batchOrders = allOrgOrders.filter((order) => order.batchIds && order.batchIds.includes(batch._id));

  const stats = {
    total: batchOrders.length,
    pending: batchOrders.filter((o) => o.status === 'PENDING').length,
    processing: batchOrders.filter((o) => o.status === 'PROCESSING').length,
    ready: batchOrders.filter((o) => o.status === 'READY').length,
    delivered: batchOrders.filter((o) => o.status === 'DELIVERED').length,
    cancelled: batchOrders.filter((o) => o.status === 'CANCELLED').length,
  };

  return {
    ...batch,
    stats,
  };
};
