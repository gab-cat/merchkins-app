import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateUserExists, logAction, requireOrganizationPermission } from '../../helpers';

export const updateBatchArgs = {
  batchId: v.id('orderBatches'),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  isActive: v.optional(v.boolean()),
};

export const updateBatchHandler = async (
  ctx: MutationCtx,
  args: {
    batchId: Id<'orderBatches'>;
    name?: string;
    description?: string;
    startDate?: number;
    endDate?: number;
    isActive?: boolean;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  const batch = await ctx.db.get(args.batchId);

  if (!batch) {
    throw new Error('Batch not found');
  }

  if (batch.isDeleted) {
    throw new Error('Cannot update deleted batch');
  }

  await requireOrganizationPermission(ctx, batch.organizationId, 'MANAGE_ORDERS', 'update');

  const updates: Record<string, unknown> = {
    updatedAt: Date.now(),
  };

  if (args.name !== undefined) {
    updates.name = args.name;
  }

  if (args.description !== undefined) {
    updates.description = args.description;
  }

  if (args.startDate !== undefined) {
    updates.startDate = args.startDate;
  }

  if (args.endDate !== undefined) {
    updates.endDate = args.endDate;
  }

  if (args.isActive !== undefined) {
    updates.isActive = args.isActive;
  }

  // Validate date range if both dates are being updated
  const finalStartDate = (args.startDate ?? batch.startDate) as number;
  const finalEndDate = (args.endDate ?? batch.endDate) as number;
  if (finalStartDate >= finalEndDate) {
    throw new Error('Start date must be before end date');
  }

  await ctx.db.patch(args.batchId, updates);

  // If date range changed, update batchInfo in orders
  if (args.startDate !== undefined || args.endDate !== undefined || args.name !== undefined) {
    // Query all orders for this organization and filter in memory
    const allOrgOrders = await ctx.db
      .query('orders')
      .withIndex('by_organization', (q) => q.eq('organizationId', batch.organizationId))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect();

    // Filter to only orders that include this batch in their batchIds
    const orders = allOrgOrders.filter((order) => order.batchIds && order.batchIds.includes(args.batchId));

    const updatedBatch = await ctx.db.get(args.batchId);
    if (updatedBatch) {
      for (const order of orders) {
        const batchInfo = order.batchInfo || [];
        const updatedBatchInfo = batchInfo.map((info) =>
          info.id === args.batchId
            ? {
                id: args.batchId,
                name: updatedBatch.name,
              }
            : info
        );

        await ctx.db.patch(order._id, {
          batchInfo: updatedBatchInfo,
          updatedAt: Date.now(),
        });
      }
    }
  }

  // Log action
  await logAction(ctx, 'update_batch', 'DATA_CHANGE', 'MEDIUM', `Updated batch "${batch.name}"`, currentUser._id, batch.organizationId, {
    batchId: args.batchId,
    updatedFields: Object.keys(updates),
  });

  return args.batchId;
};
