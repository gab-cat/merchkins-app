import { MutationCtx } from '../../_generated/server';
import { v } from 'convex/values';
import { Id } from '../../_generated/dataModel';
import { requireAuthentication, validateOrganizationExists, logAction, requireOrganizationPermission } from '../../helpers';

export const createBatchArgs = {
  organizationId: v.id('organizations'),
  name: v.string(),
  description: v.optional(v.string()),
  startDate: v.number(),
  endDate: v.number(),
  isActive: v.optional(v.boolean()),
};

export const createBatchHandler = async (
  ctx: MutationCtx,
  args: {
    organizationId: Id<'organizations'>;
    name: string;
    description?: string;
    startDate: number;
    endDate: number;
    isActive?: boolean;
  }
) => {
  const currentUser = await requireAuthentication(ctx);
  await validateOrganizationExists(ctx, args.organizationId);
  await requireOrganizationPermission(ctx, args.organizationId, 'MANAGE_ORDERS', 'create');

  // Validate date range
  if (args.startDate >= args.endDate) {
    throw new Error('Start date must be before end date');
  }

  const now = Date.now();
  const batchId = await ctx.db.insert('orderBatches', {
    organizationId: args.organizationId,
    name: args.name,
    description: args.description,
    startDate: args.startDate,
    endDate: args.endDate,
    isActive: args.isActive ?? true,
    isDeleted: false,
    createdById: currentUser._id,
    createdAt: now,
    updatedAt: now,
  });

  // Auto-assign orders in date range
  // Find all orders for this organization where orderDate falls within range
  const orders = await ctx.db
    .query('orders')
    .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
    .filter((q) => q.and(q.eq(q.field('isDeleted'), false), q.gte(q.field('orderDate'), args.startDate), q.lte(q.field('orderDate'), args.endDate)))
    .collect();

  // Update orders to include this batch
  for (const order of orders) {
    const existingBatchIds = order.batchIds || [];
    if (!existingBatchIds.includes(batchId)) {
      // Get batch info for embedding
      const batch = await ctx.db.get(batchId);
      if (batch) {
        const updatedBatchIds = [...existingBatchIds, batchId];
        const updatedBatchInfo = [
          ...(order.batchInfo || []),
          {
            id: batchId,
            name: batch.name,
          },
        ];

        await ctx.db.patch(order._id, {
          batchIds: updatedBatchIds,
          batchInfo: updatedBatchInfo,
          updatedAt: now,
        });
      }
    }
  }

  // Log action
  await logAction(
    ctx,
    'create_batch',
    'DATA_CHANGE',
    'MEDIUM',
    `Created batch "${args.name}" for organization`,
    currentUser._id,
    args.organizationId,
    {
      batchId,
      name: args.name,
      startDate: args.startDate,
      endDate: args.endDate,
      ordersAssigned: orders.length,
    }
  );

  return batchId;
};
