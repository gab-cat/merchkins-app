import { QueryCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, requireOrganizationPermission } from '../../helpers';

export const getBatchesArgs = {
  organizationId: v.id('organizations'),
  includeDeleted: v.optional(v.boolean()),
};

export const getBatchesHandler = async (
  ctx: QueryCtx,
  args: {
    organizationId: Id<'organizations'>;
    includeDeleted?: boolean;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  await requireOrganizationPermission(ctx, args.organizationId, 'MANAGE_ORDERS', 'read');

  let query = ctx.db.query('orderBatches').withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId));

  const batches = await query.collect();

  // Filter deleted batches if needed
  // Note: We still return deleted batches but mark them as deleted for UI display
  const filteredBatches = args.includeDeleted ? batches : batches.filter((batch) => !batch.isDeleted);

  // For deleted batches, we still need to check if they're deleted for the UI
  // The isDeleted flag is already on the batch object

  // Sort by creation date descending (newest first)
  filteredBatches.sort((a, b) => b.createdAt - a.createdAt);

  // Get order counts for each batch
  const batchesWithStats = await Promise.all(
    filteredBatches.map(async (batch) => {
      // Count orders in this batch
      const allOrgOrders = await ctx.db
        .query('orders')
        .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
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
    })
  );

  return batchesWithStats;
};
